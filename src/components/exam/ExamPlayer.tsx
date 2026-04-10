'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ExamPaper } from '@/data/exams';
import { EXAM_SUBJECT_COLORS } from '@/data/exams';
import ExamResult from './ExamResult';
import { trackEvent, saveExamAttempt, type EarnedBadge } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// ExamPlayer — MCQ Exam Interface
// Design reference Page 5
// ─────────────────────────────────────────────

// Subject-specific styling
const SUBJECT_STYLES: Record<string, { bg: string; lightBg: string; border: string; text: string; light: string }> = {
  physics: { bg: '#3B82F6', lightBg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', light: '#60A5FA' },
  chemistry: { bg: '#7C3AED', lightBg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', light: '#A78BFA' },
  biology: { bg: '#EC4899', lightBg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D', light: '#F472B6' },
  math: { bg: '#DC2626', lightBg: '#FEF2F2', border: '#FECACA', text: '#991B1B', light: '#F87171' },
  'higher-math': { bg: '#EA580C', lightBg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', light: '#FB923C' },
};

interface ExamPlayerProps {
  exam: ExamPaper;
}

type ExamState = 'ready' | 'running' | 'finished';

export default function ExamPlayer({ exam }: ExamPlayerProps) {
  const { session } = useAuth();
  const [state, setState] = useState<ExamState>('ready');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(exam.questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [showPalette, setShowPalette] = useState(false);
  const hasSavedRef = useRef(false);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);

  const subjectColor = EXAM_SUBJECT_COLORS[exam.subject] || '#0D9488';
  const styles = SUBJECT_STYLES[exam.subject] || {
    bg: subjectColor, lightBg: `${subjectColor}10`, border: `${subjectColor}30`,
    text: subjectColor, light: subjectColor,
  };
  const question = exam.questions[currentQ];
  const totalQ = exam.questions.length;
  const accessToken = session?.access_token;

  // ── Timer ──
  useEffect(() => {
    if (state !== 'running') return;
    if (timeLeft <= 0) { setState('finished'); return; }
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setState('finished'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const selectAnswer = useCallback((optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = next[currentQ] === optionIndex ? null : optionIndex;
      return next;
    });
  }, [currentQ]);

  const goNext = useCallback(() => {
    if (currentQ < totalQ - 1) setCurrentQ((q) => q + 1);
  }, [currentQ, totalQ]);

  const goPrev = useCallback(() => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }, [currentQ]);

  const goTo = useCallback((index: number) => {
    setCurrentQ(index);
    setShowPalette(false);
  }, []);

  // ── Save exam attempt when finished ──
  useEffect(() => {
    if (state !== 'finished' || hasSavedRef.current) return;
    hasSavedRef.current = true;

    let correct = 0, wrong = 0, skipped = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === null) skipped++;
      else if (answers[i] === q.correct) correct++;
      else wrong++;
    });
    const score = Math.max(0, correct - wrong * exam.negativeMarking);
    const durationSeconds = exam.duration * 60 - timeLeft;

    if (accessToken) {
      saveExamAttempt(
        { examPaperId: exam.id, score, totalMarks: exam.totalMarks, correctCount: correct, wrongCount: wrong, skippedCount: skipped, durationSeconds, answers },
        accessToken,
      ).then((result) => {
        if (result.badges && result.badges.length > 0) setEarnedBadges(result.badges);
      });

      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
      fetch('/api/xp', {
        method: 'POST', headers,
        body: JSON.stringify({ source: 'exam_complete', metadata: { examId: exam.id } }),
      }).catch(() => {});

      const pct = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
      if (pct >= 80) {
        fetch('/api/xp', {
          method: 'POST', headers,
          body: JSON.stringify({ source: 'exam_high_score', metadata: { examId: exam.id, score: pct } }),
        }).catch(() => {});
      }

      const wrongQuestionIds = exam.questions
        .filter((q, i) => answers[i] !== null && answers[i] !== q.correct)
        .map((q) => q.id)
        .filter((id): id is number => id !== undefined);

      if (wrongQuestionIds.length > 0) {
        fetch('/api/srs', {
          method: 'POST', headers,
          body: JSON.stringify({ action: 'add_wrong', questionIds: wrongQuestionIds }),
        }).catch(() => {});
      }
    }
  }, [state, exam, answers, timeLeft, accessToken]);

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const unansweredCount = totalQ - answeredCount;
  const progressPct = Math.round(((currentQ + 1) / totalQ) * 100);

  const handleSubmit = useCallback(() => {
    if (answeredCount === 0) return;
    setState('finished');
  }, [answeredCount]);

  const handleStart = useCallback(() => {
    setState('running');
    trackEvent(
      { eventType: 'exam_started', contentType: 'exam', contentId: exam.id },
      accessToken,
    );
  }, [exam.id, accessToken]);

  const handleRetry = useCallback(() => {
    setAnswers(new Array(exam.questions.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(exam.duration * 60);
    hasSavedRef.current = false;
    setState('ready');
  }, [exam]);

  // ═══════════════════════════════════════
  // READY STATE
  // ═══════════════════════════════════════
  if (state === 'ready') {
    return (
      <div style={{ background: '#F8FAFB', minHeight: '60vh' }}>
        <div className="px-4 py-6 text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl text-white"
            style={{
              background: `linear-gradient(135deg, ${styles.bg}, ${styles.light})`,
              boxShadow: `0 6px 20px ${styles.bg}30`,
            }}
          >
            📝
          </div>

          <h2 className="text-lg font-bold mb-1" style={{ color: '#134E4A' }}>
            {exam.title}
          </h2>

          <div className="flex flex-wrap justify-center gap-1.5 mb-5">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
              style={{ background: styles.bg }}
            >
              {exam.subjectBn}
            </span>
            {exam.board && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: '#F8FAFB', color: '#94A3B8' }}
              >
                {exam.board}
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-5 max-w-xs mx-auto">
            <div className="rounded-xl p-3" style={{ background: styles.lightBg, border: `1px solid ${styles.border}` }}>
              <div className="text-lg font-bold" style={{ color: styles.bg }}>{totalQ}</div>
              <div className="text-[11px]" style={{ color: styles.text }}>প্রশ্ন</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: styles.lightBg, border: `1px solid ${styles.border}` }}>
              <div className="text-lg font-bold" style={{ color: styles.bg }}>{exam.duration} মি.</div>
              <div className="text-[11px]" style={{ color: styles.text }}>সময়</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: styles.lightBg, border: `1px solid ${styles.border}` }}>
              <div className="text-lg font-bold" style={{ color: styles.bg }}>{exam.totalMarks}</div>
              <div className="text-[11px]" style={{ color: styles.text }}>মোট নম্বর</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: styles.lightBg, border: `1px solid ${styles.border}` }}>
              <div className="text-lg font-bold" style={{ color: styles.bg }}>-{exam.negativeMarking}</div>
              <div className="text-[11px]" style={{ color: styles.text }}>নেগেটিভ</div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-xl p-3 mb-5" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <p className="text-xs" style={{ color: '#92400E' }}>
              ⚠️ সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হবে। ভুল উত্তরে {exam.negativeMarking} নম্বর কাটা যাবে।
            </p>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white suttro-transition hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${styles.bg}, ${styles.light})`,
              boxShadow: `0 4px 14px ${styles.bg}25`,
            }}
          >
            পরীক্ষা শুরু করো →
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // FINISHED STATE
  // ═══════════════════════════════════════
  if (state === 'finished') {
    return (
      <ExamResult
        exam={exam}
        answers={answers}
        timeUsed={exam.duration * 60 - timeLeft}
        onRetry={handleRetry}
        earnedBadges={earnedBadges}
      />
    );
  }

  // ═══════════════════════════════════════
  // RUNNING STATE — Page 5 design
  // ═══════════════════════════════════════
  const isUrgent = timeLeft <= 60;

  return (
    <div style={{ background: '#F8FAFB', minHeight: '70vh' }}>
      {/* ── Top Bar: close + title + timer ── */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'white', borderBottom: '1px solid #F0F4F3' }}
      >
        <button
          onClick={() => {
            if (confirm('পরীক্ষা বাতিল করতে চাও?')) setState('finished');
          }}
          className="text-sm"
          style={{ color: '#94A3B8' }}
        >
          ✕
        </button>
        <div className="text-xs font-semibold" style={{ color: '#134E4A' }}>
          MCQ পরীক্ষা
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${isUrgent ? 'animate-pulse' : ''}`}
          style={{
            background: isUrgent
              ? 'linear-gradient(135deg, #DC2626, #EF4444)'
              : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          }}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-4 pt-3">
        <div className="flex justify-between mb-1">
          <span className="text-[11px]" style={{ color: '#5F9EA0' }}>
            প্রশ্ন {currentQ + 1} / {totalQ}
          </span>
          <span className="text-[11px] font-semibold" style={{ color: '#0D9488' }}>
            {progressPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full mb-4" style={{ background: '#F0FDFA' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #0D9488, #2DD4BF)',
              boxShadow: '0 1px 6px rgba(13,148,136,0.25)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="px-4 pb-4">
        {/* Subject-colored question box */}
        <div
          className="rounded-xl p-4 mb-3"
          style={{
            background: styles.lightBg,
            border: `1px solid ${styles.border}`,
          }}
        >
          <div className="text-[10px] font-semibold mb-1.5" style={{ color: styles.bg }}>
            {exam.subjectBn}{question.chapter ? ` · অধ্যায় ${question.chapter}` : ''}
          </div>
          <div className="text-sm font-semibold leading-relaxed" style={{ color: '#134E4A' }}>
            {question.question}
          </div>
        </div>

        {/* ── Options ── */}
        <div className="flex flex-col gap-2 mb-4">
          {question.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className="w-full text-left rounded-xl p-3 flex items-center gap-2.5 suttro-transition active:scale-[0.98]"
                style={{
                  background: isSelected ? '#F0FDFA' : 'white',
                  border: isSelected ? '1.5px solid #0D9488' : '1.5px solid #E2E8F0',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={
                    isSelected
                      ? { background: '#0D9488', color: 'white' }
                      : { border: '2px solid #E2E8F0', color: '#94A3B8' }
                  }
                >
                  {isSelected ? '✓' : opt.label}
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: isSelected ? '#134E4A' : '#134E4A',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Navigation ── */}
        <div className="flex justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={currentQ === 0}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold suttro-transition disabled:opacity-30"
            style={{
              background: 'white',
              color: '#0D9488',
              border: '1.5px solid #99F6E4',
            }}
          >
            ← আগের
          </button>
          <button
            onClick={currentQ === totalQ - 1 ? handleSubmit : goNext}
            disabled={currentQ === totalQ - 1 && answeredCount === 0}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white suttro-transition disabled:opacity-30"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
            }}
          >
            {currentQ === totalQ - 1 ? `জমা দাও (${answeredCount}/${totalQ})` : 'পরবর্তী →'}
          </button>
        </div>

        {/* ── Question palette toggle ── */}
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="w-full mt-3 py-2 rounded-xl text-[11px] font-medium suttro-transition"
          style={{
            background: showPalette ? '#F0FDFA' : 'white',
            color: '#5F9EA0',
            border: '1px solid #F0F4F3',
          }}
        >
          {showPalette ? '✕ বন্ধ করো' : `▦ সব প্রশ্ন দেখো (${answeredCount}/${totalQ} উত্তর দিয়েছ)`}
        </button>

        {/* ── Question Palette ── */}
        {showPalette && (
          <div className="mt-3 rounded-xl p-3" style={{ background: 'white', border: '1px solid #F0F4F3' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-3 h-3 rounded-full" style={{ background: subjectColor }} /> উত্তর ({answeredCount})
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-3 h-3 rounded-full border" style={{ borderColor: '#E2E8F0' }} /> বাকি ({unansweredCount})
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {exam.questions.map((_, i) => {
                const isAnswered = answers[i] !== null;
                const isCurrent = i === currentQ;
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="w-8 h-8 rounded-lg text-[11px] font-medium suttro-transition"
                    style={{
                      background: isCurrent ? subjectColor : isAnswered ? subjectColor + '20' : '#F8FAFB',
                      color: isCurrent ? 'white' : isAnswered ? subjectColor : '#94A3B8',
                      border: isCurrent ? 'none' : `1px solid ${isAnswered ? subjectColor + '40' : '#F0F4F3'}`,
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit from palette */}
            {answeredCount > 0 && (
              <button
                onClick={handleSubmit}
                className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-white suttro-transition"
                style={{
                  background: answeredCount === totalQ
                    ? 'linear-gradient(135deg, #10B981, #34D399)'
                    : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                }}
              >
                জমা দাও ({answeredCount}/{totalQ})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
