import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ClassesTable from './ClassesTable';

// ─────────────────────────────────────────────
// Classes list — all class recordings
// ─────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

async function getClasses() {
  const { data } = await supabaseAdmin
    .from('class_recordings')
    .select('*')
    .order('created_at', { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    subjectBn: SUBJECT_LABELS[row.subject_id] || row.subject_id,
  }));
}

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          মোট {classes.length}টি ক্লাস
        </p>
        <Link href="/classes/new" className="admin-btn-primary">
          + নতুন ক্লাস
        </Link>
      </div>
      <ClassesTable classes={classes} />
    </div>
  );
}
