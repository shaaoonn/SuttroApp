// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export type PlanId = 'free' | 'premium' | 'pro';

export interface SubscriptionStatus {
  plan: PlanId;
  planName: string;
  isActive: boolean;
  expiresAt: string | null;
  features: PlanFeatures;
}

export interface PlanFeatures {
  exams_per_day: number;    // -1 = unlimited
  practice_per_day: number;
  ai_questions_per_day: number;
  videos: number;
  ads: boolean;
  certificates?: boolean;
  offline?: boolean;
  priority_support?: boolean;
}

export async function getSubscriptionStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionStatus> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_expires_at')
    .eq('id', userId)
    .single();

  const plan = (profile?.subscription_plan ?? 'free') as PlanId;
  const expiresAt = profile?.subscription_expires_at;

  // Check if expired
  if (plan !== 'free' && expiresAt) {
    const now = new Date();
    const expiry = new Date(expiresAt);
    if (now > expiry) {
      // Subscription expired — revert to free
      await supabase
        .from('profiles')
        .update({ subscription_plan: 'free', subscription_expires_at: null })
        .eq('id', userId);

      return {
        plan: 'free',
        planName: 'ফ্রি',
        isActive: true,
        expiresAt: null,
        features: FREE_FEATURES,
      };
    }
  }

  return {
    plan,
    planName: PLAN_NAMES[plan],
    isActive: true,
    expiresAt,
    features: PLAN_FEATURES[plan],
  };
}

export async function activateSubscription(
  supabase: SupabaseClient,
  userId: string,
  planId: PlanId,
  durationDays: number
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await supabase
    .from('profiles')
    .update({
      subscription_plan: planId,
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId);

  return { plan: planId, expiresAt: expiresAt.toISOString() };
}

export function canAccess(features: PlanFeatures, resource: string, count?: number): boolean {
  switch (resource) {
    case 'exam': return features.exams_per_day === -1 || (count ?? 0) < features.exams_per_day;
    case 'practice': return features.practice_per_day === -1 || (count ?? 0) < features.practice_per_day;
    case 'ai': return features.ai_questions_per_day === -1 || (count ?? 0) < features.ai_questions_per_day;
    case 'video': return features.videos === -1 || (count ?? 0) < features.videos;
    case 'certificate': return features.certificates === true;
    case 'offline': return features.offline === true;
    default: return true;
  }
}

const PLAN_NAMES: Record<PlanId, string> = {
  free: 'ফ্রি',
  premium: 'প্রিমিয়াম',
  pro: 'প্রো',
};

const FREE_FEATURES: PlanFeatures = {
  exams_per_day: 3,
  practice_per_day: 10,
  ai_questions_per_day: 3,
  videos: 5,
  ads: true,
};

const PREMIUM_FEATURES: PlanFeatures = {
  exams_per_day: -1,
  practice_per_day: -1,
  ai_questions_per_day: 20,
  videos: -1,
  ads: false,
  certificates: true,
};

const PRO_FEATURES: PlanFeatures = {
  exams_per_day: -1,
  practice_per_day: -1,
  ai_questions_per_day: 50,
  videos: -1,
  ads: false,
  certificates: true,
  offline: true,
  priority_support: true,
};

const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  free: FREE_FEATURES,
  premium: PREMIUM_FEATURES,
  pro: PRO_FEATURES,
};

export { PLAN_NAMES, PLAN_FEATURES };
