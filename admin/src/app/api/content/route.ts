import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// ─────────────────────────────────────────────
// GET /api/content — List existing content for
// dropdown selection in the daily lesson form.
//
// Query params:
//   type     = 'video' | 'exam' | 'simulation'
//   subject  = 'physics' | 'chemistry' | ...  (optional filter)
//   class    = 9 | 10                          (optional filter)
//   q        = search query                    (optional)
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const type = req.nextUrl.searchParams.get('type');
  const subject = req.nextUrl.searchParams.get('subject');
  const classLevel = req.nextUrl.searchParams.get('class');
  const query = req.nextUrl.searchParams.get('q');

  if (!type) {
    return NextResponse.json({ error: 'type param required' }, { status: 400 });
  }

  try {
    if (type === 'video') {
      let q = supabase
        .from('class_recordings')
        .select('slug, title, subject_id, chapter_num, class_level, date_label, duration, youtube_id, hls_src, created_at')
        .order('created_at', { ascending: false });

      if (subject) q = q.eq('subject_id', subject);
      if (classLevel) q = q.eq('class_level', Number(classLevel));
      if (query) q = q.ilike('title', `%${query}%`);

      const { data, error } = await q.limit(100);
      if (error) throw error;

      return NextResponse.json({
        items: (data || []).map(v => ({
          id: v.slug,
          title: v.title,
          subject_id: v.subject_id,
          chapter_num: v.chapter_num,
          class_level: v.class_level,
          date_label: v.date_label,
          duration: v.duration,
          has_video: !!(v.youtube_id || v.hls_src),
          created_at: v.created_at,
        })),
      });
    }

    if (type === 'exam') {
      let q = supabase
        .from('exam_papers')
        .select('id, title, subject_id, year, board, class_level, total_marks, duration, created_at')
        .order('created_at', { ascending: false });

      if (subject) q = q.eq('subject_id', subject);
      if (classLevel) q = q.eq('class_level', Number(classLevel));
      if (query) q = q.ilike('title', `%${query}%`);

      const { data, error } = await q.limit(100);
      if (error) throw error;

      return NextResponse.json({
        items: (data || []).map(e => ({
          id: e.id,
          title: e.title,
          subject_id: e.subject_id,
          chapter_num: null,
          class_level: e.class_level,
          year: e.year,
          board: e.board,
          total_marks: e.total_marks,
          duration: e.duration,
          created_at: e.created_at,
        })),
      });
    }

    // For types without a dedicated table, return empty
    return NextResponse.json({ items: [] });
  } catch (err) {
    console.error('[content API]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch content' },
      { status: 500 },
    );
  }
}
