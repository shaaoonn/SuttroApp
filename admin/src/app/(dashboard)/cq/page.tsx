export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CQCollectionsTable from './CQCollectionsTable';

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

async function getCQCollections() {
  const { data } = await supabaseAdmin
    .from('cq_collections')
    .select('*, creative_questions(count)')
    .order('created_at', { ascending: false });
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    subject_id: row.subject_id as string,
    subject_bn: row.subject_bn as string,
    subjectBn: SUBJECT_LABELS[row.subject_id as string] || (row.subject_id as string),
    class_level: row.class_level as number,
    is_published: row.is_published as boolean,
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
        <Link href="/cq/new" className="admin-btn-primary">
          + নতুন কালেকশন
        </Link>
      </div>

      <CQCollectionsTable collections={collections} />
    </div>
  );
}
