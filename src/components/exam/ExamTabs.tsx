'use client';

import { useState } from 'react';
import type { ExamSummary } from '@/lib/data';
import type { CQCollection } from '@/data/cq';
import ExamFilter from './ExamFilter';
import CQFilter from './CQFilter';

// ─────────────────────────────────────────────
// ExamTabs — MCQ / সৃজনশীল tab switcher
// ─────────────────────────────────────────────

interface ExamTabsProps {
  exams: ExamSummary[];
  totalCQs: number;
  cqCollections: CQCollection[];
  chapterNames: Record<string, Record<number, string>>;
}

export default function ExamTabs({ exams, totalCQs, cqCollections, chapterNames }: ExamTabsProps) {
  const [tab, setTab] = useState<'mcq' | 'cq'>('mcq');

  return (
    <>
      {/* Tab bar */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: 'var(--suttro-sky)' }}
      >
        <button
          onClick={() => setTab('mcq')}
          className="flex-1 py-3 rounded-lg text-base font-semibold suttro-transition"
          style={{
            background: tab === 'mcq' ? 'var(--suttro-white)' : 'transparent',
            color: tab === 'mcq' ? 'var(--suttro-deep)' : 'var(--suttro-muted)',
            boxShadow: tab === 'mcq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          MCQ পরীক্ষা ({exams.length})
        </button>
        <button
          onClick={() => setTab('cq')}
          className="flex-1 py-3 rounded-lg text-base font-semibold suttro-transition"
          style={{
            background: tab === 'cq' ? 'var(--suttro-white)' : 'transparent',
            color: tab === 'cq' ? 'var(--suttro-deep)' : 'var(--suttro-muted)',
            boxShadow: tab === 'cq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          সৃজনশীল প্রশ্ন ({totalCQs})
        </button>
      </div>

      {/* Tab content */}
      {tab === 'mcq' ? (
        <>
          <ExamFilter exams={exams} />
          <div
            className="mt-12 rounded-[14px] border p-8 text-center"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
          >
            <p className="text-base font-medium mb-1" style={{ color: 'var(--suttro-deep)' }}>
              {exams.length}টি MCQ পরীক্ষা প্রস্তুত — আরও আসছে!
            </p>
            <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
              প্রতিটি পরীক্ষায় SSC-স্টাইল MCQ, টাইমার, নেগেটিভ মার্কিং ও বিস্তারিত ব্যাখ্যা আছে।
            </p>
          </div>
        </>
      ) : (
        <>
          <CQFilter collections={cqCollections} chapterNames={chapterNames} />
          <div
            className="mt-12 rounded-[14px] border p-8 text-center"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
          >
            <p className="text-base font-medium mb-1" style={{ color: 'var(--suttro-deep)' }}>
              {totalCQs}টি সৃজনশীল প্রশ্ন — অধ্যায় অনুযায়ী ফিল্টার করো
            </p>
            <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
              প্রতিটি প্রশ্নে উদ্দীপক, ৪টি অংশ (ক-ঘ) এবং বিস্তারিত উত্তর আছে।
            </p>
          </div>
        </>
      )}
    </>
  );
}
