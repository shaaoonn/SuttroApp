// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export interface Badge {
  id: string;
  name_bn: string;
  description: string;
  icon: string;
  category: string;
  criteria: { type: string; value?: number; subject?: string };
  xp_reward: number;
}

export interface UserBadge extends Badge {
  earned_at: string;
}

export async function getUserBadges(
  supabase: SupabaseClient,
  userId: string
): Promise<UserBadge[]> {
  const { data } = await supabase
    .from('user_badges')
    .select('earned_at, badges (*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (!data) return [];

  return data.map((ub: Record<string, unknown>) => ({
    ...(ub.badges as Badge),
    earned_at: ub.earned_at as string,
  }));
}

export async function getAllBadges(
  supabase: SupabaseClient
): Promise<Badge[]> {
  const { data } = await supabase
    .from('badges')
    .select('*')
    .order('sort_order');

  return (data ?? []) as Badge[];
}

export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string,
  context: {
    examCount?: number;
    latestScore?: number;
    latestTotal?: number;
    streak?: number;
    totalXP?: number;
    practiceCount?: number;
    srsReviews?: number;
    dailyChallengeScore?: number;
  }
): Promise<Badge[]> {
  // Get all badges the user doesn't have yet
  const { data: allBadges } = await supabase.from('badges').select('*');
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (!allBadges) return [];

  const earnedIds = new Set((userBadges ?? []).map((b: { badge_id: string }) => b.badge_id));
  const newlyEarned: Badge[] = [];

  for (const badge of allBadges as Badge[]) {
    if (earnedIds.has(badge.id)) continue;

    const earned = checkCriteria(badge.criteria, context);
    if (earned) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
      });

      // Award bonus XP for badge
      if (badge.xp_reward > 0) {
        await supabase.from('xp_transactions').insert({
          user_id: userId,
          amount: badge.xp_reward,
          source: 'badge_earned',
          metadata: { badge_id: badge.id },
        });

        // Update total XP
        await supabase.rpc('increment_user_xp', { uid: userId, xp_amount: badge.xp_reward });
      }

      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

function checkCriteria(
  criteria: { type: string; value?: number; subject?: string },
  ctx: {
    examCount?: number;
    latestScore?: number;
    latestTotal?: number;
    streak?: number;
    totalXP?: number;
    practiceCount?: number;
    srsReviews?: number;
    dailyChallengeScore?: number;
  }
): boolean {
  switch (criteria.type) {
    case 'exam_count':
      return (ctx.examCount ?? 0) >= (criteria.value ?? 0);

    case 'perfect_score':
      return ctx.latestScore !== undefined && ctx.latestTotal !== undefined
        && ctx.latestScore === ctx.latestTotal;

    case 'score_above':
      if (ctx.latestScore === undefined || ctx.latestTotal === undefined) return false;
      return (ctx.latestScore / ctx.latestTotal) * 100 >= (criteria.value ?? 80);

    case 'streak':
      return (ctx.streak ?? 0) >= (criteria.value ?? 0);

    case 'total_xp':
      return (ctx.totalXP ?? 0) >= (criteria.value ?? 0);

    case 'practice_count':
      return (ctx.practiceCount ?? 0) >= (criteria.value ?? 0);

    case 'srs_reviews':
      return (ctx.srsReviews ?? 0) >= (criteria.value ?? 0);

    case 'daily_perfect':
      return ctx.dailyChallengeScore === 5;

    default:
      return false;
  }
}
