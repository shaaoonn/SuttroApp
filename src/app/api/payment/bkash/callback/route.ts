import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { executePayment } from '@/lib/bkash';
import { activateSubscription } from '@/lib/subscription';
import type { PlanId } from '@/lib/subscription';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://suttro.app';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const paymentId = searchParams.get('paymentId');
  const bkashPaymentID = searchParams.get('paymentID');
  const status = searchParams.get('status');

  if (!paymentId) {
    return NextResponse.redirect(`${APP_URL}/payment/failed?reason=missing_payment_id`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Handle cancelled or failed
  if (status === 'cancel' || status === 'failure') {
    await supabase
      .from('payments')
      .update({
        status: status === 'cancel' ? 'cancelled' : 'failed',
        callback_data: { status, bkashPaymentID },
      })
      .eq('id', paymentId);

    return NextResponse.redirect(
      `${APP_URL}/payment/failed?reason=${status === 'cancel' ? 'cancelled' : 'failed'}`
    );
  }

  // Execute payment for successful callback
  if (!bkashPaymentID) {
    return NextResponse.redirect(`${APP_URL}/payment/failed?reason=missing_bkash_id`);
  }

  try {
    // Get payment record first — check idempotency
    const { data: payment } = await supabase
      .from('payments')
      .select('*, subscription_plans(*)')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      return NextResponse.redirect(`${APP_URL}/payment/failed?reason=payment_not_found`);
    }

    // Idempotency: if payment already completed, redirect to success
    if (payment.status === 'completed') {
      return NextResponse.redirect(
        `${APP_URL}/payment/success?plan=${payment.plan_id}&trxId=${payment.gateway_trx_id || ''}`
      );
    }

    const execResult = await executePayment(bkashPaymentID);

    if (execResult.statusCode === '0000' && execResult.transactionStatus === 'Completed') {
      // Payment successful
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          gateway_trx_id: execResult.trxID,
          callback_data: execResult,
          completed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      // Activate subscription
      const durationDays = payment.subscription_plans?.duration_days ?? 30;
      await activateSubscription(supabase, payment.user_id, payment.plan_id as PlanId, durationDays);

      // Log activity
      await supabase.from('user_activity').insert({
        user_id: payment.user_id,
        event_type: 'subscription_activated',
        content_type: 'subscription',
        content_id: payment.plan_id,
        metadata: {
          trx_id: execResult.trxID,
          amount: execResult.amount,
          plan: payment.plan_id,
        },
      });

      return NextResponse.redirect(
        `${APP_URL}/payment/success?plan=${payment.plan_id}&trxId=${execResult.trxID}`
      );
    } else {
      // Payment failed at execution
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          callback_data: execResult,
        })
        .eq('id', paymentId);

      return NextResponse.redirect(
        `${APP_URL}/payment/failed?reason=execution_failed&code=${execResult.statusCode}`
      );
    }
  } catch (err) {
    console.error('bKash callback error:', err);
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        callback_data: { error: err instanceof Error ? err.message : 'Unknown error' },
      })
      .eq('id', paymentId);

    return NextResponse.redirect(`${APP_URL}/payment/failed?reason=server_error`);
  }
}
