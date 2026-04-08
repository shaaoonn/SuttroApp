import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardXP } from '@/lib/xp';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().split('T')[0];

  // Get or create today's challenge
  let { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', today)
    .single();

  if (!challenge) {
    // Generate today's challenge — pick 5 random questions
    const { data: questions } = await supabase
      .from('mcq_questions')
      .select('id')
      .limit(100);

    if (!questions || questions.length < 5) {
      return NextResponse.json({ error: 'Not enough questions' }, { status: 500 });
    }

    const shuffled = questions.sort(() => Math.random() - 0.5);
    const questionIds = shuffled.slice(0, 5).map((q) => q.id);

    const { data: newChallenge } = await supabase
      .from('daily_challenges')
      .upsert({ challenge_date: today, question_ids: questionIds })
      .select()
      .single();

    challenge = newChallenge;
  }

  if (!challenge) {
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }

  // Fetch the actual questions
  const { data: questions } = await supabase
    .from('mcq_questions')
    .select('id, question, option_ka, option_kha, option_ga, option_gha, correct, explanation')
    .in('id', challenge.question_ids);

  // Sort questions by the order in question_ids
  const ordered = challenge.question_ids.map((id: number) =>
    (questions ?? []).find((q) => q.id === id)
  ).filter(Boolean);

  const formatted = ordered.map((q: Record<string, unknown>) => ({
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
  }));

  // Check if user already completed today's challenge
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  let completed = false;
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const { data: attempt } = await supabase
        .from('daily_challenge_attempts')
        .select('score, total')
        .eq('user_id', user.id)
        .eq('challenge_date', today)
        .single();

      if (attempt) completed = true;
    }
  }

  return NextResponse.json({
    date: today,
    questions: formatted,
    completed,
  });
}

// Submit daily challenge result
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { score, total } = await req.json();
  const today = new Date().toISOString().split('T')[0];

  // Check if already attempted
  const { data: existing } = await supabase
    .from('daily_challenge_attempts')
    .select('score')
    .eq('user_id', user.id)
    .eq('challenge_date', today)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already completed today' }, { status: 409 });
  }

  // Save attempt
  await supabase.from('daily_challenge_attempts').insert({
    user_id: user.id,
    challenge_date: today,
    score,
    total,
  });

  // Award XP
  if (score === total) {
    await awardXP(supabase, user.id, 'daily_challenge_perfect');
  } else {
    await awardXP(supabase, user.id, 'daily_challenge_complete');
  }

  return NextResponse.json({ ok: true, score, total });
}
