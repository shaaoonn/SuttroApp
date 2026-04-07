import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';

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

  // Also track as activity
  await sb.from('user_activity').insert({
    user_id: user.id,
    event_type: 'exam_completed',
    content_type: 'exam',
    content_id: examPaperId,
    metadata: { score, totalMarks, correctCount, wrongCount, skippedCount },
  });

  return NextResponse.json({ ok: true });
}
