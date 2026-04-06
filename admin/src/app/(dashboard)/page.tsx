export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ─────────────────────────────────────────────
// Admin Dashboard — overview stats + quick links
// ─────────────────────────────────────────────

async function getStats() {
  const [classes, exams, mcqs, cqs, users] = await Promise.all([
    supabaseAdmin.from('class_recordings').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('exam_papers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('mcq_questions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('creative_questions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  return {
    classes: classes.count ?? 0,
    exams: exams.count ?? 0,
    mcqs: mcqs.count ?? 0,
    cqs: cqs.count ?? 0,
    users: users.count ?? 0,
  };
}

async function getRecentActivity() {
  const { data } = await supabaseAdmin
    .from('user_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  return data ?? [];
}

export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()]);

  const STAT_CARDS = [
    { label: 'ক্লাস', value: stats.classes, icon: '📹', href: '/classes', color: '#2563eb' },
    { label: 'MCQ পরীক্ষা', value: stats.exams, icon: '📝', href: '/exams', color: '#7c3aed' },
    { label: 'MCQ প্রশ্ন', value: stats.mcqs, icon: '❓', href: '/exams', color: '#059669' },
    { label: 'সৃজনশীল', value: stats.cqs, icon: '📖', href: '/cq', color: '#d97706' },
    { label: 'ইউজার', value: stats.users, icon: '👤', href: '/users', color: '#dc2626' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="admin-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4">দ্রুত কাজ</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/classes/new" className="admin-btn-primary">+ নতুন ক্লাস</Link>
          <Link href="/exams/new" className="admin-btn-primary">+ নতুন পরীক্ষা</Link>
          <Link href="/questions/import" className="admin-btn-outline">CSV ইম্পোর্ট</Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4">সাম্প্রতিক কার্যকলাপ</h2>
        {activity.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            এখনো কোনো কার্যকলাপ নেই।
          </p>
        ) : (
          <div className="space-y-2">
            {activity.map((a: Record<string, string>) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--admin-border)' }}
              >
                <div>
                  <span className="text-sm font-medium">{a.event_type}</span>
                  <span className="text-sm ml-2" style={{ color: 'var(--admin-muted)' }}>
                    {a.content_type} — {a.content_id}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                  {new Date(a.created_at).toLocaleString('bn-BD')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
