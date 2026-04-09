import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: progress } = await supabase
    .from('user_chapter_progress')
    .select('subject_id, chapter_num, mcq_attempted, mcq_correct, mastery_pct, videos_watched, sims_used, last_activity')
    .eq('user_id', user.id)
    .order('last_activity', { ascending: false });

  // Aggregate per-subject totals
  const subjects: Record<string, {
    attempted: number;
    correct: number;
    mastery: number;
    chapters: number;
    lastActivity: string | null;
  }> = {};

  for (const row of progress ?? []) {
    if (!subjects[row.subject_id]) {
      subjects[row.subject_id] = { attempted: 0, correct: 0, mastery: 0, chapters: 0, lastActivity: null };
    }
    const s = subjects[row.subject_id];
    s.attempted += row.mcq_attempted;
    s.correct += row.mcq_correct;
    s.chapters++;
    s.mastery += Number(row.mastery_pct);
    if (!s.lastActivity || (row.last_activity && row.last_activity > s.lastActivity)) {
      s.lastActivity = row.last_activity;
    }
  }

  // Calculate avg mastery per subject
  const subjectSummary = Object.entries(subjects).map(([id, s]) => ({
    subjectId: id,
    avgMastery: s.chapters > 0 ? Math.round(s.mastery / s.chapters) : 0,
    totalAttempted: s.attempted,
    totalCorrect: s.correct,
    chaptersStudied: s.chapters,
    lastActivity: s.lastActivity,
  }));

  return NextResponse.json({
    chapters: progress ?? [],
    subjects: subjectSummary,
  });
}
