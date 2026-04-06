export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: user }, { data: attempts }, { data: activity }] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('exam_attempts')
      .select('*')
      .eq('user_id', id)
      .order('completed_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('user_activity')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4">ইউজার প্রোফাইল</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span style={{ color: 'var(--admin-muted)' }}>নাম:</span>
            <span className="ml-2 font-medium">{user.name || '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--admin-muted)' }}>ফোন:</span>
            <span className="ml-2 font-mono">{user.phone || '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--admin-muted)' }}>শ্রেণি:</span>
            <span className="ml-2">{user.class_level || '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--admin-muted)' }}>সাবস্ক্রিপশন:</span>
            <span className="ml-2">{user.subscription_plan || 'free'}</span>
          </div>
        </div>
      </div>

      {/* Exam attempts */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4">পরীক্ষার ফলাফল</h2>
        {(attempts ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>কোনো পরীক্ষা দেয়নি এখনো।</p>
        ) : (
          <div className="space-y-2">
            {(attempts ?? []).map((a: Record<string, unknown>) => (
              <div
                key={a.id as string}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <span className="text-sm font-medium">{a.exam_paper_id as string}</span>
                  <span className="text-sm ml-3" style={{ color: 'var(--admin-muted)' }}>
                    {a.score as number}/{a.total_marks as number}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                  {a.completed_at ? new Date(a.completed_at as string).toLocaleDateString('bn-BD') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4">কার্যকলাপ</h2>
        {(activity ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>কোনো কার্যকলাপ নেই।</p>
        ) : (
          <div className="space-y-1">
            {(activity ?? []).map((a: Record<string, unknown>) => (
              <div
                key={a.id as string}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--admin-border)' }}
              >
                <span className="text-sm">
                  {a.event_type as string} — {a.content_type as string}
                </span>
                <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                  {a.created_at ? new Date(a.created_at as string).toLocaleString('bn-BD') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
