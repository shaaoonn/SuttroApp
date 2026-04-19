'use client';

import { useState } from 'react';
import type { ExamSummary } from '@/lib/data';
import type { CQCollection } from '@/data/cq';
import ExamFilter from './ExamFilter';
import CQFilter from './CQFilter';

// ─────────────────────────────────────────────
// ExamTabs - MCQ / সৃজনশীল tab switcher
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
        className="flex rounded-xl p-1 mb-4"
        style={{ background: '#F0F4F3' }}
      >
        <button
          onClick={() => setTab('mcq')}
          className="flex-1 py-2.5 rounded-lg text-xs font-semibold suttro-transition"
          style={{
            background: tab === 'mcq' ? 'white' : 'transparent',
            color: tab === 'mcq' ? '#134E4A' : '#94A3B8',
            boxShadow: tab === 'mcq' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          MCQ পরীক্ষা ({exams.length})
        </button>
        <button
          onClick={() => setTab('cq')}
          className="flex-1 py-2.5 rounded-lg text-xs font-semibold suttro-transition"
          style={{
            background: tab === 'cq' ? 'white' : 'transparent',
            color: tab === 'cq' ? '#134E4A' : '#94A3B8',
            boxShadow: tab === 'cq' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          সৃজনশীল ({totalCQs})
        </button>
      </div>

      {/* Tab content */}
      {tab === 'mcq' ? (
        <>
          <ExamFilter exams={exams} />
          <div
            className="mt-6 rounded-xl p-4 text-center"
            style={{ background: 'white', border: '1px solid #F0F4F3' }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: '#134E4A' }}>
              {exams.length}টি MCQ পরীক্ষা প্রস্তুত - আরও আসছে!
            </p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>
              SSC-স্টাইল MCQ, টাইমার, নেগেটিভ মার্কিং ও বিস্তারিত ব্যাখ্যা।
            </p>
          </div>
        </>
      ) : (
        <>
          <CQFilter collections={cqCollections} chapterNames={chapterNames} />
          <div
            className="mt-6 rounded-xl p-4 text-center"
            style={{ background: 'white', border: '1px solid #F0F4F3' }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: '#134E4A' }}>
              {totalCQs}টি সৃজনশীল প্রশ্ন - অধ্যায় অনুযায়ী ফিল্টার করো
            </p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>
              প্রতিটি প্রশ্নে উদ্দীপক, ৪টি অংশ (ক-ঘ) এবং বিস্তারিত উত্তর আছে।
            </p>
          </div>
        </>
      )}
    </>
  );
}
