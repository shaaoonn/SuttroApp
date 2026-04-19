import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public endpoint - returns active subscription plans for pricing page
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Plans fetch error:', error);
      return NextResponse.json({ error: 'প্ল্যান লোড করতে সমস্যা হয়েছে' }, { status: 500 });
    }

    // Transform DB rows to frontend-friendly format
    const formatted = (plans ?? []).map((p) => ({
      id: p.id,
      name: p.name_bn,
      price: p.price_bdt === 0 ? '৳০' : `৳${Math.round(p.price_bdt / 100)}`,
      priceBDT: Math.round(p.price_bdt / 100),
      period: p.period_text ?? '/মাস',
      highlight: p.highlight ?? false,
      badgeText: p.badge_text ?? '',
      features: p.display_features ?? [],
      cta: p.cta_text ?? 'বিকাশে পে করো',
      durationDays: p.duration_days,
      // Include functional features for canAccess checks
      planFeatures: p.features ?? {},
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('Plans API error:', err);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
