export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ExamsTable from './ExamsTable';

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
};

async function getExams() {
  const { data } = await supabaseAdmin
    .from('exam_papers')
    .select('*, mcq_questions(count)')
    .order('created_at', { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    subjectBn: SUBJECT_LABELS[row.subject_id] || row.subject_id,
    questionCount: row.mcq_questions?.[0]?.count ?? 0,
  }));
}

export default async function ExamsPage() {
  const exams = await getExams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          মোট {exams.length}টি পরীক্ষা
        </p>
        <Link href="/exams/new" className="admin-btn-primary">
          + নতুন পরীক্ষা
        </Link>
      </div>
      <ExamsTable exams={exams} />
    </div>
  );
}
