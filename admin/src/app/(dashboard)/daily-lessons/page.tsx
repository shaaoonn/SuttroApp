export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DailyLessonsTable from './DailyLessonsTable';

async function getLessons() {
  const { data } = await supabaseAdmin
    .from('daily_lessons')
    .select('*, daily_lesson_items(count)')
    .order('lesson_date', { ascending: false });

  return (data ?? []).map((row: any) => ({
    id: row.id,
    lesson_date: row.lesson_date,
    title: row.title,
    subject_id: row.subject_id,
    chapter_num: row.chapter_num,
    class_level: row.class_level,
    total_marks: row.total_marks,
    is_published: row.is_published,
    departments: row.departments || [],
    item_count: row.daily_lesson_items?.[0]?.count ?? 0,
  }));
}

export default async function DailyLessonsPage() {
  const lessons = await getLessons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            মোট {lessons.length}টি আজকের পড়া
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/daily-lessons/reviews" className="admin-btn-outline">
            📋 জমা রিভিউ
          </Link>
          <Link href="/daily-lessons/new" className="admin-btn-primary">
            + নতুন পড়া
          </Link>
        </div>
      </div>
      <DailyLessonsTable lessons={lessons} />
    </div>
  );
}
