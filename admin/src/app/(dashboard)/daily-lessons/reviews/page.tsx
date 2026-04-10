export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase-admin';
import ReviewsClient from './ReviewsClient';

async function getPendingSubmissions() {
  // Fetch submissions that need review (written/photo answers without marks)
  const { data } = await supabaseAdmin
    .from('daily_submissions')
    .select(`
      *,
      daily_lesson_items!inner(
        id, title, category, item_type, marks,
        daily_lessons!inner(id, lesson_date, title)
      )
    `)
    .is('marks_given', null)
    .eq('is_completed', true)
    .not('text_answer', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(100);

  // Also fetch photo submissions
  const { data: photoSubs } = await supabaseAdmin
    .from('daily_submissions')
    .select(`
      *,
      daily_lesson_items!inner(
        id, title, category, item_type, marks,
        daily_lessons!inner(id, lesson_date, title)
      )
    `)
    .is('marks_given', null)
    .eq('is_completed', true)
    .not('photo_urls', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(100);

  // Merge and deduplicate
  const allSubs = [...(data || []), ...(photoSubs || [])];
  const unique = new Map();
  for (const s of allSubs) {
    unique.set(s.id, s);
  }

  // Get user profiles for display
  const userIds = [...new Set(Array.from(unique.values()).map((s: any) => s.user_id))];
  let profiles: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('id, name, phone, class_level')
      .in('id', userIds);

    if (profileData) {
      for (const p of profileData) {
        profiles[p.id] = p;
      }
    }
  }

  return Array.from(unique.values()).map((s: any) => ({
    ...s,
    student: profiles[s.user_id] || { name: 'অজানা', phone: '', class_level: 10 },
  }));
}

async function getReviewedSubmissions() {
  const { data } = await supabaseAdmin
    .from('daily_submissions')
    .select(`
      *,
      daily_lesson_items!inner(
        id, title, category, item_type, marks,
        daily_lessons!inner(id, lesson_date, title)
      )
    `)
    .not('marks_given', 'is', null)
    .order('reviewed_at', { ascending: false })
    .limit(50);

  const userIds = [...new Set((data || []).map((s: any) => s.user_id))];
  let profiles: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('id, name, phone')
      .in('id', userIds);
    if (profileData) for (const p of profileData) profiles[p.id] = p;
  }

  return (data || []).map((s: any) => ({
    ...s,
    student: profiles[s.user_id] || { name: 'অজানা', phone: '' },
  }));
}

export default async function ReviewsPage() {
  const [pending, reviewed] = await Promise.all([
    getPendingSubmissions(),
    getReviewedSubmissions(),
  ]);

  return <ReviewsClient pending={pending} reviewed={reviewed} />;
}
