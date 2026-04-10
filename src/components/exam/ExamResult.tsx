'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ExamPaper } from '@/data/exams';
import { EXAM_SUBJECT_COLORS } from '@/data/exams';
import type { EarnedBadge } from '@/lib/analytics';

// ─────────────────────────────────────────────
// ExamResult — Score display + review mode
// Design reference Page 6
// ─────────────────────────────────────────────

interface ExamResultProps {
  exam: ExamPaper;
  answers: (number | null)[];
  timeUsed: number;
  onRetry: () => void;
  earnedBadges?: EarnedBadge[];
}

export default function ExamResult({ exam, answers, timeUsed, onRetry, earnedBadges }: ExamResultProps) {
  const [showReview, setShowReview] = useState(false);
  const subjectColor = EXAM_SUBJECT_COLORS[exam.subject] || '#0D9488';

  const stats = useMemo(() => {
    let correct = 0, wrong = 0, skipped = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === null) skipped++;
      else if (answers[i] === q.correct) correct++;
      else wrong++;
    });
    const rawScore = correct - wrong * exam.negativeMarking;
    const score = Math.max(0, rawScore);
    const percentage = Math.round((score / exam.totalMarks) * 100);
    return { correct, wrong, skipped, score, percentage };
  }, [exam, answers]);

  const grade = useMemo(() => {
    if (stats.percentage >= 80) return { label: 'A+', color: '#10B981', emoji: '🏆' };
    if (stats.percentage >= 70) return { label: 'A', color: '#3B82F6', emoji: '🌟' };
    if (stats.percentage >= 60) return { label: 'A-', color: '#7C3AED', emoji: '👏' };
    if (stats.percentage >= 50) return { label: 'B', color: '#EA580C', emoji: '💪' };
    if (stats.percentage >= 40) return { label: 'C', color: '#DC2626', emoji: '📖' };
    return { label: 'F', color: '#DC2626', emoji: '😔' };
  }, [stats.percentage]);

  const timeStr = useMemo(() => {
    const m = Math.floor(timeUsed / 60);
    const s = timeUsed % 60;
    return `${m} মিনিট ${s} সেকেন্ড`;
  }, [timeUsed]);

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* ── Hero result section ── */}
      <div
        className="text-center px-4 py-6"
        style={{
          background: 'linear-gradient(180deg, #F0FDFA, #F8FAFB)',
        }}
      >
        {/* Green checkmark circle */}
        <div
          className="w-[72px] h-[72px] mx-auto mb-3 rounded-full flex items-center justify-center text-3xl text-white"
          style={{
            background: 'linear-gradient(135deg, #10B981, #34D399)',
            boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
          }}
        >
          ✓
        </div>

        <div className="text-lg font-bold mb-0.5" style={{ color: '#134E4A' }}>
          {stats.percentage >= 80 ? 'দারুণ!' : stats.percentage >= 50 ? 'ভালো হয়েছে!' : 'আরো চেষ্টা করো!'}
        </div>
        <div className="text-[11px] mb-4" style={{ color: '#5F9EA0' }}>
          {exam.subjectBn} — পরীক্ষা সম্পূর্ণ
        </div>

        {/* 3 stat cards */}
        <div className="flex gap-2 justify-center mb-4">
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'white', border: '1px solid #CCFBF1' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#0D9488' }}>
              {stats.percentage}%
            </div>
            <div className="text-[10px]" style={{ color: '#5F9EA0' }}>স্কোর</div>
          </div>
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'white', border: '1px solid #F0F4F3' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
              {stats.correct}/{totalQ()}
            </div>
            <div className="text-[10px]" style={{ color: '#5F9EA0' }}>সঠিক</div>
          </div>
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'white', border: '1px solid #F0F4F3' }}
          >
            <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
              +{Math.round(stats.percentage >= 80 ? 50 : 20)}
            </div>
            <div className="text-[10px]" style={{ color: '#5F9EA0' }}>XP</div>
          </div>
        </div>

        {/* Badge announcement */}
        {earnedBadges && earnedBadges.length > 0 && (
          <div className="mb-4">
            {earnedBadges.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                }}
              >
                🏆 নতুন ব্যাজ: {b.name}!
              </span>
            ))}
          </div>
        )}

        {/* Grade badge */}
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: grade.color }}
        >
          গ্রেড {grade.label}
        </span>
      </div>

      {/* ── Details card ── */}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold mb-2" style={{ color: '#134E4A' }}>
          বিস্তারিত
        </div>
        <div
          className="rounded-xl p-3.5 mb-3"
          style={{ background: 'white', border: '1px solid #F0F4F3' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
            <span className="text-xs" style={{ color: '#134E4A' }}>
              সঠিক: {stats.correct} প্রশ্ন
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
            <span className="text-xs" style={{ color: '#134E4A' }}>
              ভুল: {stats.wrong} প্রশ্ন
            </span>
          </div>
          {stats.skipped > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#94A3B8' }} />
              <span className="text-xs" style={{ color: '#134E4A' }}>
                বাদ: {stats.skipped} প্রশ্ন
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
            <span className="text-xs" style={{ color: '#134E4A' }}>
              সময়: {timeStr}
            </span>
          </div>
        </div>

        {/* Negative marking info */}
        {stats.wrong > 0 && (
          <div className="rounded-xl p-3 mb-3 text-xs" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
            নেগেটিভ মার্কিং: {stats.wrong} × {exam.negativeMarking} = -{(stats.wrong * exam.negativeMarking).toFixed(2)} নম্বর কাটা হয়েছে
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold suttro-transition"
            style={{
              background: 'white',
              color: '#0D9488',
              border: '1.5px solid #99F6E4',
            }}
          >
            {showReview ? '✕ বন্ধ করো' : 'উত্তর দেখো'}
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white suttro-transition"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
            }}
          >
            আবার দাও
          </button>
        </div>

        <Link
          href="/exams"
          className="block text-center mt-2 py-2 rounded-xl text-xs font-medium suttro-transition"
          style={{ color: '#5F9EA0' }}
        >
          অন্য পরীক্ষা →
        </Link>
      </div>

      {/* ── Review Mode ── */}
      {showReview && (
        <div className="px-4 pb-6">
          <div className="text-xs font-semibold mb-2 tracking-wider" style={{ color: '#5F9EA0' }}>
            উত্তর রিভিউ
          </div>
          <div className="flex flex-col gap-2">
            {exam.questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correct;
              const isSkipped = userAnswer === null;

              return (
                <div
                  key={q.id}
                  className="rounded-xl p-3.5"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${isSkipped ? '#F0F4F3' : isCorrect ? '#10B981' : '#EF4444'}`,
                  }}
                >
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: isSkipped ? '#94A3B8' : isCorrect ? '#10B981' : '#EF4444' }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: isSkipped ? '#94A3B8' : isCorrect ? '#10B981' : '#EF4444' }}
                    >
                      {isSkipped ? 'বাদ দিয়েছ' : isCorrect ? 'সঠিক ✓' : 'ভুল ✗'}
                    </span>
                  </div>

                  {/* Question */}
                  <p className="text-xs font-semibold mb-2 leading-relaxed" style={{ color: '#134E4A' }}>
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, j) => {
                      const isUserPick = userAnswer === j;
                      const isRight = q.correct === j;

                      let optBg = 'transparent';
                      let optBorder = '#F0F4F3';
                      let optColor = '#134E4A';

                      if (isRight) {
                        optBg = '#ECFDF5';
                        optBorder = '#10B981';
                        optColor = '#10B981';
                      } else if (isUserPick && !isRight) {
                        optBg = '#FEF2F2';
                        optBorder = '#EF4444';
                        optColor = '#EF4444';
                      }

                      return (
                        <div
                          key={j}
                          className="flex items-start gap-2 p-2 rounded-lg"
                          style={{ background: optBg, border: `1px solid ${optBorder}` }}
                        >
                          <span
                            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: isRight ? '#10B981' : isUserPick ? '#EF4444' : '#F8FAFB',
                              color: isRight || isUserPick ? 'white' : '#94A3B8',
                            }}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[11px]" style={{ color: optColor }}>
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
                    <div className="mt-2 p-2 rounded-lg text-[11px]" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  function totalQ() {
    return exam.questions.length;
  }
}
