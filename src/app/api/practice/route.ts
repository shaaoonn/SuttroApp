import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const subject = req.nextUrl.searchParams.get('subject');
  const chapter = req.nextUrl.searchParams.get('chapter');
  const count = parseInt(req.nextUrl.searchParams.get('count') || '10');

  if (!subject || !chapter) {
    return NextResponse.json({ error: 'subject and chapter required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get random questions for this subject+chapter
  const { data: questions, error } = await supabase
    .from('mcq_questions')
    .select(`
      id, question_order, question,
      option_ka, option_kha, option_ga, option_gha,
      correct, explanation, chapter_num,
      exam_papers!inner ( subject_id )
    `)
    .eq('exam_papers.subject_id', subject)
    .eq('chapter_num', parseInt(chapter))
    .limit(count);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  // Shuffle questions
  const shuffled = (questions ?? []).sort(() => Math.random() - 0.5).slice(0, count);

  // Transform to app format
  const formatted = shuffled.map((q) => ({
    id: q.id,
    question: q.question,
    options: [
      { label: 'ক', text: q.option_ka },
      { label: 'খ', text: q.option_kha },
      { label: 'গ', text: q.option_ga },
      { label: 'ঘ', text: q.option_gha },
    ],
    correct: q.correct,
    explanation: q.explanation,
    chapter_num: q.chapter_num,
  }));

  return NextResponse.json({ questions: formatted, total: formatted.length });
}

// Record practice answer
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { questionId, selected, isCorrect, timeSpentMs } = await req.json();

  // Record attempt
  await supabase.from('question_attempts').insert({
    user_id: user.id,
    question_id: questionId,
    selected,
    is_correct: isCorrect,
    time_spent_ms: timeSpentMs,
  });

  // Update chapter progress
  const { data: question } = await supabase
    .from('mcq_questions')
    .select('chapter_num, exam_papers(subject_id)')
    .eq('id', questionId)
    .single();

  if (question?.chapter_num && question.exam_papers) {
    const ep = question.exam_papers as unknown as { subject_id: string }[] | { subject_id: string };
    const subjectId = Array.isArray(ep) ? ep[0]?.subject_id : ep.subject_id;
    await supabase.rpc('update_chapter_progress', {
      p_user_id: user.id,
      p_subject_id: subjectId,
      p_chapter_num: question.chapter_num,
      p_correct: isCorrect ? 1 : 0,
      p_attempted: 1,
    });
  }

  return NextResponse.json({ ok: true });
}
