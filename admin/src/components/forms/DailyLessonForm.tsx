'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

// ─────────────────────────────────────────────
// DailyLessonForm — Create/Edit আজকের পড়া
// Subject/chapter at item level (not lesson level)
// Google Drive file upload for PDFs, images, videos
// ─────────────────────────────────────────────

const SUBJECTS = [
  { value: '', label: '(বিষয় নির্বাচন করো)' },
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  physics: { bg: '#EFF6FF', text: '#1E40AF' },
  chemistry: { bg: '#F0FDF4', text: '#166534' },
  biology: { bg: '#FDF2F8', text: '#9D174D' },
  math: { bg: '#FFF7ED', text: '#9A3412' },
  'higher-math': { bg: '#FAF5FF', text: '#7E22CE' },
  english: { bg: '#FEF2F2', text: '#991B1B' },
};

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
  subject_id: string;
  chapter_num: number;
  gdrive_file_id: string;
  mcqs: McqData[];
}

interface LessonFormData {
  id?: string;
  lesson_date: string;
  title: string;
  class_level: number;
  total_marks: number;
  is_published: boolean;
}

interface DailyLessonFormProps {
  initialData?: LessonFormData & { subject_id?: string; chapter_num?: number };
  initialItems?: ItemData[];
  isEdit?: boolean;
}

const DEFAULT_LESSON: LessonFormData = {
  lesson_date: new Date().toISOString().split('T')[0],
  title: '',
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
  subject_id: '',
  chapter_num: 0,
  gdrive_file_id: '',
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
  const [form, setForm] = useState<LessonFormData>(initialData ? {
    id: initialData.id,
    lesson_date: initialData.lesson_date,
    title: initialData.title,
    class_level: initialData.class_level,
    total_marks: initialData.total_marks,
    is_published: initialData.is_published,
  } : DEFAULT_LESSON);
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
      subject_id: null, // No longer at lesson level
      chapter_num: null,
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
          subject_id: item.subject_id || null,
          chapter_num: item.chapter_num || null,
          gdrive_file_id: item.gdrive_file_id || null,
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
            placeholder="আজকের পড়া: ওহমের সূত্র + রাসায়নিক বন্ধন"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">শ্রেণি</label>
            <select className="admin-input" value={form.class_level} onChange={e => updateForm('class_level', Number(e.target.value))}>
              <option value={9}>৯</option>
              <option value={10}>১০</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input type="checkbox" checked={form.is_published} onChange={e => updateForm('is_published', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium">প্রকাশিত</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Items ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">আইটেম ({items.length}টি)</h2>
          <button type="button" className="admin-btn-primary" onClick={addItem}>
            + আইটেম যোগ করো
          </button>
        </div>

        {items.map((item, idx) => {
          const subColor = SUBJECT_COLORS[item.subject_id] || { bg: '#F8FAFC', text: '#64748B' };

          return (
            <div key={idx} className="admin-card overflow-hidden">
              {/* Item header with subject color stripe */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ background: item.subject_id ? subColor.bg : '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <span className="text-sm font-bold" style={{ color: item.subject_id ? subColor.text : 'var(--admin-primary)' }}>
                  আইটেম {idx + 1}
                  {item.subject_id && (
                    <span className="ml-2 text-xs font-medium">
                      — {SUBJECTS.find(s => s.value === item.subject_id)?.label}
                      {item.chapter_num ? ` (অধ্যায় ${item.chapter_num})` : ''}
                    </span>
                  )}
                </span>
                <button type="button" style={{ color: 'var(--admin-danger)' }} className="text-sm font-medium" onClick={() => removeItem(idx)}>
                  মুছে ফেলো
                </button>
              </div>

              <div className="p-5 space-y-3">
                {/* Subject + Chapter row (at item level!) */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="admin-label">বিষয়</label>
                    <select className="admin-input" value={item.subject_id}
                      onChange={e => updateItem(idx, 'subject_id', e.target.value)}>
                      {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">অধ্যায়</label>
                    <input type="number" className="admin-input" value={item.chapter_num || ''}
                      onChange={e => updateItem(idx, 'chapter_num', Number(e.target.value))} min={0}
                      placeholder="0" />
                  </div>
                  <div>
                    <label className="admin-label">ক্যাটাগরি</label>
                    <select className="admin-input" value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Type + Marks row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">ধরন</label>
                    <select className="admin-input" value={item.item_type} onChange={e => updateItem(idx, 'item_type', e.target.value)}>
                      {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">নম্বর (০ = শুধু কমপ্লিশন)</label>
                    <input type="number" className="admin-input" value={item.marks}
                      onChange={e => updateItem(idx, 'marks', Number(e.target.value))} min={0} />
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

                {/* File Upload for PDF/image/video (Google Drive) */}
                {['pdf', 'image'].includes(item.item_type) && (
                  <FileUploadField
                    item={item}
                    idx={idx}
                    date={form.lesson_date}
                    onUpdate={(field, value) => updateItem(idx, field, value)}
                  />
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
                              onChange={e => updateMcq(idx, mi, 'marks', Number(e.target.value))} min={1} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

// ─────────────────────────────────────────────
// File Upload Component (Google Drive)
// ─────────────────────────────────────────────

function FileUploadField({
  item,
  idx,
  date,
  onUpdate,
}: {
  item: ItemData;
  idx: number;
  date: string;
  onUpdate: (field: keyof ItemData, value: unknown) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedName, setUploadedName] = useState('');

  const accept = item.item_type === 'pdf' ? '.pdf' : 'image/*';
  const label = item.item_type === 'pdf' ? 'PDF ফাইল' : 'ছবি';

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);
    if (item.subject_id) formData.append('subjectId', item.subject_id);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        onUpdate('media_url', data.url);
        onUpdate('gdrive_file_id', data.fileId);
        setUploadedName(data.fileName);
      } else {
        // If Google Drive not configured, show URL input instead
        if (data.error) {
          setUploadError(data.error);
        }
      }
    } catch {
      setUploadError('আপলোড ব্যর্থ হয়েছে');
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>

      {/* Upload button */}
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="admin-btn-outline text-sm flex items-center gap-2 disabled:opacity-50">
          {uploading ? (
            <>
              <span className="animate-spin">⏳</span>
              আপলোড হচ্ছে...
            </>
          ) : (
            <>📤 {label} আপলোড করো</>
          )}
        </button>

        {/* Or paste URL manually */}
        <input className="admin-input flex-1" value={item.media_url}
          onChange={e => onUpdate('media_url', e.target.value)}
          placeholder="অথবা URL পেস্ট করো..." />
      </div>

      {/* Upload status */}
      {uploadedName && (
        <div className="flex items-center gap-2 text-xs px-2 py-1 rounded"
          style={{ background: '#F0FDF4', color: '#166534' }}>
          <span>✅</span>
          <span className="font-medium">{uploadedName}</span>
          <span className="text-[10px] opacity-60">Google Drive-এ আপলোড হয়েছে</span>
        </div>
      )}

      {uploadError && (
        <div className="text-xs px-2 py-1 rounded" style={{ background: '#FEF2F2', color: '#DC2626' }}>
          {uploadError}
        </div>
      )}

      {/* Preview */}
      {item.media_url && item.item_type === 'image' && (
        <div className="mt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.media_url} alt="preview" className="rounded-lg border max-h-32 object-cover"
            style={{ borderColor: 'var(--admin-border)' }} />
        </div>
      )}

      {item.media_url && item.item_type === 'pdf' && (
        <a href={item.media_url} target="_blank" rel="noopener noreferrer"
          className="text-xs font-medium" style={{ color: 'var(--admin-primary)' }}>
          📄 PDF দেখো →
        </a>
      )}
    </div>
  );
}
