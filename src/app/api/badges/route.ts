import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserBadges, getAllBadges } from '@/lib/badges';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  // Get all badges
  const allBadges = await getAllBadges(supabase);

  // If authenticated, get user's earned badges
  let earned: string[] = [];
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const userBadges = await getUserBadges(supabase, user.id);
      earned = userBadges.map((b) => b.id);
    }
  }

  return NextResponse.json({
    badges: allBadges.map((b) => ({
      ...b,
      earned: earned.includes(b.id),
    })),
    earnedCount: earned.length,
    totalCount: allBadges.length,
  });
}
