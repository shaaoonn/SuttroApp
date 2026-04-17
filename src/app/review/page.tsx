'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/native/Skeleton';

interface SRSCard {
  cardId: number;
  questionId: number;
  question: string;
  options: { label: string; text: string }[];
  correct: number;
  explanation: string | null;
  repetitions: number;
  interval: number;
}

type Phase = 'loading' | 'empty' | 'reviewing' | 'finished';

export default function ReviewPage() {
  const { session, user } = useAuth();
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [remaining, setRemaining] = useState(0);

  const loadCards = useCallback(async () => {
    if (!session?.access_token) return;

    const res = await fetch('/api/srs', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    const c = data.cards ?? [];
    setCards(c);
    setRemaining(data.totalDue ?? 0);
    setPhase(c.length === 0 ? 'empty' : 'reviewing');
  }, [session]);

  useEffect(() => {
    if (session) loadCards();
  }, [session, loadCards]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="font-medium mb-4" style={{ color: 'var(--suttro-deep)' }}>রিভিউ করতে লগ ইন করো</p>
          <Link href="/login" className="text-sm underline" style={{ color: 'var(--suttro-primary)' }}>লগ ইন →</Link>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div style={{ background: 'var(--suttro-surface)', minHeight: '60vh' }}>
        <div className="mx-auto max-w-2xl px-4 py-6 fade-in space-y-4">
          <Skeleton className="h-7 w-1/2" />
          <div className="p-4 bg-white rounded-xl border border-gray-100 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-12 w-full" rounded="lg" />
            <Skeleton className="h-12 w-full" rounded="lg" />
            <Skeleton className="h-12 w-full" rounded="lg" />
            <Skeleton className="h-12 w-full" rounded="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            কোনো রিভিউ কার্ড নেই!
          </h1>
          <p className="mb-6" style={{ color: 'var(--suttro-muted)' }}>
            পরীক্ষা দিলে ভুল উত্তরগুলো স্বয়ংক্রিয়ভাবে রিভিউ ডেকে যোগ হবে।
          </p>
          <Link href="/exams" className="inline-block px-6 py-3 rounded-[10px] text-white font-medium"
            style={{ background: 'var(--suttro-primary)' }}>
            পরীক্ষা দাও →
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            রিভিউ সম্পন্ন!
          </h1>
          <div className="flex justify-center gap-6 mb-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{stats.correct}</p>
              <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>সঠিক</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{stats.wrong}</p>
              <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>ভুল</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--suttro-primary)' }}>
                {stats.correct + stats.wrong > 0 ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) : 0}%
              </p>
              <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>নির্ভুলতা</p>
            </div>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--suttro-primary)' }}>
            +15 XP অর্জিত
          </p>
          <div className="space-y-3">
            <Link href="/dashboard" className="block text-center py-3 rounded-[10px] text-white font-medium"
              style={{ background: 'var(--suttro-primary)' }}>
              ড্যাশবোর্ড দেখো
            </Link>
            <Link href="/guide" className="block text-center py-3 rounded-[10px] font-medium"
              style={{ color: 'var(--suttro-primary)', border: '1.5px solid var(--suttro-primary)' }}>
              অনুশীলন করো →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[current];
  if (!card) return null;

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);

    const isCorrect = idx === card.correct;
    setStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
    }));

    // Submit review to SRS
    const quality = isCorrect ? 4 : 1; // SM-2: 4 = correct with effort, 1 = wrong
    if (session?.access_token) {
      fetch('/api/srs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ cardId: card.cardId, quality }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.remaining !== undefined) setRemaining(data.remaining);
        })
        .catch(() => {});
    }
  }

  function handleNext() {
    if (current < cards.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setPhase('finished');
    }
  }

  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--suttro-deep)' }}>🧠 রিভিউ</h1>
            <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>স্পেসড রিপিটিশন</p>
          </div>
          <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'var(--suttro-white)', color: 'var(--suttro-muted)' }}>
            {remaining} টি বাকি
          </span>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 rounded-full mb-6" style={{ background: 'var(--suttro-border)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / cards.length) * 100}%`, background: 'var(--suttro-primary)' }} />
        </div>

        {/* Card */}
        <div className="rounded-[14px] border p-6 mb-4" style={{ background: 'var(--suttro-white)', borderColor: 'var(--suttro-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              background: card.repetitions === 0 ? '#fef2f2' : '#eff6ff',
              color: card.repetitions === 0 ? '#dc2626' : '#2563eb',
            }}>
              {card.repetitions === 0 ? 'নতুন' : `${card.interval} দিন পর`}
            </span>
          </div>

          <p className="text-base font-medium mb-6" style={{ color: 'var(--suttro-deep)', whiteSpace: 'pre-wrap' }}>
            {card.question}
          </p>

          <div className="space-y-3">
            {card.options.map((opt, idx) => {
              let bg = 'var(--suttro-surface)';
              let border = 'var(--suttro-border)';

              if (revealed) {
                if (idx === card.correct) { bg = '#dcfce7'; border = '#16a34a'; }
                else if (idx === selected && idx !== card.correct) { bg = '#fef2f2'; border = '#dc2626'; }
              }

              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={revealed}
                  className="w-full text-left p-4 rounded-[10px] border transition-all"
                  style={{ background: bg, borderColor: border }}>
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {revealed && card.explanation && (
            <div className="mt-4 p-4 rounded-[10px]" style={{ background: '#eff6ff' }}>
              <p className="text-sm" style={{ color: 'var(--suttro-text)', whiteSpace: 'pre-wrap' }}>
                {card.explanation}
              </p>
            </div>
          )}
        </div>

        {revealed && (
          <button onClick={handleNext} className="w-full py-3 rounded-[10px] text-white font-medium"
            style={{ background: 'var(--suttro-primary)' }}>
            {current < cards.length - 1 ? 'পরবর্তী কার্ড →' : 'রিভিউ শেষ করো ✓'}
          </button>
        )}
      </div>
    </div>
  );
}
