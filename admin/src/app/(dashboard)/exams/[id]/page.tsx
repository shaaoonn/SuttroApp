export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ExamForm from '@/components/forms/ExamForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExamPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: exam }, { data: questions }] = await Promise.all([
    supabaseAdmin.from('exam_papers').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('mcq_questions')
      .select('*')
      .eq('exam_paper_id', id)
      .order('question_order'),
  ]);

  if (!exam) notFound();

  const formData = {
    id: exam.id,
    title: exam.title,
    subject_id: exam.subject_id,
    subject_bn: exam.subject_bn,
    year: exam.year,
    board: exam.board || '',
    class_level: exam.class_level,
    duration: exam.duration,
    total_marks: exam.total_marks,
    negative_marking: exam.negative_marking,
    is_published: exam.is_published,
  };

  const formQuestions = (questions ?? []).map((q: Record<string, unknown>) => ({
    question: q.question as string,
    option_ka: q.option_ka as string,
    option_kha: q.option_kha as string,
    option_ga: q.option_ga as string,
    option_gha: q.option_gha as string,
    correct: q.correct as number,
    explanation: (q.explanation as string) || '',
    chapter_num: q.chapter_num as number,
  }));

  return <ExamForm initialData={formData} initialQuestions={formQuestions} isEdit />;
}
