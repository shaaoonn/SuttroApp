import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';

// ─────────────────────────────────────────────
// Dashboard API - Returns user's progress data
// Requires Authorization header with access token
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  // Authenticate user
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Fetch exam attempts (last 10)
  const { data: examAttempts } = await sb
    .from('exam_attempts')
    .select('id, exam_paper_id, score, total_marks, correct_count, wrong_count, skipped_count, duration_seconds, completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(10);

  // Fetch exam paper titles for the attempts
  const paperIds = [...new Set((examAttempts ?? []).map((a: { exam_paper_id: string }) => a.exam_paper_id))];
  let examTitles: Record<string, string> = {};
  if (paperIds.length > 0) {
    const { data: papers } = await sb
      .from('exam_papers')
      .select('id, title, subject_bn')
      .in('id', paperIds);
    if (papers) {
      examTitles = Object.fromEntries(
        papers.map((p: { id: string; title: string; subject_bn: string }) => [
          p.id,
          `${p.title} - ${p.subject_bn}`,
        ])
      );
    }
  }

  // Count total exams taken
  const { count: totalExams } = await sb
    .from('exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Average score percentage
  let avgScore = 0;
  if (examAttempts && examAttempts.length > 0) {
    const totalPct = examAttempts.reduce(
      (sum: number, a: { score: number; total_marks: number }) =>
        sum + (a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0),
      0,
    );
    avgScore = Math.round(totalPct / examAttempts.length);
  }

  // Recent activity (last 10 events)
  const { data: recentActivity } = await sb
    .from('user_activity')
    .select('event_type, content_type, content_id, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Activity counts by type (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: activityCounts } = await sb
    .from('user_activity')
    .select('event_type')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo);

  const counts = {
    exams_taken: totalExams || 0,
    classes_watched: 0,
    sims_viewed: 0,
    cq_viewed: 0,
  };

  if (activityCounts) {
    activityCounts.forEach((a: { event_type: string }) => {
      if (a.event_type === 'class_opened') counts.classes_watched++;
      if (a.event_type === 'sim_opened') counts.sims_viewed++;
      if (a.event_type === 'cq_viewed') counts.cq_viewed++;
    });
  }

  return NextResponse.json({
    counts,
    avgScore,
    examAttempts: (examAttempts ?? []).map((a: {
      id: string;
      exam_paper_id: string;
      score: number;
      total_marks: number;
      correct_count: number;
      wrong_count: number;
      skipped_count: number;
      duration_seconds: number;
      completed_at: string;
    }) => ({
      id: a.id,
      examPaperId: a.exam_paper_id,
      examTitle: examTitles[a.exam_paper_id] || a.exam_paper_id,
      score: a.score,
      totalMarks: a.total_marks,
      correct: a.correct_count,
      wrong: a.wrong_count,
      skipped: a.skipped_count,
      duration: a.duration_seconds,
      completedAt: a.completed_at,
    })),
    recentActivity: (recentActivity ?? []).map((a: {
      event_type: string;
      content_type: string;
      content_id: string;
      metadata: Record<string, unknown>;
      created_at: string;
    }) => ({
      eventType: a.event_type,
      contentType: a.content_type,
      contentId: a.content_id,
      metadata: a.metadata,
      createdAt: a.created_at,
    })),
  });
}
