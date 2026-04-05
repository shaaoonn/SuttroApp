'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ExamPaper } from '@/data/exams';
import { EXAM_SUBJECT_COLORS } from '@/data/exams';

// ─────────────────────────────────────────────
// ExamResult — Score display + review mode
// ─────────────────────────────────────────────

interface ExamResultProps {
  exam: ExamPaper;
  answers: (number | null)[];
  timeUsed: number; // seconds
  onRetry: () => void;
}

export default function ExamResult({ exam, answers, timeUsed, onRetry }: ExamResultProps) {
  const [showReview, setShowReview] = useState(false);
  const subjectColor = EXAM_SUBJECT_COLORS[exam.subject] || '#1B6B4A';

  // ── Calculate score ──
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    exam.questions.forEach((q, i) => {
      if (answers[i] === null) {
        skipped++;
      } else if (answers[i] === q.correct) {
        correct++;
      } else {
        wrong++;
      }
    });

    const rawScore = correct - wrong * exam.negativeMarking;
    const score = Math.max(0, rawScore);
    const percentage = Math.round((score / exam.totalMarks) * 100);

    return { correct, wrong, skipped, score, percentage };
  }, [exam, answers]);

  // ── Grade ──
  const grade = useMemo(() => {
    if (stats.percentage >= 80) return { label: 'A+', color: '#059669', emoji: '🏆' };
    if (stats.percentage >= 70) return { label: 'A', color: '#2563EB', emoji: '🌟' };
    if (stats.percentage >= 60) return { label: 'A-', color: '#7C3AED', emoji: '👏' };
    if (stats.percentage >= 50) return { label: 'B', color: '#EA580C', emoji: '💪' };
    if (stats.percentage >= 40) return { label: 'C', color: '#DC2626', emoji: '📖' };
    return { label: 'F', color: '#DC2626', emoji: '😔' };
  }, [stats.percentage]);

  // ── Format time ──
  const timeStr = useMemo(() => {
    const m = Math.floor(timeUsed / 60);
    const s = timeUsed % 60;
    return `${m} মিনিট ${s} সেকেন্ড`;
  }, [timeUsed]);

  return (
    <div>
      {/* ── Score Card ── */}
      <div
        className="rounded-[14px] border p-6 lg:p-8 text-center mb-6"
        style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
      >
        <div className="text-5xl mb-3">{grade.emoji}</div>
        <div
          className="text-6xl font-bold mb-1"
          style={{ color: grade.color }}
        >
          {stats.score.toFixed(1)}
        </div>
        <div className="text-base mb-1" style={{ color: 'var(--suttro-muted)' }}>
          {exam.totalMarks} এর মধ্যে
        </div>
        <div
          className="inline-block px-4 py-1.5 rounded-full text-lg font-bold text-white mt-2"
          style={{ background: grade.color }}
        >
          গ্রেড {grade.label} — {stats.percentage}%
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="rounded-[10px] p-4" style={{ background: '#ECFDF5' }}>
            <div className="text-2xl font-bold" style={{ color: '#059669' }}>{stats.correct}</div>
            <div className="text-base" style={{ color: '#059669' }}>সঠিক</div>
          </div>
          <div className="rounded-[10px] p-4" style={{ background: '#FEE2E2' }}>
            <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>{stats.wrong}</div>
            <div className="text-base" style={{ color: '#DC2626' }}>ভুল</div>
          </div>
          <div className="rounded-[10px] p-4" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--suttro-muted)' }}>{stats.skipped}</div>
            <div className="text-base" style={{ color: 'var(--suttro-muted)' }}>বাদ</div>
          </div>
          <div className="rounded-[10px] p-4" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--suttro-deep)' }}>{timeStr.split(' ')[0]}</div>
            <div className="text-base" style={{ color: 'var(--suttro-muted)' }}>মিনিট</div>
          </div>
        </div>

        {/* Negative marking info */}
        {stats.wrong > 0 && (
          <div className="mt-4 p-3 rounded-[10px] text-base" style={{ background: '#FEF3C7', color: '#92400E' }}>
            নেগেটিভ মার্কিং: {stats.wrong} × {exam.negativeMarking} = -{(stats.wrong * exam.negativeMarking).toFixed(2)} নম্বর কাটা হয়েছে
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col lg:flex-row justify-center gap-3 mt-8">
          <button
            onClick={() => setShowReview(!showReview)}
            className="px-6 py-3 rounded-[10px] text-base font-medium suttro-transition"
            style={{ border: `1.5px solid ${subjectColor}`, color: subjectColor }}
          >
            {showReview ? '✕ রিভিউ বন্ধ করো' : '📖 উত্তর রিভিউ করো'}
          </button>
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-[10px] text-base font-medium text-white suttro-transition hover:opacity-90"
            style={{ background: subjectColor }}
          >
            🔄 আবার দাও
          </button>
          <Link
            href="/exams"
            className="px-6 py-3 rounded-[10px] text-base font-medium text-center suttro-transition"
            style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-deep)' }}
          >
            অন্য পরীক্ষা &rarr;
          </Link>
        </div>
      </div>

      {/* ── Review Mode ── */}
      {showReview && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--suttro-deep)' }}>
            উত্তর রিভিউ
          </h3>
          {exam.questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correct;
            const isSkipped = userAnswer === null;

            return (
              <div
                key={q.id}
                className="rounded-[14px] border p-5"
                style={{
                  borderColor: isSkipped ? 'var(--suttro-border)' : isCorrect ? '#059669' : '#DC2626',
                  borderWidth: '2px',
                  background: 'var(--suttro-white)',
                }}
              >
                {/* Status badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-base font-bold text-white"
                    style={{ background: isSkipped ? 'var(--suttro-muted)' : isCorrect ? '#059669' : '#DC2626' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-base font-medium" style={{ color: isSkipped ? 'var(--suttro-muted)' : isCorrect ? '#059669' : '#DC2626' }}>
                    {isSkipped ? 'বাদ দিয়েছ' : isCorrect ? 'সঠিক ✓' : 'ভুল ✗'}
                  </span>
                </div>

                {/* Question */}
                <p className="text-base font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
                  {q.question}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, j) => {
                    const isUserPick = userAnswer === j;
                    const isRight = q.correct === j;

                    let optBg = 'transparent';
                    let optBorder = 'var(--suttro-border)';
                    let optColor = 'var(--suttro-text)';

                    if (isRight) {
                      optBg = '#ECFDF5';
                      optBorder = '#059669';
                      optColor = '#059669';
                    } else if (isUserPick && !isRight) {
                      optBg = '#FEE2E2';
                      optBorder = '#DC2626';
                      optColor = '#DC2626';
                    }

                    return (
                      <div
                        key={j}
                        className="flex items-start gap-3 p-3 rounded-[10px] border"
                        style={{ background: optBg, borderColor: optBorder }}
                      >
                        <span
                          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            background: isRight ? '#059669' : isUserPick ? '#DC2626' : 'var(--suttro-sky)',
                            color: isRight || isUserPick ? 'white' : 'var(--suttro-muted)',
                          }}
                        >
                          {opt.label}
                        </span>
                        <span className="text-base" style={{ color: optColor }}>
                          {opt.text}
                          {isRight && ' ✓'}
                          {isUserPick && !isRight && ' ✗'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-3 rounded-[10px] text-base" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
