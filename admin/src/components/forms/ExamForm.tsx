'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

const SUBJECTS = [
  { value: 'physics', label: 'পদার্থবিজ্ঞান', bn: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন', bn: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান', bn: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত', bn: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত', bn: 'উচ্চতর গণিত' },
];

interface QuestionData {
  question: string;
  option_ka: string;
  option_kha: string;
  option_ga: string;
  option_gha: string;
  correct: number;
  explanation: string;
  chapter_num: number;
}

interface ExamFormData {
  id?: string;
  title: string;
  subject_id: string;
  subject_bn: string;
  year: number;
  board: string;
  class_level: string;
  duration: number;
  total_marks: number;
  negative_marking: boolean;
  is_published: boolean;
}

interface ExamFormProps {
  initialData?: ExamFormData;
  initialQuestions?: QuestionData[];
  isEdit?: boolean;
}

const DEFAULT_EXAM: ExamFormData = {
  title: '',
  subject_id: 'physics',
  subject_bn: 'পদার্থবিজ্ঞান',
  year: 2025,
  board: '',
  class_level: '10',
  duration: 30,
  total_marks: 30,
  negative_marking: false,
  is_published: false,
};

const EMPTY_Q: QuestionData = {
  question: '',
  option_ka: '',
  option_kha: '',
  option_ga: '',
  option_gha: '',
  correct: 0,
  explanation: '',
  chapter_num: 1,
};

export default function ExamForm({ initialData, initialQuestions, isEdit }: ExamFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ExamFormData>(initialData || DEFAULT_EXAM);
  const [questions, setQuestions] = useState<QuestionData[]>(initialQuestions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateForm(field: keyof ExamFormData, value: string | number | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Sync subject_bn when subject_id changes
      if (field === 'subject_id') {
        const match = SUBJECTS.find((s) => s.value === value);
        if (match) next.subject_bn = match.bn;
      }
      return next;
    });
  }

  function updateQuestion(idx: number, field: keyof QuestionData, value: string | number) {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { ...EMPTY_Q }]);
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Generate exam ID
    const examId = isEdit && form.id
      ? form.id
      : `ssc-${form.year}-${form.subject_id}${form.board ? `-${form.board}` : ''}`;

    const payload = {
      id: examId,
      title: form.title,
      subject_id: form.subject_id,
      subject_bn: form.subject_bn,
      year: form.year,
      board: form.board || null,
      class_level: form.class_level,
      duration: form.duration,
      total_marks: form.total_marks,
      negative_marking: form.negative_marking,
      is_published: form.is_published,
    };

    // Upsert exam paper
    const { error: examErr } = await supabase
      .from('exam_papers')
      .upsert(payload, { onConflict: 'id' });

    if (examErr) {
      setError(examErr.message);
      setSaving(false);
      return;
    }

    // Delete old questions and insert new ones
    if (questions.length > 0) {
      await supabase.from('mcq_questions').delete().eq('exam_paper_id', examId);

      const qPayload = questions.map((q, i) => ({
        exam_paper_id: examId,
        question_order: i + 1,
        question: q.question,
        option_ka: q.option_ka,
        option_kha: q.option_kha,
        option_ga: q.option_ga,
        option_gha: q.option_gha,
        correct: q.correct,
        explanation: q.explanation || null,
        chapter_num: q.chapter_num,
      }));

      const { error: qErr } = await supabase.from('mcq_questions').insert(qPayload);
      if (qErr) {
        setError(qErr.message);
        setSaving(false);
        return;
      }
    }

    router.push('/exams');
    router.refresh();
  }

  const OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Exam metadata */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">পরীক্ষার তথ্য</h2>

        <div>
          <label className="admin-label">শিরোনাম</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="SSC পদার্থবিজ্ঞান ২০২৫"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">বিষয়</label>
            <select
              className="admin-input"
              value={form.subject_id}
              onChange={(e) => updateForm('subject_id', e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">বছর</label>
            <input
              type="number"
              className="admin-input"
              value={form.year}
              onChange={(e) => updateForm('year', Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="admin-label">বোর্ড</label>
            <input
              className="admin-input"
              value={form.board}
              onChange={(e) => updateForm('board', e.target.value)}
              placeholder="ঢাকা (ঐচ্ছিক)"
            />
          </div>

          <div>
            <label className="admin-label">শ্রেণি</label>
            <input
              className="admin-input"
              value={form.class_level}
              onChange={(e) => updateForm('class_level', e.target.value)}
            />
          </div>

          <div>
            <label className="admin-label">সময় (মিনিট)</label>
            <input
              type="number"
              className="admin-input"
              value={form.duration}
              onChange={(e) => updateForm('duration', Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="admin-label">মোট নম্বর</label>
            <input
              type="number"
              className="admin-input"
              value={form.total_marks}
              onChange={(e) => updateForm('total_marks', Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.negative_marking}
              onChange={(e) => updateForm('negative_marking', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">নেগেটিভ মার্কিং</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => updateForm('is_published', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">প্রকাশিত</span>
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">প্রশ্ন ({questions.length}টি)</h2>
          <button type="button" className="admin-btn-outline" onClick={addQuestion}>
            + প্রশ্ন যোগ করো
          </button>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="admin-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--admin-primary)' }}>
                প্রশ্ন {qi + 1}
              </span>
              <button
                type="button"
                className="text-sm"
                style={{ color: 'var(--admin-danger)' }}
                onClick={() => removeQuestion(qi)}
              >
                মুছে ফেলো
              </button>
            </div>

            <div>
              <label className="admin-label">প্রশ্ন</label>
              <textarea
                className="admin-input"
                rows={2}
                value={q.question}
                onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['option_ka', 'option_kha', 'option_ga', 'option_gha'] as const).map((opt, oi) => (
                <div key={opt}>
                  <label className="admin-label flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct === oi}
                      onChange={() => updateQuestion(qi, 'correct', oi)}
                      className="w-4 h-4"
                    />
                    {OPTION_LABELS[oi]}
                  </label>
                  <input
                    className="admin-input"
                    value={q[opt]}
                    onChange={(e) => updateQuestion(qi, opt, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">অধ্যায় নং</label>
                <input
                  type="number"
                  className="admin-input"
                  value={q.chapter_num}
                  onChange={(e) => updateQuestion(qi, 'chapter_num', Number(e.target.value))}
                  min={1}
                />
              </div>
              <div>
                <label className="admin-label">ব্যাখ্যা (ঐচ্ছিক)</label>
                <input
                  className="admin-input"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
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
          onClick={() => router.push('/exams')}
        >
          বাতিল
        </button>
      </div>
    </form>
  );
}
