// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// XP amounts for different actions
export const XP_RULES = {
  daily_login: 5,
  practice_question: 2,
  exam_complete: 20,
  exam_high_score: 30,    // 80%+ bonus
  watch_video: 10,
  use_simulation: 5,
  srs_review_complete: 15,
  streak_7_bonus: 50,
  streak_30_bonus: 200,
  streak_100_bonus: 500,
  daily_challenge_complete: 25,
  daily_challenge_perfect: 50,
} as const;

export type XPSource = keyof typeof XP_RULES;

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function xpForNextLevel(currentXP: number): { current: number; needed: number; progress: number } {
  const level = calculateLevel(currentXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return {
    current: currentXP - currentLevelXP,
    needed: nextLevelXP - currentLevelXP,
    progress: Math.min(progress, 100),
  };
}

export async function awardXP(
  supabase: SupabaseClient,
  userId: string,
  source: XPSource,
  amount?: number,
  metadata?: Record<string, unknown>
) {
  const xp = amount ?? XP_RULES[source];
  const today = new Date().toISOString().split('T')[0];

  // Dedup check: prevent duplicate awards for same source+item on same day
  // Sources that should only award once per item per day
  const dedupSources: XPSource[] = ['exam_complete', 'exam_high_score', 'daily_challenge_complete', 'daily_challenge_perfect'];
  if (dedupSources.includes(source) && metadata) {
    const itemKey = metadata.item_id || metadata.exam_paper_id || metadata.challenge_date;
    if (itemKey) {
      const { data: existing } = await supabase
        .from('xp_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('source', source)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .limit(1);
      if (existing && existing.length > 0) {
        // Already awarded today for this source — skip
        const stats = await getUserStats(supabase, userId);
        return { totalXP: stats.total_xp, level: stats.level, streak: stats.current_streak, xpAwarded: 0 };
      }
    }
  }

  // Insert XP transaction
  await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount: xp,
    source,
    metadata: metadata ?? {},
  });

  // Update daily activity
  await supabase.from('daily_activity').upsert(
    { user_id: userId, active_date: today, xp_earned: xp },
    { onConflict: 'user_id,active_date' }
  );

  // Update user_stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (stats) {
    const newTotalXP = stats.total_xp + xp;
    const newLevel = calculateLevel(newTotalXP);
    const lastActive = stats.last_active_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = stats.current_streak;
    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1;
    }

    const longestStreak = Math.max(stats.longest_streak, newStreak);

    await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXP,
        level: newLevel,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
      })
      .eq('user_id', userId);

    return { totalXP: newTotalXP, level: newLevel, streak: newStreak, xpAwarded: xp };
  } else {
    // First time — create stats
    const newLevel = calculateLevel(xp);
    await supabase.from('user_stats').insert({
      user_id: userId,
      total_xp: xp,
      level: newLevel,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    });
    return { totalXP: xp, level: newLevel, streak: 1, xpAwarded: xp };
  }
}

export async function getUserStats(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) {
    return {
      total_xp: 0, level: 1, current_streak: 0, longest_streak: 0,
      last_active_date: null, daily_goal_xp: 50,
    };
  }

  // Check if streak is still valid
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (data.last_active_date && data.last_active_date !== today && data.last_active_date !== yesterdayStr) {
    // Streak broken
    await supabase.from('user_stats').update({ current_streak: 0 }).eq('user_id', userId);
    data.current_streak = 0;
  }

  return data;
}

export async function getTodayXP(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('daily_activity')
    .select('xp_earned')
    .eq('user_id', userId)
    .eq('active_date', today)
    .single();

  return data?.xp_earned ?? 0;
}
