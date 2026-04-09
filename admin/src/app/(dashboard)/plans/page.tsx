export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase-admin';
import PlansManager from './PlansManager';

async function getPlans() {
  const { data } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

async function getPaymentStats() {
  const { count: totalPayments } = await supabaseAdmin
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const { data: revenueData } = await supabaseAdmin
    .from('payments')
    .select('amount_bdt')
    .eq('status', 'completed');

  const totalRevenue = (revenueData ?? []).reduce((sum, p) => sum + (p.amount_bdt || 0), 0);

  return { totalPayments: totalPayments ?? 0, totalRevenue };
}

export default async function PlansPage() {
  const [plans, stats] = await Promise.all([getPlans(), getPaymentStats()]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--admin-muted)' }}>মোট পেমেন্ট</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>{stats.totalPayments}</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--admin-muted)' }}>মোট আয়</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>৳{Math.round(stats.totalRevenue / 100)}</p>
        </div>
      </div>

      <PlansManager initialPlans={plans} />
    </div>
  );
}
