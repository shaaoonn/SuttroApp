// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export type PlanId = string; // Dynamic — no longer restricted to 'free' | 'premium' | 'pro'

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
  [key: string]: unknown;   // Allow custom features from DB
}

const DEFAULT_FREE_FEATURES: PlanFeatures = {
  exams_per_day: 3,
  practice_per_day: 10,
  ai_questions_per_day: 3,
  videos: 5,
  ads: true,
};

// Cache plan data from DB (refreshed every 5 minutes)
let planCache: { data: Map<string, { name_bn: string; features: PlanFeatures }>; expiresAt: number } | null = null;

async function loadPlans(supabase: SupabaseClient): Promise<Map<string, { name_bn: string; features: PlanFeatures }>> {
  // Return cache if fresh
  if (planCache && Date.now() < planCache.expiresAt) {
    return planCache.data;
  }

  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('id, name_bn, features')
    .eq('is_active', true);

  const map = new Map<string, { name_bn: string; features: PlanFeatures }>();

  // Always have a free fallback
  map.set('free', { name_bn: 'ফ্রি', features: DEFAULT_FREE_FEATURES });

  if (plans) {
    for (const p of plans) {
      map.set(p.id, {
        name_bn: p.name_bn,
        features: { ...DEFAULT_FREE_FEATURES, ...p.features },
      });
    }
  }

  planCache = { data: map, expiresAt: Date.now() + 5 * 60 * 1000 };
  return map;
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

  // Load features from DB
  const plans = await loadPlans(supabase);

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

      const freePlan = plans.get('free')!;
      return {
        plan: 'free',
        planName: freePlan.name_bn,
        isActive: true,
        expiresAt: null,
        features: freePlan.features,
      };
    }
  }

  const planData = plans.get(plan) ?? plans.get('free')!;
  return {
    plan,
    planName: planData.name_bn,
    isActive: true,
    expiresAt,
    features: planData.features,
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
