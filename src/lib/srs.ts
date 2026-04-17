// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// SM-2 Spaced Repetition Algorithm
// quality: 0-5 (0=complete blackout, 5=perfect recall)
export function sm2(
  quality: number,
  easeFactor: number,
  interval: number,
  repetitions: number
): { easeFactor: number; interval: number; repetitions: number } {
  // Clamp quality to valid range 0-5
  quality = Math.max(0, Math.min(5, Math.round(quality)));
  let newEF = easeFactor;
  let newInterval = interval;
  let newReps = repetitions;

  if (quality >= 3) {
    // Correct answer
    if (newReps === 0) {
      newInterval = 1;
    } else if (newReps === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newReps += 1;
  } else {
    // Wrong answer — reset
    newReps = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  return { easeFactor: newEF, interval: newInterval, repetitions: newReps };
}

export async function getDueCards(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('srs_cards')
    .select(`
      id, question_id, ease_factor, interval_days, repetitions, next_review,
      mcq_questions (
        id, question, option_ka, option_kha, option_ga, option_gha,
        correct, explanation, exam_paper_id,
        exam_papers ( subject_id, subject_bn )
      )
    `)
    .eq('user_id', userId)
    .lte('next_review', today)
    .order('next_review', { ascending: true })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function getDueCardCount(
  supabase: SupabaseClient,
  userId: string
) {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('srs_cards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review', today);

  return count ?? 0;
}

export async function reviewCard(
  supabase: SupabaseClient,
  userId: string,
  cardId: number,
  quality: number // 0-5
) {
  const { data: card } = await supabase
    .from('srs_cards')
    .select('*')
    .eq('id', cardId)
    .eq('user_id', userId)
    .single();

  if (!card) return null;

  const result = sm2(quality, card.ease_factor, card.interval_days, card.repetitions);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + result.interval);

  await supabase
    .from('srs_cards')
    .update({
      ease_factor: result.easeFactor,
      interval_days: result.interval,
      repetitions: result.repetitions,
      next_review: nextReview.toISOString().split('T')[0],
      last_reviewed: new Date().toISOString(),
    })
    .eq('id', cardId);

  return result;
}

export async function addWrongAnswersToSRS(
  supabase: SupabaseClient,
  userId: string,
  wrongQuestionIds: number[]
) {
  if (wrongQuestionIds.length === 0) return;

  const cards = wrongQuestionIds.map((qId) => ({
    user_id: userId,
    question_id: qId,
    next_review: new Date().toISOString().split('T')[0],
  }));

  await supabase
    .from('srs_cards')
    .upsert(cards, { onConflict: 'user_id,question_id', ignoreDuplicates: true });
}

export async function getTotalReviewCount(
  supabase: SupabaseClient,
  userId: string
) {
  const { count } = await supabase
    .from('srs_cards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('repetitions', 0);

  return count ?? 0;
}
