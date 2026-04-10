import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardXP } from '@/lib/xp';

// ─────────────────────────────────────────────
// আজকের পড়া API — Daily Lesson System
// GET: Fetch today's lesson with items + user progress
// POST: Submit answer for an item
// ─────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  try {
    const token = auth.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// ── GET: Today's lesson ──
export async function GET(req: NextRequest) {
  const sb = getSupabase();
  const userId = getUserId(req);

  // Bangladesh timezone: UTC+6
  const now = new Date();
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const today = bdTime.toISOString().split('T')[0];

  // Check for specific date param (for viewing past lessons)
  const dateParam = req.nextUrl.searchParams.get('date');
  const targetDate = dateParam || today;

  // Get user's class_level from profile (default: 10)
  let classLevel = 10;
  if (userId) {
    const { data: profile } = await sb
      .from('profiles')
      .select('class_level')
      .eq('id', userId)
      .single();
    if (profile?.class_level) {
      classLevel = profile.class_level;
    }
  }

  // Allow override via query param (e.g. ?class=9)
  const classParam = req.nextUrl.searchParams.get('class');
  if (classParam && (classParam === '9' || classParam === '10')) {
    classLevel = parseInt(classParam);
  }

  // Fetch the lesson for the target date filtered by class_level
  const { data: lesson } = await sb
    .from('daily_lessons')
    .select('*')
    .eq('lesson_date', targetDate)
    .eq('is_published', true)
    .eq('class_level', classLevel)
    .single();

  if (!lesson) {
    return NextResponse.json({ lesson: null, classLevel, message: 'আজকের জন্য কোনো পড়া নির্ধারিত হয়নি' });
  }

  // Fetch lesson items
  const { data: items } = await sb
    .from('daily_lesson_items')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('sort_order', { ascending: true });

  // Fetch MCQs for MCQ items
  const mcqItemIds = (items || []).filter(i => i.item_type === 'mcq_set').map(i => i.id);
  let mcqs: Record<number, unknown[]> = {};
  if (mcqItemIds.length > 0) {
    const { data: mcqData } = await sb
      .from('daily_lesson_mcqs')
      .select('*')
      .in('item_id', mcqItemIds)
      .order('sort_order', { ascending: true });

    if (mcqData) {
      for (const m of mcqData) {
        if (!mcqs[m.item_id]) mcqs[m.item_id] = [];
        mcqs[m.item_id].push(m);
      }
    }
  }

  // Fetch user's submissions for this lesson
  let submissions: Record<number, unknown> = {};
  let dailyScore = null;

  if (userId) {
    const itemIds = (items || []).map(i => i.id);
    if (itemIds.length > 0) {
      const { data: subs } = await sb
        .from('daily_submissions')
        .select('*')
        .eq('user_id', userId)
        .in('item_id', itemIds);

      if (subs) {
        for (const s of subs) {
          submissions[s.item_id] = s;
        }
      }
    }

    // Fetch daily score
    const { data: score } = await sb
      .from('daily_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('score_date', targetDate)
      .single();

    dailyScore = score;
  }

  // Build response with items grouped by category
  const itemsWithMcqs = (items || []).map(item => ({
    ...item,
    mcqs: mcqs[item.id] || [],
    submission: submissions[item.id] || null,
  }));

  return NextResponse.json({
    lesson,
    items: itemsWithMcqs,
    dailyScore,
    date: targetDate,
    isToday: targetDate === today,
    classLevel,
  });
}

// ── POST: Submit answer ──
export async function POST(req: NextRequest) {
  const sb = getSupabase();
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { item_id, type, mcq_answers, text_answer, photo_urls, gdrive_file_ids } = body;

  if (!item_id || !type) {
    return NextResponse.json({ error: 'Missing item_id or type' }, { status: 400 });
  }

  // Get the item
  const { data: item } = await sb
    .from('daily_lesson_items')
    .select('*, daily_lessons(*)')
    .eq('id', item_id)
    .single();

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const lesson = item.daily_lessons as { id: string; lesson_date: string };

  // Build submission data
  const submissionData: Record<string, unknown> = {
    user_id: userId,
    item_id,
    is_completed: true,
    submitted_at: new Date().toISOString(),
  };

  if (type === 'mcq') {
    // Auto-grade MCQ answers
    const { data: mcqQuestions } = await sb
      .from('daily_lesson_mcqs')
      .select('*')
      .eq('item_id', item_id)
      .order('sort_order');

    if (!mcqQuestions) {
      return NextResponse.json({ error: 'MCQ questions not found' }, { status: 404 });
    }

    let score = 0;
    const gradedAnswers = mcqQuestions.map((q, idx) => {
      const selected = mcq_answers?.[idx]?.selected ?? -1;
      const isCorrect = selected === q.correct;
      if (isCorrect) score += q.marks;
      return { mcq_id: q.id, selected, is_correct: isCorrect };
    });

    const totalMarks = mcqQuestions.reduce((sum: number, q: { marks: number }) => sum + q.marks, 0);

    submissionData.mcq_answers = gradedAnswers;
    submissionData.mcq_score = score;
    submissionData.mcq_total = totalMarks;
    // For MCQ, marks_given = auto score proportional to item marks
    submissionData.marks_given = item.marks > 0
      ? Math.round((score / totalMarks) * item.marks * 100) / 100
      : null;

  } else if (type === 'text') {
    submissionData.text_answer = text_answer || '';

  } else if (type === 'photo') {
    submissionData.photo_urls = photo_urls || [];
    if (gdrive_file_ids) {
      submissionData.gdrive_file_ids = gdrive_file_ids;
    }

  } else if (type === 'completion') {
    // Just mark as completed (for videos, sims, PDFs)
    submissionData.marks_given = item.marks; // full marks for completion
  }

  // Upsert submission
  const { data: submission, error: subErr } = await sb
    .from('daily_submissions')
    .upsert(submissionData, { onConflict: 'user_id,item_id' })
    .select()
    .single();

  if (subErr) {
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }

  // Recompute daily score
  await sb.rpc('compute_daily_score', {
    p_user_id: userId,
    p_lesson_id: lesson.id,
    p_date: lesson.lesson_date,
  });

  // Award XP for completing items
  if (type === 'mcq' || type === 'completion') {
    try {
      await awardXP(sb, userId, 'daily_challenge_complete', 10, { item_id });
    } catch { /* XP award is best-effort */ }
  }

  return NextResponse.json({
    success: true,
    submission,
    ...(type === 'mcq' ? {
      mcq_score: submissionData.mcq_score,
      mcq_total: submissionData.mcq_total,
    } : {}),
  });
}
