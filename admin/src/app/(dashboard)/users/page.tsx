export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import SyncSheetsButton from '@/components/SyncSheetsButton';

async function getUsers() {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return data ?? [];
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          মোট {users.length}+ ইউজার
        </p>
        <SyncSheetsButton />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>নাম</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>ফোন</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শ্রেণি</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সাবস্ক্রিপশন</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>যোগদান</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: Record<string, unknown>) => (
                <tr
                  key={u.id as string}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {(u.name as string) || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {(u.phone as string) || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(u.class_level as string) || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{
                        background: (u.subscription_plan as string) === 'premium' ? '#dbeafe' : '#f1f5f9',
                        color: (u.subscription_plan as string) === 'premium' ? '#2563eb' : '#64748b',
                      }}
                    >
                      {(u.subscription_plan as string) || 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--admin-muted)' }}>
                    {u.created_at ? new Date(u.created_at as string).toLocaleDateString('bn-BD') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${u.id}`}
                      className="text-sm font-medium"
                      style={{ color: 'var(--admin-primary)' }}
                    >
                      বিস্তারিত
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
