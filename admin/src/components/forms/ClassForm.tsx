'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

const SUBJECTS = [
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

interface ClassFormData {
  id?: string;
  slug: string;
  title: string;
  subject_id: string;
  chapter_num: number;
  class_level: string;
  date_label: string;
  duration: string;
  available: boolean;
  youtube_id: string;
  hls_src: string;
  description: string;
  related_sim_slug: string;
}

interface ClassFormProps {
  initialData?: ClassFormData;
  isEdit?: boolean;
}

const DEFAULT: ClassFormData = {
  slug: '',
  title: '',
  subject_id: 'physics',
  chapter_num: 1,
  class_level: '9-10',
  date_label: '',
  duration: '',
  available: true,
  youtube_id: '',
  hls_src: '',
  description: '',
  related_sim_slug: '',
};

export default function ClassForm({ initialData, isEdit }: ClassFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ClassFormData>(initialData || DEFAULT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof ClassFormData, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Auto-generate slug from title
  function generateSlug() {
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
    update('slug', slug);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      slug: form.slug,
      title: form.title,
      subject_id: form.subject_id,
      chapter_num: form.chapter_num,
      class_level: form.class_level,
      date_label: form.date_label,
      duration: form.duration,
      available: form.available,
      youtube_id: form.youtube_id || null,
      hls_src: form.hls_src || null,
      description: form.description || null,
      related_sim_slug: form.related_sim_slug || null,
    };

    let result;
    if (isEdit && form.id) {
      result = await supabase.from('class_recordings').update(payload).eq('id', form.id);
    } else {
      result = await supabase.from('class_recordings').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    router.push('/classes');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card p-6 max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="admin-label">শিরোনাম</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            onBlur={() => !isEdit && !form.slug && generateSlug()}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="admin-label">Slug</label>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="admin-label">বিষয়</label>
          <select
            className="admin-input"
            value={form.subject_id}
            onChange={(e) => update('subject_id', e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-label">অধ্যায় নং</label>
          <input
            type="number"
            className="admin-input"
            value={form.chapter_num}
            onChange={(e) => update('chapter_num', Number(e.target.value))}
            min={1}
            required
          />
        </div>

        <div>
          <label className="admin-label">শ্রেণি</label>
          <input
            className="admin-input"
            value={form.class_level}
            onChange={(e) => update('class_level', e.target.value)}
            placeholder="9-10"
          />
        </div>

        <div>
          <label className="admin-label">তারিখ</label>
          <input
            className="admin-input"
            value={form.date_label}
            onChange={(e) => update('date_label', e.target.value)}
            placeholder="২৬ মার্চ ২০২৫"
            required
          />
        </div>

        <div>
          <label className="admin-label">সময়কাল</label>
          <input
            className="admin-input"
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
            placeholder="45:30"
            required
          />
        </div>

        <div>
          <label className="admin-label">YouTube ID</label>
          <input
            className="admin-input"
            value={form.youtube_id}
            onChange={(e) => update('youtube_id', e.target.value)}
            placeholder="dQw4w9WgXcQ"
          />
        </div>

        <div className="col-span-2">
          <label className="admin-label">HLS URL</label>
          <input
            className="admin-input"
            value={form.hls_src}
            onChange={(e) => update('hls_src', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="col-span-2">
          <label className="admin-label">বিবরণ</label>
          <textarea
            className="admin-input"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div>
          <label className="admin-label">সম্পর্কিত সিমুলেশন Slug</label>
          <input
            className="admin-input"
            value={form.related_sim_slug}
            onChange={(e) => update('related_sim_slug', e.target.value)}
            placeholder="ohms-law"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => update('available', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">সক্রিয় (দৃশ্যমান)</span>
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট করো' : 'তৈরি করো'}
        </button>
        <button
          type="button"
          className="admin-btn-outline"
          onClick={() => router.push('/classes')}
        >
          বাতিল
        </button>
      </div>
    </form>
  );
}
