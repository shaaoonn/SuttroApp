'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { SUBJECT_LABELS, SUBJECT_COLORS } from '@/lib/constants';

interface Question {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correct: number;
  explanation: string | null;
}

export default function PracticePage() {
  const { subject, chapter } = useParams<{ subject: string; chapter: string }>();
  const { session } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const subjectLabel = SUBJECT_LABELS[subject] || subject;
  const color = SUBJECT_COLORS[subject] || '#2563EB';

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/practice?subject=${subject}&chapter=${chapter}&count=20`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setLoading(false);
  }, [subject, chapter]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const q = questions[current];

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);

    const isCorrect = idx === q.correct;
    setStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
      total: s.total + 1,
    }));

    // Track in API if logged in
    if (session?.access_token) {
      fetch('/api/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionId: q.id,
          selected: idx,
          isCorrect,
        }),
      }).catch(() => {});

      // Award XP for correct answer
      if (isCorrect) {
        fetch('/api/xp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ source: 'practice_question' }),
        }).catch(() => {});
      } else {
        // Add wrong answer to SRS review deck
        fetch('/api/srs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'add_wrong', questionIds: [q.id] }),
        }).catch(() => {});
      }
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      // Load more questions
      loadQuestions();
      setStats({ correct: 0, wrong: 0, total: 0 });
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 rounded-full mx-auto mb-3"
            style={{ borderColor: `${color} transparent transparent transparent` }} />
          <p style={{ color: 'var(--suttro-muted)' }}>প্রশ্ন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center">
          <p className="text-xl mb-4">😕</p>
          <p className="font-medium mb-4" style={{ color: 'var(--suttro-deep)' }}>এই অধ্যায়ে কোনো প্রশ্ন নেই</p>
          <Link href="/exams" className="text-sm underline" style={{ color: 'var(--suttro-primary)' }}>
            পরীক্ষায় ফিরে যাও
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href={`/guide/${subject}`} className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              ← {subjectLabel}
            </Link>
            <h1 className="text-lg font-bold" style={{ color: 'var(--suttro-deep)' }}>
              অনুশীলন — অধ্যায় {chapter}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span style={{ color: '#16a34a' }}>✓ {stats.correct}</span>
            <span style={{ color: '#dc2626' }}>✗ {stats.wrong}</span>
            <span style={{ color: 'var(--suttro-muted)' }}>{stats.total} সম্পন্ন</span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 rounded-full mb-6" style={{ background: 'var(--suttro-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%`, background: color }}
          />
        </div>

        {/* Question */}
        <div className="rounded-[14px] border p-6 mb-4" style={{ background: 'var(--suttro-white)', borderColor: 'var(--suttro-border)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--suttro-muted)' }}>
            প্রশ্ন {current + 1}/{questions.length}
          </p>
          <p className="text-base font-medium mb-6" style={{ color: 'var(--suttro-deep)', whiteSpace: 'pre-wrap' }}>
            {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let bg = 'var(--suttro-surface)';
              let border = 'var(--suttro-border)';
              let textColor = 'var(--suttro-text)';

              if (revealed) {
                if (idx === q.correct) {
                  bg = '#dcfce7'; border = '#16a34a'; textColor = '#15803d';
                } else if (idx === selected && idx !== q.correct) {
                  bg = '#fef2f2'; border = '#dc2626'; textColor = '#dc2626';
                }
              } else if (idx === selected) {
                border = color;
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={revealed}
                  className="w-full text-left p-4 rounded-[10px] border transition-all"
                  style={{ background: bg, borderColor: border, color: textColor }}
                >
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && q.explanation && (
            <div className="mt-4 p-4 rounded-[10px]" style={{ background: '#eff6ff', borderLeft: `3px solid ${color}` }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--suttro-deep)' }}>ব্যাখ্যা:</p>
              <p className="text-sm" style={{ color: 'var(--suttro-text)', whiteSpace: 'pre-wrap' }}>
                {q.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Next button */}
        {revealed && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-[10px] text-base font-medium text-white"
            style={{ background: color }}
          >
            {current < questions.length - 1 ? 'পরবর্তী প্রশ্ন →' : 'আরো প্র্যাক্টিস করো 🔄'}
          </button>
        )}
      </div>
    </div>
  );
}
