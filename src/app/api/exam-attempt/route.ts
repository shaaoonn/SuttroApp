import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';
import { checkAndAwardBadges } from '@/lib/badges';

export async function POST(request: NextRequest) {
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  // Get authenticated user from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    examPaperId,
    score,
    totalMarks,
    correctCount,
    wrongCount,
    skippedCount,
    durationSeconds,
    answers,
  } = body;

  if (!examPaperId || score === undefined || !totalMarks) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  // Validate types and ranges
  if (typeof score !== 'number' || score < 0) {
    return NextResponse.json({ error: 'invalid score' }, { status: 400 });
  }
  if (typeof totalMarks !== 'number' || totalMarks <= 0) {
    return NextResponse.json({ error: 'invalid totalMarks' }, { status: 400 });
  }

  // Insert exam attempt
  const { error } = await sb.from('exam_attempts').insert({
    user_id: user.id,
    exam_paper_id: examPaperId,
    score,
    total_marks: totalMarks,
    correct_count: correctCount,
    wrong_count: wrongCount,
    skipped_count: skippedCount,
    duration_seconds: durationSeconds,
    answers,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Track as activity
  await sb.from('user_activity').insert({
    user_id: user.id,
    event_type: 'exam_completed',
    content_type: 'exam',
    content_id: examPaperId,
    metadata: { score, totalMarks, correctCount, wrongCount, skippedCount },
  });

  // ── Per-question tracking & chapter progress ──
  // Fetch exam paper subject + all questions for this exam
  const { data: questions } = await sb
    .from('mcq_questions')
    .select('id, correct, chapter_num, exam_paper_id, exam_papers(subject_id)')
    .eq('exam_paper_id', examPaperId)
    .order('question_order');

  if (questions && Array.isArray(answers)) {
    // Record individual question_attempts
    const attemptRows = questions
      .map((q: { id: number; correct: number }, i: number) => {
        const selected = answers[i];
        if (selected === null || selected === undefined) return null;
        return {
          user_id: user.id,
          question_id: q.id,
          selected,
          is_correct: selected === q.correct,
        };
      })
      .filter(Boolean);

    if (attemptRows.length > 0) {
      await sb.from('question_attempts').insert(attemptRows);
    }

    // Aggregate per-chapter stats and update progress
    const chapterStats: Record<string, { subject: string; attempted: number; correct: number }> = {};
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const chNum = q.chapter_num;
      if (!chNum) continue;
      const ep = q.exam_papers as unknown as { subject_id: string }[] | { subject_id: string } | null;
      const subjectId = ep ? (Array.isArray(ep) ? ep[0]?.subject_id : ep.subject_id) : null;
      if (!subjectId) continue;

      const key = `${subjectId}:${chNum}`;
      if (!chapterStats[key]) {
        chapterStats[key] = { subject: subjectId, attempted: 0, correct: 0 };
      }
      if (answers[i] !== null && answers[i] !== undefined) {
        chapterStats[key].attempted++;
        if (answers[i] === q.correct) {
          chapterStats[key].correct++;
        }
      }
    }

    // Call RPC to update each chapter's progress
    for (const [key, stat] of Object.entries(chapterStats)) {
      const [subjectId, chNumStr] = key.split(':');
      await sb.rpc('update_chapter_progress', {
        p_user_id: user.id,
        p_subject_id: subjectId,
        p_chapter_num: Number(chNumStr),
        p_correct: stat.correct,
        p_attempted: stat.attempted,
      });
    }
  }

  // ── Badge check ──
  const { count: examCount } = await sb
    .from('exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: statsRow } = await sb
    .from('user_stats')
    .select('total_xp, current_streak')
    .eq('user_id', user.id)
    .single();

  const newBadges = await checkAndAwardBadges(sb, user.id, {
    examCount: examCount ?? 0,
    latestScore: score,
    latestTotal: totalMarks,
    streak: statsRow?.current_streak ?? 0,
    totalXP: statsRow?.total_xp ?? 0,
  });

  return NextResponse.json({
    ok: true,
    badges: newBadges.map((b) => ({ id: b.id, name: b.name_bn, icon: b.icon })),
  });
}
