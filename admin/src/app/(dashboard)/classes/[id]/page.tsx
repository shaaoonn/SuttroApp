import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ClassForm from '@/components/forms/ClassForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('class_recordings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const formData = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subject_id: data.subject_id,
    chapter_num: data.chapter_num,
    class_level: data.class_level,
    date_label: data.date_label,
    duration: data.duration,
    available: data.available,
    youtube_id: data.youtube_id || '',
    hls_src: data.hls_src || '',
    description: data.description || '',
    related_sim_slug: data.related_sim_slug || '',
  };

  return <ClassForm initialData={formData} isEdit />;
}
