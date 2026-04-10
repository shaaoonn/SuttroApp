'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

// ─────────────────────────────────────────────
// DailyLessonForm — Create/Edit আজকের পড়া
// Supports: video, simulation, PDF, image, note,
//           MCQ sets, written questions
// Categories: study, memorize, homework, challenge
// ─────────────────────────────────────────────

const SUBJECTS = [
  { value: '', label: '(কোনো বিষয় নয়)' },
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

const ITEM_TYPES = [
  { value: 'video', label: '▶ ভিডিও ক্লাস' },
  { value: 'simulation', label: '🔬 সিমুলেশন' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'image', label: '🖼️ ছবি' },
  { value: 'note', label: '📝 কাস্টম নোট' },
  { value: 'mcq_set', label: '✅ MCQ সেট' },
  { value: 'written_question', label: '✍️ লিখিত প্রশ্ন' },
];

const CATEGORIES = [
  { value: 'study', label: '📖 পড়া' },
  { value: 'memorize', label: '🧠 মুখস্ত' },
  { value: 'homework', label: '✏️ বাড়ির কাজ' },
  { value: 'challenge', label: '🏆 চ্যালেঞ্জ' },
];

interface McqData {
  question: string;
  option_ka: string;
  option_kha: string;
  option_ga: string;
  option_gha: string;
  correct: number;
  explanation: string;
  marks: number;
}

interface ItemData {
  id?: number;
  item_type: string;
  category: string;
  title: string;
  description: string;
  content_ref: string;
  media_url: string;
  content_body: string;
  marks: number;
  mcqs: McqData[];
}

interface LessonFormData {
  id?: string;
  lesson_date: string;
  title: string;
  subject_id: string;
  chapter_num: number;
  class_level: number;
  total_marks: number;
  is_published: boolean;
}

interface DailyLessonFormProps {
  initialData?: LessonFormData;
  initialItems?: ItemData[];
  isEdit?: boolean;
}

const DEFAULT_LESSON: LessonFormData = {
  lesson_date: new Date().toISOString().split('T')[0],
  title: '',
  subject_id: '',
  chapter_num: 1,
  class_level: 10,
  total_marks: 100,
  is_published: false,
};

const EMPTY_ITEM: ItemData = {
  item_type: 'video',
  category: 'study',
  title: '',
  description: '',
  content_ref: '',
  media_url: '',
  content_body: '',
  marks: 0,
  mcqs: [],
};

const EMPTY_MCQ: McqData = {
  question: '',
  option_ka: '',
  option_kha: '',
  option_ga: '',
  option_gha: '',
  correct: 0,
  explanation: '',
  marks: 1,
};

export default function DailyLessonForm({ initialData, initialItems, isEdit }: DailyLessonFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<LessonFormData>(initialData || DEFAULT_LESSON);
  const [items, setItems] = useState<ItemData[]>(initialItems || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateForm(field: keyof LessonFormData, value: string | number | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof ItemData, value: unknown) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // When switching to mcq_set, ensure mcqs array has at least one
      if (field === 'item_type' && value === 'mcq_set' && next[idx].mcqs.length === 0) {
        next[idx].mcqs = [{ ...EMPTY_MCQ }];
      }
      return next;
    });
  }

  function addMcq(itemIdx: number) {
    setItems(prev => {
      const next = [...prev];
      next[itemIdx] = { ...next[itemIdx], mcqs: [...next[itemIdx].mcqs, { ...EMPTY_MCQ }] };
      return next;
    });
  }

  function removeMcq(itemIdx: number, mcqIdx: number) {
    setItems(prev => {
      const next = [...prev];
      next[itemIdx] = { ...next[itemIdx], mcqs: next[itemIdx].mcqs.filter((_, i) => i !== mcqIdx) };
      return next;
    });
  }

  function updateMcq(itemIdx: number, mcqIdx: number, field: keyof McqData, value: string | number) {
    setItems(prev => {
      const next = [...prev];
      const mcqs = [...next[itemIdx].mcqs];
      mcqs[mcqIdx] = { ...mcqs[mcqIdx], [field]: value };
      next[itemIdx] = { ...next[itemIdx], mcqs };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const lessonPayload = {
      lesson_date: form.lesson_date,
      title: form.title,
      subject_id: form.subject_id || null,
      chapter_num: form.chapter_num,
      class_level: form.class_level,
      total_marks: form.total_marks,
      is_published: form.is_published,
    };

    let lessonId = form.id;

    if (isEdit && lessonId) {
      const { error: err } = await supabase
        .from('daily_lessons')
        .update(lessonPayload)
        .eq('id', lessonId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase
        .from('daily_lessons')
        .insert(lessonPayload)
        .select('id')
        .single();
      if (err || !data) { setError(err?.message || 'Failed to create'); setSaving(false); return; }
      lessonId = data.id;
    }

    // Delete existing items (replace strategy)
    if (isEdit) {
      await supabase.from('daily_lesson_items').delete().eq('lesson_id', lessonId);
    }

    // Insert items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { data: itemData, error: itemErr } = await supabase
        .from('daily_lesson_items')
        .insert({
          lesson_id: lessonId,
          item_type: item.item_type,
          category: item.category,
          title: item.title,
          description: item.description || null,
          content_ref: item.content_ref || null,
          media_url: item.media_url || null,
          content_body: item.content_body || null,
          marks: item.marks,
          sort_order: i,
        })
        .select('id')
        .single();

      if (itemErr || !itemData) { setError(itemErr?.message || 'Item insert failed'); setSaving(false); return; }

      // Insert MCQs for mcq_set items
      if (item.item_type === 'mcq_set' && item.mcqs.length > 0) {
        const mcqPayload = item.mcqs.map((mcq, mi) => ({
          item_id: itemData.id,
          question: mcq.question,
          option_ka: mcq.option_ka,
          option_kha: mcq.option_kha,
          option_ga: mcq.option_ga,
          option_gha: mcq.option_gha,
          correct: mcq.correct,
          explanation: mcq.explanation || null,
          marks: mcq.marks,
          sort_order: mi,
        }));

        const { error: mcqErr } = await supabase.from('daily_lesson_mcqs').insert(mcqPayload);
        if (mcqErr) { setError(mcqErr.message); setSaving(false); return; }
      }
    }

    router.push('/daily-lessons');
    router.refresh();
  }

  const OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* ── Lesson Info ── */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">পড়ার তথ্য</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">তারিখ</label>
            <input
              type="date"
              className="admin-input"
              value={form.lesson_date}
              onChange={e => updateForm('lesson_date', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="admin-label">মোট নম্বর</label>
            <input
              type="number"
              className="admin-input"
              value={form.total_marks}
              onChange={e => updateForm('total_marks', Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <label className="admin-label">শিরোনাম</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={e => updateForm('title', e.target.value)}
            placeholder="আজকের পড়া: ওহমের সূত্র"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="admin-label">বিষয়</label>
            <select className="admin-input" value={form.subject_id} onChange={e => updateForm('subject_id', e.target.value)}>
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">অধ্যায়</label>
            <input type="number" className="admin-input" value={form.chapter_num}
              onChange={e => updateForm('chapter_num', Number(e.target.value))} min={1} />
          </div>
          <div>
            <label className="admin-label">শ্রেণি</label>
            <select className="admin-input" value={form.class_level} onChange={e => updateForm('class_level', Number(e.target.value))}>
              <option value={9}>৯</option>
              <option value={10}>১০</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={e => updateForm('is_published', e.target.checked)} className="w-4 h-4" />
          <span className="text-sm font-medium">প্রকাশিত (ছাত্ররা দেখতে পারবে)</span>
        </label>
      </div>

      {/* ── Items ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">আইটেম ({items.length}টি)</h2>
          <button type="button" className="admin-btn-primary" onClick={addItem}>
            + আইটেম যোগ করো
          </button>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="admin-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--admin-primary)' }}>
                আইটেম {idx + 1}
              </span>
              <button type="button" style={{ color: 'var(--admin-danger)' }} className="text-sm" onClick={() => removeItem(idx)}>
                মুছে ফেলো
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">ধরন</label>
                <select className="admin-input" value={item.item_type} onChange={e => updateItem(idx, 'item_type', e.target.value)}>
                  {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">ক্যাটাগরি</label>
                <select className="admin-input" value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="admin-label">শিরোনাম</label>
              <input className="admin-input" value={item.title}
                onChange={e => updateItem(idx, 'title', e.target.value)} required />
            </div>

            <div>
              <label className="admin-label">বিবরণ (ঐচ্ছিক)</label>
              <input className="admin-input" value={item.description}
                onChange={e => updateItem(idx, 'description', e.target.value)} />
            </div>

            {/* Content ref for video/simulation */}
            {['video', 'simulation'].includes(item.item_type) && (
              <div>
                <label className="admin-label">
                  {item.item_type === 'video' ? 'ক্লাস Slug' : 'সিমুলেশন Slug'}
                </label>
                <input className="admin-input" value={item.content_ref}
                  onChange={e => updateItem(idx, 'content_ref', e.target.value)}
                  placeholder={item.item_type === 'video' ? 'ohms-law' : 'ohms-law'} />
              </div>
            )}

            {/* Media URL for PDF/image */}
            {['pdf', 'image'].includes(item.item_type) && (
              <div>
                <label className="admin-label">URL (PDF/ছবি)</label>
                <input className="admin-input" value={item.media_url}
                  onChange={e => updateItem(idx, 'media_url', e.target.value)}
                  placeholder="https://..." />
              </div>
            )}

            {/* Content body for notes and written questions */}
            {['note', 'written_question'].includes(item.item_type) && (
              <div>
                <label className="admin-label">
                  {item.item_type === 'note' ? 'নোট কন্টেন্ট' : 'প্রশ্ন'}
                </label>
                <textarea className="admin-input" rows={3} value={item.content_body}
                  onChange={e => updateItem(idx, 'content_body', e.target.value)} />
              </div>
            )}

            <div>
              <label className="admin-label">নম্বর (০ = শুধু কমপ্লিশন)</label>
              <input type="number" className="admin-input" value={item.marks}
                onChange={e => updateItem(idx, 'marks', Number(e.target.value))} min={0}
                style={{ maxWidth: 120 }} />
            </div>

            {/* MCQ questions */}
            {item.item_type === 'mcq_set' && (
              <div className="space-y-3 mt-2 pl-3" style={{ borderLeft: '3px solid var(--admin-primary)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">MCQ ({item.mcqs.length}টি)</span>
                  <button type="button" className="admin-btn-outline text-xs" onClick={() => addMcq(idx)}>
                    + প্রশ্ন
                  </button>
                </div>

                {item.mcqs.map((mcq, mi) => (
                  <div key={mi} className="p-3 rounded-lg space-y-2" style={{ background: '#f8fafc', border: '1px solid var(--admin-border)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: 'var(--admin-primary)' }}>
                        প্রশ্ন {mi + 1}
                      </span>
                      <button type="button" className="text-xs" style={{ color: 'var(--admin-danger)' }}
                        onClick={() => removeMcq(idx, mi)}>মুছো</button>
                    </div>

                    <textarea className="admin-input" rows={2} value={mcq.question}
                      onChange={e => updateMcq(idx, mi, 'question', e.target.value)}
                      placeholder="প্রশ্ন লেখো..." required />

                    <div className="grid grid-cols-2 gap-2">
                      {(['option_ka', 'option_kha', 'option_ga', 'option_gha'] as const).map((opt, oi) => (
                        <div key={opt}>
                          <label className="admin-label flex items-center gap-1.5 text-xs">
                            <input type="radio" name={`mcq-${idx}-${mi}`} checked={mcq.correct === oi}
                              onChange={() => updateMcq(idx, mi, 'correct', oi)} className="w-3.5 h-3.5" />
                            {OPTION_LABELS[oi]}
                          </label>
                          <input className="admin-input" value={mcq[opt]}
                            onChange={e => updateMcq(idx, mi, opt, e.target.value)} required />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="admin-label text-xs">ব্যাখ্যা</label>
                        <input className="admin-input" value={mcq.explanation}
                          onChange={e => updateMcq(idx, mi, 'explanation', e.target.value)} />
                      </div>
                      <div>
                        <label className="admin-label text-xs">নম্বর</label>
                        <input type="number" className="admin-input" value={mcq.marks}
                          onChange={e => updateMcq(idx, mi, 'marks', Number(e.target.value))} min={1}  />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট করো' : 'তৈরি করো'}
        </button>
        <button type="button" className="admin-btn-outline" onClick={() => router.push('/daily-lessons')}>
          বাতিল
        </button>
      </div>
    </form>
  );
}
