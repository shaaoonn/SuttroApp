'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

// ─────────────────────────────────────────────
// DailyLessonForm — Create/Edit আজকের পড়া
// Features:
//   - Content dropdown (videos, exams) from DB
//   - Auto-fill fields on selection
//   - Department targeting (science/humanities/commerce)
//   - Subject-based filtering in dropdowns
//   - External URL fallback
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

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

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

const DEPARTMENTS = [
  { value: 'science', label: 'বিজ্ঞান' },
  { value: 'humanities', label: 'মানবিক' },
  { value: 'commerce', label: 'বাণিজ্য' },
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
  departments: string[];
}

interface DailyLessonFormProps {
  initialData?: LessonFormData & { subject_id?: string; chapter_num?: number };
  initialItems?: ItemData[];
  isEdit?: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  subject_id: string;
  chapter_num: number | null;
  class_level: number;
  date_label?: string;
  duration?: string;
  has_video?: boolean;
  year?: number;
  board?: string;
  total_marks?: number;
  created_at: string;
}

const DEFAULT_LESSON: LessonFormData = {
  lesson_date: new Date().toISOString().split('T')[0],
  title: '',
  class_level: 10,
  total_marks: 100,
  is_published: false,
  departments: [],
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
    departments: initialData.departments || [],
  } : DEFAULT_LESSON);
  const [items, setItems] = useState<ItemData[]>(initialItems || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateForm(field: keyof LessonFormData, value: string | number | boolean | string[]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleDepartment(dept: string) {
    setForm(prev => {
      const current = prev.departments || [];
      const next = current.includes(dept)
        ? current.filter(d => d !== dept)
        : [...current, dept];
      return { ...prev, departments: next };
    });
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

  // Auto-fill item fields from selected content
  function selectContent(idx: number, content: ContentItem, contentType: string) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        title: content.title,
        subject_id: content.subject_id || '',
        chapter_num: content.chapter_num || 0,
        content_ref: content.id,
      };
      // For exams, set the marks from the exam's total_marks
      if (contentType === 'exam' && content.total_marks) {
        next[idx].marks = content.total_marks;
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
      subject_id: null,
      chapter_num: null,
      class_level: form.class_level,
      total_marks: form.total_marks,
      is_published: form.is_published,
      departments: form.departments.length > 0 ? form.departments : [],
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

        {/* ── Department Targeting ── */}
        <div>
          <label className="admin-label">বিভাগ (কারা দেখবে)</label>
          <div className="flex gap-3 mt-1">
            {DEPARTMENTS.map(dept => {
              const isSelected = (form.departments || []).includes(dept.value);
              return (
                <button
                  key={dept.value}
                  type="button"
                  onClick={() => toggleDepartment(dept.value)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                  style={{
                    background: isSelected ? 'var(--admin-primary)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--admin-text)',
                    borderColor: isSelected ? 'var(--admin-primary)' : 'var(--admin-border)',
                  }}
                >
                  {isSelected ? '✓ ' : ''}{dept.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
            {(form.departments || []).length === 0
              ? 'কোনো বিভাগ সিলেক্ট না করলে সবাই দেখতে পারবে'
              : `শুধু ${(form.departments || []).map(d => DEPARTMENTS.find(dd => dd.value === d)?.label).join(' + ')} বিভাগের শিক্ষার্থীরা দেখবে`
            }
          </p>
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
                      — {SUBJECT_LABELS[item.subject_id] || item.subject_id}
                      {item.chapter_num ? ` (অধ্যায় ${item.chapter_num})` : ''}
                    </span>
                  )}
                </span>
                <button type="button" style={{ color: 'var(--admin-danger)' }} className="text-sm font-medium" onClick={() => removeItem(idx)}>
                  মুছে ফেলো
                </button>
              </div>

              <div className="p-5 space-y-3">
                {/* Type + Category row */}
                <div className="grid grid-cols-3 gap-3">
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
                  <div>
                    <label className="admin-label">নম্বর (০ = শুধু কমপ্লিশন)</label>
                    <input type="number" className="admin-input" value={item.marks}
                      onChange={e => updateItem(idx, 'marks', Number(e.target.value))} min={0} />
                  </div>
                </div>

                {/* ── Content Picker: Video ── */}
                {item.item_type === 'video' && (
                  <ContentPicker
                    contentType="video"
                    item={item}
                    classLevel={form.class_level}
                    onSelect={(content) => selectContent(idx, content, 'video')}
                    onManualRef={(ref) => updateItem(idx, 'content_ref', ref)}
                  />
                )}

                {/* ── Content Picker: Exam ── */}
                {item.item_type === 'mcq_set' && (
                  <ContentPicker
                    contentType="exam"
                    item={item}
                    classLevel={form.class_level}
                    onSelect={(content) => selectContent(idx, content, 'exam')}
                    onManualRef={(ref) => updateItem(idx, 'content_ref', ref)}
                    optional
                  />
                )}

                {/* ── Content Picker: Simulation ── */}
                {item.item_type === 'simulation' && (
                  <div>
                    <label className="admin-label">সিমুলেশন Slug / লিংক</label>
                    <input className="admin-input" value={item.content_ref}
                      onChange={e => updateItem(idx, 'content_ref', e.target.value)}
                      placeholder="ohms-law বা https://..." />
                  </div>
                )}

                {/* Subject + Chapter (shown when not auto-filled by picker, or for manual override) */}
                <div className="grid grid-cols-2 gap-3">
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

                {/* File Upload for PDF/image */}
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

                {/* MCQ questions (for mcq_set when NOT using an existing exam) */}
                {item.item_type === 'mcq_set' && !item.content_ref && (
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

                {/* Show selected exam info if content_ref is set for mcq_set */}
                {item.item_type === 'mcq_set' && item.content_ref && (
                  <div className="p-3 rounded-lg text-sm" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <span className="font-medium" style={{ color: '#166534' }}>
                      ✅ সাইটের পরীক্ষা ব্যবহার হবে: <code className="px-1 py-0.5 rounded" style={{ background: '#DCFCE7' }}>{item.content_ref}</code>
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#15803D' }}>
                      এই পরীক্ষার MCQ গুলো সরাসরি সাইট থেকে লোড হবে। নিচে আলাদা MCQ যোগ করতে হবে না।
                    </p>
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
// ContentPicker — Dropdown to select existing
// content (videos, exams) from the database
// ─────────────────────────────────────────────

function ContentPicker({
  contentType,
  item,
  classLevel,
  onSelect,
  onManualRef,
  optional,
}: {
  contentType: 'video' | 'exam';
  item: ItemData;
  classLevel: number;
  onSelect: (content: ContentItem) => void;
  onManualRef: (ref: string) => void;
  optional?: boolean;
}) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchContent = useCallback(async (subjectFilter: string, searchQuery: string) => {
    setLoading(true);
    const params = new URLSearchParams({ type: contentType, class: String(classLevel) });
    if (subjectFilter) params.set('subject', subjectFilter);
    if (searchQuery) params.set('q', searchQuery);

    try {
      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      setContents(data.items || []);
    } catch {
      setContents([]);
    }
    setLoading(false);
  }, [contentType, classLevel]);

  useEffect(() => {
    if (isOpen) {
      fetchContent(filterSubject, search);
    }
  }, [isOpen, filterSubject, search, fetchContent]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const label = contentType === 'video' ? 'ভিডিও ক্লাস' : 'পরীক্ষা';
  const selectedLabel = item.content_ref
    ? contents.find(c => c.id === item.content_ref)?.title || item.content_ref
    : '';

  if (useManual) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="admin-label">
            {contentType === 'video' ? 'ক্লাস Slug / বাহ্যিক লিংক' : 'পরীক্ষা ID / বাহ্যিক লিংক'}
          </label>
          <button type="button" className="text-xs font-medium" style={{ color: 'var(--admin-primary)' }}
            onClick={() => setUseManual(false)}>
            ← সাইট থেকে বাছাই করো
          </button>
        </div>
        <input className="admin-input" value={item.content_ref}
          onChange={e => onManualRef(e.target.value)}
          placeholder={contentType === 'video' ? 'ohms-law বা https://youtube.com/...' : 'ssc-2024-physics বা https://...'} />
      </div>
    );
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="admin-label">
          {label} সিলেক্ট করো {optional && <span className="text-xs font-normal" style={{ color: 'var(--admin-text-secondary)' }}>(ঐচ্ছিক — নিজে MCQ লিখতে পারো)</span>}
        </label>
        <button type="button" className="text-xs font-medium" style={{ color: 'var(--admin-text-secondary)' }}
          onClick={() => setUseManual(true)}>
          বাহ্যিক লিংক দাও →
        </button>
      </div>

      {/* Selected content display */}
      {item.content_ref && !isOpen && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <span className="text-sm font-medium" style={{ color: '#166534' }}>
            ✅ {selectedLabel}
          </span>
          <button type="button" className="ml-auto text-xs" style={{ color: '#DC2626' }}
            onClick={() => {
              onManualRef('');
              setIsOpen(true);
            }}>
            পরিবর্তন
          </button>
        </div>
      )}

      {/* Dropdown trigger */}
      {(!item.content_ref || isOpen) && (
        <div>
          <button
            type="button"
            className="admin-input w-full text-left flex items-center justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={item.content_ref ? '' : 'opacity-50'}>
              {item.content_ref ? selectedLabel : `${label} বাছাই করো...`}
            </span>
            <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
          </button>

          {isOpen && (
            <div className="mt-1 rounded-lg shadow-lg overflow-hidden" style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}>
              {/* Filter bar */}
              <div className="p-2 space-y-2" style={{ borderBottom: '1px solid var(--admin-border)', background: '#f8fafc' }}>
                <input
                  className="admin-input text-sm"
                  placeholder="🔍 খুঁজো..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-1 flex-wrap">
                  <button type="button"
                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      background: !filterSubject ? 'var(--admin-primary)' : 'transparent',
                      color: !filterSubject ? 'white' : 'var(--admin-text-secondary)',
                      border: `1px solid ${!filterSubject ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                    }}
                    onClick={() => setFilterSubject('')}
                  >
                    সব
                  </button>
                  {SUBJECTS.filter(s => s.value).map(s => (
                    <button key={s.value} type="button"
                      className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                      style={{
                        background: filterSubject === s.value ? (SUBJECT_COLORS[s.value]?.bg || '#E2E8F0') : 'transparent',
                        color: filterSubject === s.value ? (SUBJECT_COLORS[s.value]?.text || '#334155') : 'var(--admin-text-secondary)',
                        border: `1px solid ${filterSubject === s.value ? (SUBJECT_COLORS[s.value]?.text || '#94A3B8') : 'var(--admin-border)'}`,
                      }}
                      onClick={() => setFilterSubject(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content list */}
              <div className="max-h-64 overflow-y-auto">
                {loading && (
                  <div className="p-4 text-center text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    লোড হচ্ছে...
                  </div>
                )}

                {!loading && contents.length === 0 && (
                  <div className="p-4 text-center text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    কোনো {label} পাওয়া যায়নি
                  </div>
                )}

                {!loading && contents.map(content => {
                  const isSelected = item.content_ref === content.id;
                  const subjColor = SUBJECT_COLORS[content.subject_id];
                  return (
                    <button
                      key={content.id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 transition-colors hover:opacity-90 flex items-start gap-3"
                      style={{
                        background: isSelected ? '#F0FDF4' : 'transparent',
                        borderBottom: '1px solid var(--admin-border)',
                      }}
                      onClick={() => {
                        onSelect(content);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                          {isSelected && '✅ '}{content.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {content.subject_id && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ background: subjColor?.bg || '#F1F5F9', color: subjColor?.text || '#64748B' }}>
                              {SUBJECT_LABELS[content.subject_id] || content.subject_id}
                            </span>
                          )}
                          {content.chapter_num && (
                            <span className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                              অধ্যায় {content.chapter_num}
                            </span>
                          )}
                          {contentType === 'video' && content.duration && (
                            <span className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                              {content.duration}
                            </span>
                          )}
                          {contentType === 'exam' && content.year && (
                            <span className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                              {content.year} {content.board || ''}
                            </span>
                          )}
                          {contentType === 'exam' && content.total_marks && (
                            <span className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                              {content.total_marks} নম্বর
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                        {content.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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

  // suppress unused var warning
  void idx;

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

        <input className="admin-input flex-1" value={item.media_url}
          onChange={e => onUpdate('media_url', e.target.value)}
          placeholder="অথবা URL পেস্ট করো..." />
      </div>

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
