import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
};

async function getCQCollections() {
  const { data } = await supabaseAdmin
    .from('cq_collections')
    .select('*, creative_questions(count)')
    .order('created_at', { ascending: false });
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    subjectBn: SUBJECT_LABELS[row.subject_id as string] || row.subject_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questionCount: (row.creative_questions as any)?.[0]?.count ?? 0,
  }));
}

export default async function CQPage() {
  const collections = await getCQCollections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          মোট {collections.length}টি কালেকশন
        </p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বিষয়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শ্রেণি</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>প্রশ্ন সংখ্যা</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c: Record<string, unknown>) => (
                <tr
                  key={c.id as string}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <td className="px-4 py-3 text-sm font-mono">{c.id as string}</td>
                  <td className="px-4 py-3 text-sm">{c.subjectBn as string}</td>
                  <td className="px-4 py-3 text-sm">{c.class_level as string}</td>
                  <td className="px-4 py-3 text-sm">{c.questionCount as number}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{
                        background: (c.is_published as boolean) ? '#dcfce7' : '#fef2f2',
                        color: (c.is_published as boolean) ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {(c.is_published as boolean) ? 'প্রকাশিত' : 'ড্রাফট'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cq/${c.id}`}
                      className="text-sm font-medium"
                      style={{ color: 'var(--admin-primary)' }}
                    >
                      এডিট
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
