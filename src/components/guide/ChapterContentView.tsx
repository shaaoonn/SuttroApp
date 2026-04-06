'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ClassRecording } from '@/data/classes';
import type { CreativeQuestion } from '@/data/cq';
import type { MCQQuestion } from '@/data/exams';
import CQViewer from '@/components/exam/CQViewer';

// ─────────────────────────────────────────────
// ChapterContentView — Tabbed content display
// Shows Simulations, Classes, MCQ, CQ for a chapter
// ─────────────────────────────────────────────

interface SimData {
  slug: string;
  title: { bn: string; en: string };
  nctb: { class: number; chapter: number; section: string };
  formulas: { expression: string; description: { bn: string; en: string } }[];
}

interface MCQWithExam {
  question: MCQQuestion;
  examTitle: string;
  examId: string;
}

interface ChapterContentViewProps {
  subject: string;
  subjectBn: string;
  color: string;
  chapter: number;
  chapterName: string;
  classes: ClassRecording[];
  simulations: SimData[];
  mcqs: MCQWithExam[];
  cqs: CreativeQuestion[];
}

type TabKey = 'all' | 'sim' | 'class' | 'mcq' | 'cq';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'all', icon: '📚', label: 'সব' },
  { key: 'sim', icon: '🔬', label: 'সিমুলেশন' },
  { key: 'class', icon: '📹', label: 'ক্লাস' },
  { key: 'mcq', icon: '📝', label: 'MCQ' },
  { key: 'cq', icon: '📖', label: 'সৃজনশীল' },
];

export default function ChapterContentView({
  subject,
  subjectBn,
  color,
  chapter,
  chapterName,
  classes,
  simulations,
  mcqs,
  cqs,
}: ChapterContentViewProps) {
  const [tab, setTab] = useState<TabKey>('all');

  const counts = {
    sim: simulations.length,
    class: classes.length,
    mcq: mcqs.length,
    cq: cqs.length,
  };
  const totalContent = counts.sim + counts.class + counts.mcq + counts.cq;

  // Filter tabs that have content
  const visibleTabs = TABS.filter((t) => t.key === 'all' || counts[t.key as keyof typeof counts] > 0);

  const showSim = tab === 'all' || tab === 'sim';
  const showClass = tab === 'all' || tab === 'class';
  const showMcq = tab === 'all' || tab === 'mcq';
  const showCq = tab === 'all' || tab === 'cq';

  if (totalContent === 0) {
    return (
      <div className="rounded-[14px] p-10 text-center" style={{ background: 'var(--suttro-sky)' }}>
        <div className="text-3xl mb-3">📚</div>
        <p className="text-base font-medium" style={{ color: 'var(--suttro-deep)' }}>
          এই অধ্যায়ে এখনও কন্টেন্ট যোগ করা হয়নি।
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--suttro-muted)' }}>
          শীঘ্রই আসছে!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      {visibleTabs.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {visibleTabs.map((t) => {
            const isActive = tab === t.key;
            const count = t.key === 'all' ? totalContent : counts[t.key as keyof typeof counts];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-lg text-sm font-medium suttro-transition"
                style={{
                  background: isActive ? color : 'transparent',
                  color: isActive ? 'white' : 'var(--suttro-text)',
                  border: isActive ? 'none' : '1.5px solid var(--suttro-border)',
                }}
              >
                {t.icon} {t.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-8">
        {/* ── Simulations ── */}
        {showSim && simulations.length > 0 && (
          <section>
            {tab === 'all' && (
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--suttro-deep)' }}>
                🔬 সিমুলেশন
              </h2>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {simulations.map((sim) => (
                <Link
                  key={sim.slug}
                  href={`/sim/${sim.slug}`}
                  className="group block rounded-[14px] border p-4 suttro-transition hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔬</span>
                    <div>
                      <h3 className="text-base font-semibold group-hover:text-[var(--suttro-primary)] suttro-transition" style={{ color: 'var(--suttro-deep)' }}>
                        {sim.title.bn}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                        {sim.title.en}
                      </p>
                      {sim.formulas.length > 0 && (
                        <p className="text-sm font-mono mt-1" style={{ color }}>
                          {sim.formulas[0].expression}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Classes ── */}
        {showClass && classes.length > 0 && (
          <section>
            {tab === 'all' && (
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--suttro-deep)' }}>
                📹 ক্লাস
              </h2>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <Link
                  key={cls.slug}
                  href={`/class/${cls.slug}`}
                  className="group block rounded-[14px] border p-4 suttro-transition hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📹</span>
                    <div>
                      <h3 className="text-base font-semibold group-hover:text-[var(--suttro-primary)] suttro-transition" style={{ color: 'var(--suttro-deep)' }}>
                        {cls.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                        {cls.date} · {cls.duration}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── MCQ ── */}
        {showMcq && mcqs.length > 0 && (
          <section>
            {tab === 'all' && (
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--suttro-deep)' }}>
                📝 MCQ ({mcqs.length}টি প্রশ্ন)
              </h2>
            )}
            <div className="space-y-3">
              {mcqs.slice(0, tab === 'mcq' ? undefined : 5).map((item, i) => (
                <MCQCard key={`${item.examId}-${item.question.id}`} item={item} index={i} color={color} />
              ))}
              {tab === 'all' && mcqs.length > 5 && (
                <button
                  onClick={() => setTab('mcq')}
                  className="w-full py-3 rounded-lg text-sm font-medium suttro-transition hover:opacity-80"
                  style={{ background: `${color}10`, color }}
                >
                  আরও {mcqs.length - 5}টি MCQ দেখো →
                </button>
              )}
            </div>
          </section>
        )}

        {/* ── CQ (সৃজনশীল) ── */}
        {showCq && cqs.length > 0 && (
          <section>
            {tab === 'all' && (
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--suttro-deep)' }}>
                📖 সৃজনশীল ({cqs.length}টি)
              </h2>
            )}
            <div className="space-y-5">
              {cqs.map((cq, i) => (
                <CQViewer key={cq.id} question={cq} subject={subject} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// ── MCQ Card sub-component ──

function MCQCard({ item, index, color }: { item: { question: MCQQuestion; examTitle: string; examId: string }; index: number; color: string }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const q = item.question;
  const correctOption = q.options[q.correct];

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
    >
      <p className="text-base font-medium mb-3" style={{ color: 'var(--suttro-text)' }}>
        <span className="font-bold" style={{ color }}>
          {index + 1}.
        </span>{' '}
        {q.question}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {q.options.map((opt, oi) => (
          <div
            key={opt.label}
            className="px-3 py-1.5 rounded text-sm"
            style={{
              background: showAnswer && oi === q.correct ? `${color}15` : 'var(--suttro-sky)',
              color: showAnswer && oi === q.correct ? color : 'var(--suttro-text)',
              fontWeight: showAnswer && oi === q.correct ? 600 : 400,
            }}
          >
            <span className="font-medium">{opt.label}.</span> {opt.text}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-sm font-medium suttro-transition"
          style={{ color }}
        >
          {showAnswer ? 'লুকাও' : 'উত্তর দেখো'}
        </button>
        {showAnswer && q.explanation && (
          <p className="text-sm flex-1 ml-4" style={{ color: 'var(--suttro-muted)' }}>
            {q.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
