export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CQEditor from './CQEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCQPage({ params }: PageProps) {
  const { id } = await params;

  const { data: collection } = await supabaseAdmin
    .from('cq_collections')
    .select('*')
    .eq('id', id)
    .single();

  if (!collection) notFound();

  const { data: questions } = await supabaseAdmin
    .from('creative_questions')
    .select('*, cq_parts(*)')
    .eq('collection_id', id)
    .order('chapter_num');

  return (
    <CQEditor
      collection={collection}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions={(questions ?? []).map((q: any) => ({
        id: q.id,
        chapter_num: q.chapter_num,
        stem: q.stem,
        source: q.source || '',
        parts: (q.cq_parts ?? [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => ({
            id: p.id,
            label: p.label,
            type: p.part_type,    // DB column part_type → editor field type
            marks: p.marks,
            question: p.question,
            answer: p.answer || '',
            sort_order: p.sort_order,
          })),
      }))}
    />
  );
}
