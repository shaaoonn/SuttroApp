'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ChapterProgress {
  chapter_num: number;
  mastery_pct: number;
  mcq_attempted: number;
  mcq_correct: number;
}

interface Props {
  subjectId: string;
  totalChapters: number;
  color: string;
}

export default function ChapterMastery({ subjectId, totalChapters, color }: Props) {
  const { session } = useAuth();
  const [progress, setProgress] = useState<ChapterProgress[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session?.access_token) { setLoaded(true); return; }
    fetch('/api/chapter-progress', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.chapters) {
          setProgress(data.chapters.filter((c: { subject_id: string }) => c.subject_id === subjectId));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [session?.access_token, subjectId]);

  if (!loaded || progress.length === 0) return null;

  const totalAttempted = progress.reduce((a, c) => a + c.mcq_attempted, 0);
  const totalCorrect = progress.reduce((a, c) => a + c.mcq_correct, 0);
  const avgMastery = Math.round(progress.reduce((a, c) => a + Number(c.mastery_pct), 0) / progress.length);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div
      className="rounded-[14px] border p-5 mb-6"
      style={{ borderColor: color, background: `${color}08` }}
    >
      <div className="flex flex-wrap items-center gap-6">
        {/* Mastery circle */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke={`${color}20`} strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={`${(avgMastery / 100) * 175.93} 175.93`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold" style={{ color }}>{avgMastery}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--suttro-deep)' }}>
            তোমার অগ্রগতি
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: 'var(--suttro-muted)' }}>
            <span>{progress.length}/{totalChapters} অধ্যায়ে অনুশীলন</span>
            <span>{totalCorrect}/{totalAttempted} সঠিক ({accuracy}%)</span>
          </div>
          {/* Mini chapter bars */}
          <div className="flex gap-1 mt-3">
            {Array.from({ length: totalChapters }, (_, i) => {
              const ch = progress.find((p) => p.chapter_num === i + 1);
              const mastery = ch ? Number(ch.mastery_pct) : 0;
              return (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full"
                  title={`অধ্যায় ${i + 1}: ${mastery}%`}
                  style={{
                    background: mastery > 0 ? color : `${color}15`,
                    opacity: mastery > 0 ? Math.max(0.3, mastery / 100) : 1,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
