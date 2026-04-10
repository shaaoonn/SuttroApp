import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Daily Scores API — আজকের পড়া স্কোর
// GET: Fetch daily + monthly scores for dashboard
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const token = auth.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.sub;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Bangladesh timezone: UTC+6
  const now = new Date();
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const today = bdTime.toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7); // YYYY-MM

  // Optional month param
  const month = req.nextUrl.searchParams.get('month') || currentMonth;
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-31`;

  // Fetch all scores for the month
  const { data: scores } = await sb
    .from('daily_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('score_date', monthStart)
    .lte('score_date', monthEnd)
    .order('score_date', { ascending: true });

  // Today's score
  const todayScore = (scores || []).find(s => s.score_date === today);

  // Monthly aggregate
  const monthScores = scores || [];
  const monthlyAvg = monthScores.length > 0
    ? Math.round(monthScores.reduce((sum, s) => sum + Number(s.score_pct), 0) / monthScores.length)
    : 0;
  const totalDays = monthScores.length;
  const perfectDays = monthScores.filter(s => Number(s.score_pct) >= 90).length;

  return NextResponse.json({
    today: todayScore || null,
    month: {
      scores: monthScores,
      average: monthlyAvg,
      totalDays,
      perfectDays,
      month,
    },
  });
}
