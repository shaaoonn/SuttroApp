import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Weekly leaderboard (XP earned this week)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: weeklyXP } = await supabase
    .from('xp_transactions')
    .select('user_id, amount')
    .gte('created_at', weekStartStr);

  // Aggregate weekly XP by user
  const weeklyMap = new Map<string, number>();
  for (const tx of weeklyXP ?? []) {
    weeklyMap.set(tx.user_id, (weeklyMap.get(tx.user_id) ?? 0) + tx.amount);
  }

  // Get top 20 by weekly XP
  const weeklyTop = Array.from(weeklyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Get user profiles for top users
  const topUserIds = weeklyTop.map(([id]) => id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', topUserIds.length > 0 ? topUserIds : ['none']);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  // Get all-time stats for these users
  const { data: stats } = await supabase
    .from('user_stats')
    .select('user_id, total_xp, level, current_streak')
    .in('user_id', topUserIds.length > 0 ? topUserIds : ['none']);

  const statsMap = new Map((stats ?? []).map((s) => [s.user_id, s]));

  const weekly = weeklyTop.map(([userId, xp], index) => {
    const name = profileMap.get(userId);
    const stat = statsMap.get(userId);
    return {
      rank: index + 1,
      name: name ? anonymize(name) : 'অজ্ঞাত',
      weeklyXP: xp,
      totalXP: stat?.total_xp ?? 0,
      level: stat?.level ?? 1,
      streak: stat?.current_streak ?? 0,
    };
  });

  // All-time leaderboard
  const { data: allTimeStats } = await supabase
    .from('user_stats')
    .select('user_id, total_xp, level, current_streak')
    .order('total_xp', { ascending: false })
    .limit(20);

  const allTimeUserIds = (allTimeStats ?? []).map((s) => s.user_id);
  const { data: allTimeProfiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', allTimeUserIds.length > 0 ? allTimeUserIds : ['none']);

  const allTimeProfileMap = new Map((allTimeProfiles ?? []).map((p) => [p.id, p.name]));

  const allTime = (allTimeStats ?? []).map((s, index) => ({
    rank: index + 1,
    name: allTimeProfileMap.get(s.user_id) ? anonymize(allTimeProfileMap.get(s.user_id)!) : 'অজ্ঞাত',
    totalXP: s.total_xp,
    level: s.level,
    streak: s.current_streak,
  }));

  return NextResponse.json({ weekly, allTime });
}

function anonymize(name: string): string {
  if (!name || name.length <= 2) return name;
  const parts = name.split(' ');
  if (parts.length === 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
