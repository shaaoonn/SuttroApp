export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DailyLessonForm from '@/components/forms/DailyLessonForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDailyLessonPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch lesson
  const { data: lesson, error } = await supabaseAdmin
    .from('daily_lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lesson) notFound();

  // Fetch items with MCQs
  const { data: items } = await supabaseAdmin
    .from('daily_lesson_items')
    .select('*')
    .eq('lesson_id', id)
    .order('sort_order', { ascending: true });

  // Fetch MCQs for all items
  const itemIds = (items || []).map((i: any) => i.id);
  let mcqsByItem: Record<number, any[]> = {};

  if (itemIds.length > 0) {
    const { data: mcqs } = await supabaseAdmin
      .from('daily_lesson_mcqs')
      .select('*')
      .in('item_id', itemIds)
      .order('sort_order', { ascending: true });

    if (mcqs) {
      for (const mcq of mcqs) {
        if (!mcqsByItem[mcq.item_id]) mcqsByItem[mcq.item_id] = [];
        mcqsByItem[mcq.item_id].push(mcq);
      }
    }
  }

  const formData = {
    id: lesson.id,
    lesson_date: lesson.lesson_date,
    title: lesson.title,
    subject_id: lesson.subject_id || '',
    chapter_num: lesson.chapter_num || 1,
    class_level: lesson.class_level || 10,
    total_marks: lesson.total_marks || 100,
    is_published: lesson.is_published,
  };

  const formItems = (items || []).map((item: any) => ({
    id: item.id,
    item_type: item.item_type,
    category: item.category,
    title: item.title,
    description: item.description || '',
    content_ref: item.content_ref || '',
    media_url: item.media_url || '',
    content_body: item.content_body || '',
    marks: item.marks || 0,
    mcqs: (mcqsByItem[item.id] || []).map((mcq: any) => ({
      question: mcq.question,
      option_ka: mcq.option_ka,
      option_kha: mcq.option_kha,
      option_ga: mcq.option_ga,
      option_gha: mcq.option_gha,
      correct: mcq.correct,
      explanation: mcq.explanation || '',
      marks: mcq.marks || 1,
    })),
  }));

  return <DailyLessonForm initialData={formData} initialItems={formItems} isEdit />;
}
