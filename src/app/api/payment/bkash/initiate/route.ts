import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPayment } from '@/lib/bkash';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId } = await req.json();

    if (!planId || !['premium', 'pro'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const amountBDT = plan.price_bdt / 100; // stored in paisa, bKash needs taka
    const invoiceNumber = `SUTTRO-${user.id.slice(0, 8)}-${Date.now()}`;

    // Create payment record in DB
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount_bdt: plan.price_bdt,
        gateway: 'bkash',
        status: 'pending',
      })
      .select('id')
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Create bKash payment
    const bkashResponse = await createPayment(amountBDT, invoiceNumber, payment.id);

    // Store bKash payment ID
    await supabase
      .from('payments')
      .update({ gateway_payment_id: bkashResponse.paymentID })
      .eq('id', payment.id);

    return NextResponse.json({
      bkashURL: bkashResponse.bkashURL,
      paymentID: bkashResponse.paymentID,
    });
  } catch (err) {
    console.error('bKash initiate error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
