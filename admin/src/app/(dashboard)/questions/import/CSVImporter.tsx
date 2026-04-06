'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface ParsedQuestion {
  question: string;
  option_ka: string;
  option_kha: string;
  option_ga: string;
  option_gha: string;
  correct: number;
  explanation: string;
  chapter_num: number;
}

const SUBJECTS = [
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
];

const ANSWER_MAP: Record<string, number> = { 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3 };

function parseCSV(text: string): ParsedQuestion[] {
  const lines = text.split('\n').filter((l) => l.trim());
  const questions: ParsedQuestion[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 7) continue;

    // Expected format: chapter,question,optionKa,optionKha,optionGa,optionGha,answer[,explanation]
    const chNum = parseInt(cols[0]) || 1;
    const q = cols[1];
    const opts = cols.slice(2, 6);
    const answerStr = cols[6].trim();
    const explanation = cols[7] || '';

    // Convert answer (ক/খ/গ/ঘ or 0/1/2/3)
    let correct = ANSWER_MAP[answerStr] ?? parseInt(answerStr);
    if (isNaN(correct) || correct < 0 || correct > 3) correct = 0;

    questions.push({
      question: q,
      option_ka: opts[0],
      option_kha: opts[1],
      option_ga: opts[2],
      option_gha: opts[3],
      correct,
      explanation,
      chapter_num: chNum,
    });
  }

  return questions;
}

export default function CSVImporter() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [examId, setExamId] = useState('');
  const [subject, setSubject] = useState('physics');
  const [year, setYear] = useState(2025);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const qs = parseCSV(text);
      setParsed(qs);
      setError('');
      setSuccess('');
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!examId.trim()) {
      setError('পরীক্ষার ID দিন (যেমন: ssc-2025-physics)');
      return;
    }
    if (parsed.length === 0) {
      setError('কোনো প্রশ্ন পাওয়া যায়নি');
      return;
    }

    setSaving(true);
    setError('');

    // Ensure exam paper exists
    const subjectBn = SUBJECTS.find((s) => s.value === subject)?.label || subject;
    const { error: examErr } = await supabase.from('exam_papers').upsert({
      id: examId,
      title: `${subjectBn} ${year}`,
      subject_id: subject,
      subject_bn: subjectBn,
      year,
      class_level: '10',
      duration: 30,
      total_marks: parsed.length,
      negative_marking: false,
      is_published: false,
    }, { onConflict: 'id' });

    if (examErr) {
      setError(examErr.message);
      setSaving(false);
      return;
    }

    // Delete existing questions
    await supabase.from('mcq_questions').delete().eq('exam_paper_id', examId);

    // Insert parsed questions
    const payload = parsed.map((q, i) => ({
      exam_paper_id: examId,
      question_order: i + 1,
      ...q,
      explanation: q.explanation || null,
    }));

    const { error: qErr } = await supabase.from('mcq_questions').insert(payload);
    if (qErr) {
      setError(qErr.message);
      setSaving(false);
      return;
    }

    setSuccess(`${parsed.length}টি প্রশ্ন সফলভাবে ইম্পোর্ট হয়েছে!`);
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">CSV ফাইল আপলোড</h2>
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
          ফরম্যাট: chapter, question, optionKa, optionKha, optionGa, optionGha, answer, explanation
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="admin-input"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="admin-label">পরীক্ষা ID</label>
            <input
              className="admin-input"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              placeholder="ssc-2025-physics"
            />
          </div>
          <div>
            <label className="admin-label">বিষয়</label>
            <select
              className="admin-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
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
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      {parsed.length > 0 && (
        <div className="admin-card p-6">
          <h3 className="font-semibold mb-4">প্রিভিউ ({parsed.length}টি প্রশ্ন)</h3>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {parsed.slice(0, 20).map((q, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: '#f8fafc' }}>
                <div className="text-sm font-medium mb-1">
                  {i + 1}. [অধ্যায় {q.chapter_num}] {q.question}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: 'var(--admin-muted)' }}>
                  <span style={q.correct === 0 ? { color: 'var(--admin-success)', fontWeight: 600 } : {}}>ক) {q.option_ka}</span>
                  <span style={q.correct === 1 ? { color: 'var(--admin-success)', fontWeight: 600 } : {}}>খ) {q.option_kha}</span>
                  <span style={q.correct === 2 ? { color: 'var(--admin-success)', fontWeight: 600 } : {}}>গ) {q.option_ga}</span>
                  <span style={q.correct === 3 ? { color: 'var(--admin-success)', fontWeight: 600 } : {}}>ঘ) {q.option_gha}</span>
                </div>
              </div>
            ))}
            {parsed.length > 20 && (
              <p className="text-sm text-center" style={{ color: 'var(--admin-muted)' }}>
                ...এবং আরো {parsed.length - 20}টি প্রশ্ন
              </p>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm bg-green-50 p-3 rounded-lg" style={{ color: 'var(--admin-success)' }}>{success}</p>}

      {parsed.length > 0 && (
        <button className="admin-btn-primary" onClick={handleImport} disabled={saving}>
          {saving ? 'ইম্পোর্ট হচ্ছে...' : `${parsed.length}টি প্রশ্ন ইম্পোর্ট করো`}
        </button>
      )}
    </div>
  );
}
