'use client';

import { useState } from 'react';
import type { CreativeQuestion } from '@/data/cq';
import { EXAM_SUBJECT_COLORS, EXAM_SUBJECT_LABELS, EXAM_SUBJECT_ICONS } from '@/data/exams';
import { getChapterName } from '@/data/cq';

// ─────────────────────────────────────────────
// CQViewer — সৃজনশীল প্রশ্ন Viewer
// Stem + Parts with answer reveal
// ─────────────────────────────────────────────

interface CQViewerProps {
  question: CreativeQuestion;
  subject: string;
  index: number;
}

const PART_COLORS = {
  'জ্ঞানমূলক': '#059669',
  'অনুধাবনমূলক': '#2563EB',
  'প্রয়োগমূলক': '#7C3AED',
  'উচ্চতর দক্ষতা': '#DC2626',
};

export default function CQViewer({ question, subject, index }: CQViewerProps) {
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    new Array(question.parts.length).fill(false)
  );
  const [allRevealed, setAllRevealed] = useState(false);

  const subjectColor = EXAM_SUBJECT_COLORS[subject] || '#1B6B4A';
  const chapterName = getChapterName(subject, question.chapter);

  const togglePart = (i: number) => {
    const next = [...revealed];
    next[i] = !next[i];
    setRevealed(next);
  };

  const toggleAll = () => {
    const next = !allRevealed;
    setAllRevealed(next);
    setRevealed(new Array(question.parts.length).fill(next));
  };

  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
    >
      {/* Color bar */}
      <div className="h-1.5" style={{ background: subjectColor }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-base font-semibold" style={{ color: subjectColor }}>
            প্রশ্ন {index + 1}
          </span>
          <span
            className="px-2 py-0.5 rounded text-sm"
            style={{ background: `${subjectColor}15`, color: subjectColor }}
          >
            অধ্যায় {question.chapter}: {chapterName}
          </span>
          {question.source && (
            <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              {question.source}
            </span>
          )}
        </div>

        {/* Stem / উদ্দীপক */}
        <div
          className="rounded-lg p-4 mb-4 border-l-4"
          style={{ background: 'var(--suttro-sky)', borderLeftColor: subjectColor }}
        >
          <p className="text-sm font-medium mb-1.5" style={{ color: subjectColor }}>
            উদ্দীপক:
          </p>
          <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--suttro-text)' }}>
            {question.stem}
          </p>
        </div>

        {/* Parts */}
        <div className="space-y-3">
          {question.parts.map((part, i) => {
            const partColor = PART_COLORS[part.type] || subjectColor;
            const isRevealed = revealed[i];

            return (
              <div key={part.label} className="rounded-lg border" style={{ borderColor: 'var(--suttro-border)' }}>
                {/* Part question */}
                <div className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5"
                      style={{ background: partColor }}
                    >
                      {part.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium" style={{ color: partColor }}>
                          {part.type}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                          ({part.marks} নম্বর)
                        </span>
                      </div>
                      <p className="text-base" style={{ color: 'var(--suttro-text)' }}>
                        {part.question}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer toggle */}
                {isRevealed ? (
                  <div
                    className="border-t px-3.5 pb-3.5 pt-3"
                    style={{ borderColor: 'var(--suttro-border)', background: `${partColor}08` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: partColor }}>
                        উত্তর:
                      </span>
                      <button
                        onClick={() => togglePart(i)}
                        className="text-sm suttro-transition hover:opacity-70"
                        style={{ color: 'var(--suttro-muted)' }}
                      >
                        লুকাও
                      </button>
                    </div>
                    <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--suttro-text)' }}>
                      {part.answer}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => togglePart(i)}
                    className="w-full border-t px-3.5 py-2.5 text-sm font-medium text-center suttro-transition hover:opacity-80"
                    style={{ borderColor: 'var(--suttro-border)', color: partColor }}
                  >
                    উত্তর দেখো
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Show all / Hide all */}
        <div className="mt-4 text-center">
          <button
            onClick={toggleAll}
            className="px-5 py-2 rounded-full text-sm font-medium suttro-transition hover:opacity-80"
            style={{ background: `${subjectColor}12`, color: subjectColor, border: `1.5px solid ${subjectColor}30` }}
          >
            {allRevealed ? 'সব উত্তর লুকাও' : 'সব উত্তর দেখো'}
          </button>
        </div>
      </div>
    </div>
  );
}
