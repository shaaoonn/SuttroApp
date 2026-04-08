'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ExamPaper } from '@/data/exams';
import { EXAM_SUBJECT_COLORS } from '@/data/exams';
import ExamResult from './ExamResult';
import { trackEvent, saveExamAttempt } from '@/lib/analytics';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// ExamPlayer — MCQ Exam Interface
// Timer, question navigation, answer tracking
// ─────────────────────────────────────────────

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
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60); // seconds
  const [showPalette, setShowPalette] = useState(false);
  const hasSavedRef = useRef(false);

  const subjectColor = EXAM_SUBJECT_COLORS[exam.subject] || '#1B6B4A';
  const question = exam.questions[currentQ];
  const totalQ = exam.questions.length;
  const accessToken = session?.access_token;

  // ── Timer ──
  useEffect(() => {
    if (state !== 'running') return;
    if (timeLeft <= 0) {
      setState('finished');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setState('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // ── Format time ──
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // ── Select answer ──
  const selectAnswer = useCallback((optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      // Toggle: click same answer to deselect
      next[currentQ] = next[currentQ] === optionIndex ? null : optionIndex;
      return next;
    });
  }, [currentQ]);

  // ── Navigation ──
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

    // Calculate stats
    let correct = 0, wrong = 0, skipped = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === null) skipped++;
      else if (answers[i] === q.correct) correct++;
      else wrong++;
    });
    const score = Math.max(0, correct - wrong * exam.negativeMarking);
    const durationSeconds = exam.duration * 60 - timeLeft;

    // Save to DB (only for authenticated users)
    if (accessToken) {
      saveExamAttempt(
        {
          examPaperId: exam.id,
          score,
          totalMarks: exam.totalMarks,
          correctCount: correct,
          wrongCount: wrong,
          skippedCount: skipped,
          durationSeconds,
          answers,
        },
        accessToken,
      );

      // Award XP for completing exam
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
      fetch('/api/xp', {
        method: 'POST', headers,
        body: JSON.stringify({ source: 'exam_complete', metadata: { examId: exam.id } }),
      }).catch(() => {});

      // Bonus XP for high score (80%+)
      const pct = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
      if (pct >= 80) {
        fetch('/api/xp', {
          method: 'POST', headers,
          body: JSON.stringify({ source: 'exam_high_score', metadata: { examId: exam.id, score: pct } }),
        }).catch(() => {});
      }

      // Add wrong answers to SRS review deck
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

  // ── Stats ──
  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const unansweredCount = totalQ - answeredCount;

  // ── Submit ──
  const handleSubmit = useCallback(() => {
    if (answeredCount === 0) return;
    setState('finished');
  }, [answeredCount]);

  // ── Start ──
  const handleStart = useCallback(() => {
    setState('running');
    trackEvent(
      { eventType: 'exam_started', contentType: 'exam', contentId: exam.id },
      accessToken,
    );
  }, [exam.id, accessToken]);

  // ── Retry ──
  const handleRetry = useCallback(() => {
    setAnswers(new Array(exam.questions.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(exam.duration * 60);
    hasSavedRef.current = false; // Allow saving again on next attempt
    setState('ready');
  }, [exam]);

  // ═══════════════════════════════════════
  // READY STATE
  // ═══════════════════════════════════════
  if (state === 'ready') {
    return (
      <div className="rounded-[14px] border p-6 lg:p-8 text-center" style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
          {exam.title}
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span className="px-3 py-1.5 rounded-full text-base font-medium text-white" style={{ background: subjectColor }}>
            {exam.subjectBn}
          </span>
          {exam.board && (
            <span className="px-3 py-1.5 rounded-full text-base" style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-muted)' }}>
              {exam.board}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-lg mx-auto">
          <div className="rounded-[10px] p-4" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-xl font-bold" style={{ color: subjectColor }}>{totalQ}</div>
            <div className="text-base" style={{ color: 'var(--suttro-muted)' }}>প্রশ্ন</div>
          </div>
          <div className="rounded-[10px] p-4" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-xl font-bold" style={{ color: subjectColor }}>{exam.duration} মি.</div>
            <div className="text-base" style={{ color: 'var(--suttro-muted)' }}>সময়</div>
          </div>
          <div className="rounded-[10px] p-4" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-xl font-bold" style={{ color: subjectColor }}>{exam.totalMarks}</div>
            <div className="text-base" style={{ color: 'var(--suttro-muted)' }}>মোট নম্বর</div>
          </div>
          <div className="rounded-[10px] p-4" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-xl font-bold" style={{ color: subjectColor }}>-{exam.negativeMarking}</div>
            <div className="text-base" style={{ color: 'var(--suttro-muted)' }}>নেগেটিভ মার্কিং</div>
          </div>
        </div>

        <div className="rounded-[10px] p-4 mb-6" style={{ background: '#FEF3C7' }}>
          <p className="text-base" style={{ color: '#92400E' }}>
            ⚠️ সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হবে। ভুল উত্তরে {exam.negativeMarking} নম্বর কাটা যাবে।
          </p>
        </div>

        <button
          onClick={handleStart}
          className="px-8 py-4 rounded-[12px] text-lg font-semibold text-white suttro-transition hover:opacity-90"
          style={{ background: subjectColor }}
        >
          পরীক্ষা শুরু করো &rarr;
        </button>
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
      />
    );
  }

  // ═══════════════════════════════════════
  // RUNNING STATE
  // ═══════════════════════════════════════
  const isUrgent = timeLeft <= 60;

  return (
    <div>
      {/* ── Top Bar: Timer + Progress ── */}
      <div
        className="sticky top-[64px] z-40 rounded-[14px] border p-4 mb-4 flex items-center justify-between"
        style={{
          borderColor: 'var(--suttro-border)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] font-mono text-lg font-bold ${isUrgent ? 'animate-pulse' : ''}`}
          style={{
            background: isUrgent ? '#FEE2E2' : 'var(--suttro-sky)',
            color: isUrgent ? '#DC2626' : 'var(--suttro-deep)',
          }}
        >
          <span>⏱</span>
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            {answeredCount}/{totalQ}
          </span>
          <button
            onClick={() => setShowPalette(!showPalette)}
            className="px-3 py-2 rounded-[10px] text-base font-medium suttro-transition"
            style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-deep)' }}
          >
            {showPalette ? '✕' : '▦'}
          </button>
        </div>
      </div>

      {/* ── Question Palette (overlay) ── */}
      {showPalette && (
        <div
          className="rounded-[14px] border p-5 mb-4"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-base">
              <span className="w-4 h-4 rounded-full" style={{ background: subjectColor }} /> উত্তর দিয়েছ ({answeredCount})
            </span>
            <span className="flex items-center gap-1.5 text-base">
              <span className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--suttro-border)' }} /> বাকি ({unansweredCount})
            </span>
          </div>
          <div className="grid grid-cols-6 lg:grid-cols-10 gap-2">
            {exam.questions.map((_, i) => {
              const isAnswered = answers[i] !== null;
              const isCurrent = i === currentQ;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="w-10 h-10 rounded-[8px] text-base font-medium suttro-transition"
                  style={{
                    background: isCurrent ? subjectColor : isAnswered ? subjectColor + '20' : 'var(--suttro-sky)',
                    color: isCurrent ? 'white' : isAnswered ? subjectColor : 'var(--suttro-muted)',
                    border: isCurrent ? 'none' : `1.5px solid ${isAnswered ? subjectColor + '40' : 'var(--suttro-border)'}`,
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Question Card ── */}
      <div
        className="rounded-[14px] border p-5 lg:p-6 mb-4"
        style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
      >
        {/* Question number + chapter */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="px-3 py-1.5 rounded-full text-base font-bold text-white"
            style={{ background: subjectColor }}
          >
            {currentQ + 1}
          </span>
          {question.chapter && (
            <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
              অধ্যায় {question.chapter}
            </span>
          )}
        </div>

        {/* Question text */}
        <h3 className="text-lg lg:text-xl font-semibold mb-5 leading-relaxed" style={{ color: 'var(--suttro-deep)' }}>
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className="w-full text-left p-4 rounded-[10px] border-2 suttro-transition flex items-start gap-3"
                style={{
                  borderColor: isSelected ? subjectColor : 'var(--suttro-border)',
                  background: isSelected ? subjectColor + '10' : 'transparent',
                }}
              >
                <span
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
                  style={{
                    background: isSelected ? subjectColor : 'var(--suttro-sky)',
                    color: isSelected ? 'white' : 'var(--suttro-muted)',
                  }}
                >
                  {opt.label}
                </span>
                <span
                  className="text-base lg:text-lg pt-0.5"
                  style={{ color: isSelected ? subjectColor : 'var(--suttro-text)' }}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={currentQ === 0}
          className="px-5 py-3 rounded-[10px] text-base font-medium suttro-transition disabled:opacity-30"
          style={{ border: '1.5px solid var(--suttro-border)', color: 'var(--suttro-text)' }}
        >
          &larr; আগের
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-[10px] text-base font-semibold suttro-transition hover:opacity-90"
          style={{
            background: answeredCount === totalQ ? subjectColor : 'var(--suttro-sky)',
            color: answeredCount === totalQ ? 'white' : 'var(--suttro-muted)',
          }}
        >
          জমা দাও ({answeredCount}/{totalQ})
        </button>

        <button
          onClick={goNext}
          disabled={currentQ === totalQ - 1}
          className="px-5 py-3 rounded-[10px] text-base font-medium text-white suttro-transition disabled:opacity-30"
          style={{ background: subjectColor }}
        >
          পরের &rarr;
        </button>
      </div>
    </div>
  );
}
