'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface CQPart {
  id?: number;
  label: string;
  type: string;
  marks: number;
  question: string;
  answer: string;
  sort_order: number;
}

interface CQ {
  id?: number;
  chapter_num: number;
  stem: string;
  source: string;
  parts: CQPart[];
}

interface CQEditorProps {
  collection: Record<string, unknown>;
  questions: CQ[];
}

const PART_TYPES = ['জ্ঞান', 'অনুধাবন', 'প্রয়োগ', 'উচ্চতর দক্ষতা'];
const PART_LABELS = ['ক', 'খ', 'গ', 'ঘ'];
const PART_MARKS = [1, 2, 3, 4];

export default function CQEditor({ collection, questions: initial }: CQEditorProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<CQ[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        chapter_num: 1,
        stem: '',
        source: '',
        parts: PART_LABELS.map((label, i) => ({
          label,
          type: PART_TYPES[i],
          marks: PART_MARKS[i],
          question: '',
          answer: '',
          sort_order: i,
        })),
      },
    ]);
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQ(idx: number, field: keyof CQ, value: string | number) {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function updatePart(qi: number, pi: number, field: keyof CQPart, value: string | number) {
    setQuestions((prev) => {
      const next = [...prev];
      const parts = [...next[qi].parts];
      parts[pi] = { ...parts[pi], [field]: value };
      next[qi] = { ...next[qi], parts };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const collId = collection.id as string;

    // Delete existing questions and parts for this collection
    const { data: existingQs } = await supabase
      .from('creative_questions')
      .select('id')
      .eq('collection_id', collId);

    if (existingQs && existingQs.length > 0) {
      const qIds = existingQs.map((q: { id: number }) => q.id);
      await supabase.from('cq_parts').delete().in('cq_id', qIds);
      await supabase.from('creative_questions').delete().eq('collection_id', collId);
    }

    // Insert questions
    for (const q of questions) {
      const { data: inserted, error: qErr } = await supabase
        .from('creative_questions')
        .insert({
          collection_id: collId,
          chapter_num: q.chapter_num,
          stem: q.stem,
          source: q.source || null,
        })
        .select('id')
        .single();

      if (qErr || !inserted) {
        setError(qErr?.message || 'প্রশ্ন সংরক্ষণ ব্যর্থ');
        setSaving(false);
        return;
      }

      // Insert parts
      const partsPayload = q.parts.map((p, i) => ({
        cq_id: inserted.id,
        label: p.label,
        type: p.type,
        marks: p.marks,
        question: p.question,
        answer: p.answer || null,
        sort_order: i,
      }));

      const { error: pErr } = await supabase.from('cq_parts').insert(partsPayload);
      if (pErr) {
        setError(pErr.message);
        setSaving(false);
        return;
      }
    }

    router.push('/cq');
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="admin-card p-5">
        <h2 className="text-lg font-semibold mb-2">
          {collection.subject_bn as string} — সৃজনশীল প্রশ্ন
        </h2>
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          Collection ID: {collection.id as string}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">প্রশ্ন ({questions.length}টি)</h3>
        <button type="button" className="admin-btn-outline" onClick={addQuestion}>
          + প্রশ্ন যোগ করো
        </button>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="admin-card p-5 space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-label">অধ্যায় নং</label>
              <input
                type="number"
                className="admin-input"
                value={q.chapter_num}
                onChange={(e) => updateQ(qi, 'chapter_num', Number(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <label className="admin-label">সোর্স</label>
              <input
                className="admin-input"
                value={q.source}
                onChange={(e) => updateQ(qi, 'source', e.target.value)}
                placeholder="ঢা.বো. ২০২৩"
              />
            </div>
          </div>

          <div>
            <label className="admin-label">উদ্দীপক</label>
            <textarea
              className="admin-input"
              rows={3}
              value={q.stem}
              onChange={(e) => updateQ(qi, 'stem', e.target.value)}
            />
          </div>

          {/* Parts */}
          {q.parts.map((p, pi) => (
            <div key={pi} className="pl-4 border-l-2 space-y-2" style={{ borderColor: 'var(--admin-primary)' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{p.label})</span>
                <select
                  className="admin-input"
                  style={{ width: 'auto' }}
                  value={p.type}
                  onChange={(e) => updatePart(qi, pi, 'type', e.target.value)}
                >
                  {PART_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="admin-input"
                  style={{ width: '80px' }}
                  value={p.marks}
                  onChange={(e) => updatePart(qi, pi, 'marks', Number(e.target.value))}
                  min={1}
                />
                <span className="text-sm" style={{ color: 'var(--admin-muted)' }}>নম্বর</span>
              </div>
              <div>
                <label className="admin-label">প্রশ্ন</label>
                <input
                  className="admin-input"
                  value={p.question}
                  onChange={(e) => updatePart(qi, pi, 'question', e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">উত্তর</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={p.answer}
                  onChange={(e) => updatePart(qi, pi, 'answer', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
        </button>
        <button
          className="admin-btn-outline"
          onClick={() => router.push('/cq')}
        >
          বাতিল
        </button>
      </div>
    </div>
  );
}
