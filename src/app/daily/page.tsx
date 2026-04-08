'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface Question {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correct: number;
  explanation: string | null;
}

type Phase = 'loading' | 'ready' | 'playing' | 'finished' | 'already_done';

export default function DailyChallengePage() {
  const { session } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [score, setScore] = useState(0);

  const loadChallenge = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    const res = await fetch('/api/daily-challenge', { headers });
    const data = await res.json();

    if (data.completed) {
      setPhase('already_done');
      return;
    }

    setQuestions(data.questions ?? []);
    setAnswers(new Array(data.questions?.length ?? 0).fill(null));
    setPhase('ready');
  }, [session]);

  useEffect(() => { loadChallenge(); }, [loadChallenge]);

  const q = questions[current];

  function handleStart() {
    setPhase('playing');
  }

  function handleSelect(idx: number) {
    if (revealed) return;
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
    setRevealed(true);
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setRevealed(false);
    } else {
      // Calculate score and finish
      const correct = answers.reduce<number>(
        (acc, ans, i) => acc + (ans === questions[i]?.correct ? 1 : 0), 0
      );
      setScore(correct ?? 0);
      setPhase('finished');

      // Submit result
      if (session?.access_token) {
        fetch('/api/daily-challenge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ score: correct, total: questions.length }),
        }).catch(() => {});
      }
    }
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="animate-spin h-8 w-8 border-3 rounded-full"
          style={{ borderColor: 'var(--suttro-primary) transparent transparent transparent' }} />
      </div>
    );
  }

  if (phase === 'already_done') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            আজকের চ্যালেঞ্জ শেষ!
          </h1>
          <p className="mb-6" style={{ color: 'var(--suttro-muted)' }}>
            কাল আবার নতুন চ্যালেঞ্জ আসবে। ততক্ষণ প্র্যাক্টিস করো!
          </p>
          <Link href="/exams" className="inline-block px-6 py-3 rounded-[10px] text-white font-medium"
            style={{ background: 'var(--suttro-primary)' }}>
            পরীক্ষা দাও →
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            দৈনিক চ্যালেঞ্জ
          </h1>
          <p className="mb-2" style={{ color: 'var(--suttro-text)' }}>
            ৫টি প্রশ্ন — প্রতিদিন নতুন!
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--suttro-muted)' }}>
            সব প্রশ্ন সঠিক হলে বোনাস XP পাবে
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-[10px] text-white font-medium text-lg"
            style={{ background: 'var(--suttro-primary)' }}
          >
            শুরু করো →
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = score === questions.length ? '🏆' : score >= 3 ? '👏' : '💪';

    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">{emoji}</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            চ্যালেঞ্জ শেষ!
          </h1>
          <p className="text-4xl font-bold mb-2" style={{ color: 'var(--suttro-primary)' }}>
            {score}/{questions.length}
          </p>
          <p className="mb-1" style={{ color: 'var(--suttro-text)' }}>{pct}% সঠিক</p>
          <p className="text-sm mb-6" style={{ color: 'var(--suttro-muted)' }}>
            {score === questions.length
              ? '+50 XP বোনাস!'
              : `+25 XP অর্জিত`}
          </p>
          <div className="space-y-3">
            <Link href="/dashboard" className="block py-3 rounded-[10px] text-white font-medium"
              style={{ background: 'var(--suttro-primary)' }}>
              ড্যাশবোর্ড দেখো
            </Link>
            <Link href="/leaderboard" className="block py-3 rounded-[10px] font-medium"
              style={{ color: 'var(--suttro-primary)', border: '1.5px solid var(--suttro-primary)' }}>
              লিডারবোর্ড দেখো
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold" style={{ color: 'var(--suttro-deep)' }}>
            🎯 দৈনিক চ্যালেঞ্জ
          </h1>
          <span className="text-sm font-medium" style={{ color: 'var(--suttro-muted)' }}>
            {current + 1}/{questions.length}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-all"
              style={{
                background: i < current ? (answers[i] === questions[i]?.correct ? '#16a34a' : '#dc2626')
                  : i === current ? 'var(--suttro-primary)' : 'var(--suttro-border)',
              }}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="rounded-[14px] border p-6 mb-4" style={{ background: 'var(--suttro-white)', borderColor: 'var(--suttro-border)' }}>
          <p className="text-base font-medium mb-6" style={{ color: 'var(--suttro-deep)', whiteSpace: 'pre-wrap' }}>
            {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let bg = 'var(--suttro-surface)';
              let border = 'var(--suttro-border)';

              if (revealed) {
                if (idx === q.correct) {
                  bg = '#dcfce7'; border = '#16a34a';
                } else if (idx === answers[current] && idx !== q.correct) {
                  bg = '#fef2f2'; border = '#dc2626';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={revealed}
                  className="w-full text-left p-4 rounded-[10px] border transition-all"
                  style={{ background: bg, borderColor: border }}
                >
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {revealed && q.explanation && (
            <div className="mt-4 p-4 rounded-[10px]" style={{ background: '#eff6ff' }}>
              <p className="text-sm" style={{ color: 'var(--suttro-text)', whiteSpace: 'pre-wrap' }}>
                {q.explanation}
              </p>
            </div>
          )}
        </div>

        {revealed && (
          <button onClick={handleNext} className="w-full py-3 rounded-[10px] text-white font-medium"
            style={{ background: 'var(--suttro-primary)' }}>
            {current < questions.length - 1 ? 'পরবর্তী →' : 'ফলাফল দেখো'}
          </button>
        )}
      </div>
    </div>
  );
}
