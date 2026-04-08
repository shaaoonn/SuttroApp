import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDueCards, getDueCardCount, reviewCard, addWrongAnswersToSRS } from '@/lib/srs';
import { awardXP } from '@/lib/xp';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cards = await getDueCards(supabase, user.id);
  const totalDue = await getDueCardCount(supabase, user.id);

  // Transform cards to include formatted options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatted = cards.map((card: any) => {
    const q = card.mcq_questions as Record<string, unknown>;
    return {
      cardId: card.id,
      questionId: card.question_id,
      question: q?.question,
      options: [
        { label: 'ক', text: q?.option_ka },
        { label: 'খ', text: q?.option_kha },
        { label: 'গ', text: q?.option_ga },
        { label: 'ঘ', text: q?.option_gha },
      ],
      correct: q?.correct,
      explanation: q?.explanation,
      repetitions: card.repetitions,
      interval: card.interval_days,
    };
  });

  return NextResponse.json({ cards: formatted, totalDue });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Handle adding wrong answers from exam
  if (body.action === 'add_wrong' && body.questionIds) {
    await addWrongAnswersToSRS(supabase, user.id, body.questionIds);
    return NextResponse.json({ ok: true, added: body.questionIds.length });
  }

  const { cardId, quality } = body;

  if (cardId === undefined || quality === undefined) {
    return NextResponse.json({ error: 'cardId and quality required' }, { status: 400 });
  }

  const result = await reviewCard(supabase, user.id, cardId, quality);

  if (!result) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // Check if all cards for today are done
  const remaining = await getDueCardCount(supabase, user.id);
  if (remaining === 0) {
    await awardXP(supabase, user.id, 'srs_review_complete');
  }

  return NextResponse.json({ ...result, remaining });
}
