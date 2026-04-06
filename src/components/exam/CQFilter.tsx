'use client';

import { useState, useMemo } from 'react';
import type { CQCollection } from '@/data/cq';
import { SUBJECT_COLORS as EXAM_SUBJECT_COLORS, SUBJECT_LABELS as EXAM_SUBJECT_LABELS, SUBJECT_ICONS as EXAM_SUBJECT_ICONS } from '@/lib/constants';
import CQViewer from './CQViewer';

// ─────────────────────────────────────────────
// CQFilter — Browse সৃজনশীল প্রশ্ন
// Filter by subject → chapter
// ─────────────────────────────────────────────

interface CQFilterProps {
  collections: CQCollection[];
  chapterNames: Record<string, Record<number, string>>;
}

export default function CQFilter({ collections, chapterNames }: CQFilterProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  // Flat list of all CQs with subject info
  const allCQs = useMemo(() => {
    return collections.flatMap((c) =>
      c.questions.map((q) => ({ question: q, subject: c.subject, subjectBn: c.subjectBn }))
    );
  }, [collections]);

  // Subject counts
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    collections.forEach((c) => {
      counts[c.subject] = c.questions.length;
    });
    return counts;
  }, [collections]);

  // Chapters for active subject
  const chapters = useMemo(() => {
    if (!activeSubject) return [];
    const collection = collections.find((c) => c.subject === activeSubject);
    if (!collection) return [];
    const chapterNums = [...new Set(collection.questions.map((q) => q.chapter))].sort((a, b) => a - b);
    return chapterNums.map((ch) => ({
      num: ch,
      name: chapterNames[activeSubject]?.[ch] || `অধ্যায় ${ch}`,
      count: collection.questions.filter((q) => q.chapter === ch).length,
    }));
  }, [activeSubject, collections, chapterNames]);

  // Filtered questions
  const filtered = useMemo(() => {
    let items = allCQs;
    if (activeSubject) {
      items = items.filter((i) => i.subject === activeSubject);
    }
    if (activeChapter !== null) {
      items = items.filter((i) => i.question.chapter === activeChapter);
    }
    return items;
  }, [allCQs, activeSubject, activeChapter]);

  const handleSubjectClick = (key: string | null) => {
    if (key === activeSubject) {
      setActiveSubject(null);
      setActiveChapter(null);
    } else {
      setActiveSubject(key);
      setActiveChapter(null);
    }
  };

  return (
    <>
      {/* Subject filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleSubjectClick(null)}
          className="px-5 py-2.5 rounded-full text-base font-medium suttro-transition"
          style={{
            background: activeSubject === null ? 'var(--suttro-deep)' : 'transparent',
            color: activeSubject === null ? 'white' : 'var(--suttro-text)',
            border: activeSubject === null ? 'none' : '1.5px solid var(--suttro-border)',
          }}
        >
          সব ({allCQs.length})
        </button>
        {Object.entries(EXAM_SUBJECT_LABELS).map(([key, label]) => {
          const count = subjectCounts[key] || 0;
          if (count === 0) return null;
          const isActive = activeSubject === key;
          return (
            <button
              key={key}
              onClick={() => handleSubjectClick(key)}
              className="px-5 py-2.5 rounded-full text-base font-medium suttro-transition"
              style={{
                background: isActive ? EXAM_SUBJECT_COLORS[key] : 'transparent',
                color: isActive ? 'white' : 'var(--suttro-text)',
                border: isActive ? 'none' : '1.5px solid var(--suttro-border)',
              }}
            >
              <span className="mr-1.5">{EXAM_SUBJECT_ICONS[key]}</span>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Chapter filter (when subject selected) */}
      {activeSubject && chapters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveChapter(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium suttro-transition"
            style={{
              background: activeChapter === null ? `${EXAM_SUBJECT_COLORS[activeSubject]}15` : 'transparent',
              color: activeChapter === null ? EXAM_SUBJECT_COLORS[activeSubject] : 'var(--suttro-muted)',
              border: `1.5px solid ${activeChapter === null ? EXAM_SUBJECT_COLORS[activeSubject] : 'var(--suttro-border)'}`,
            }}
          >
            সব অধ্যায়
          </button>
          {chapters.map((ch) => {
            const isActive = activeChapter === ch.num;
            return (
              <button
                key={ch.num}
                onClick={() => setActiveChapter(isActive ? null : ch.num)}
                className="px-4 py-2 rounded-lg text-sm font-medium suttro-transition"
                style={{
                  background: isActive ? `${EXAM_SUBJECT_COLORS[activeSubject]}15` : 'transparent',
                  color: isActive ? EXAM_SUBJECT_COLORS[activeSubject] : 'var(--suttro-muted)',
                  border: `1.5px solid ${isActive ? EXAM_SUBJECT_COLORS[activeSubject] : 'var(--suttro-border)'}`,
                }}
              >
                {ch.num}. {ch.name} ({ch.count})
              </button>
            );
          })}
        </div>
      )}

      {/* CQ cards */}
      {filtered.length === 0 ? (
        <div className="rounded-[14px] p-10 text-center" style={{ background: 'var(--suttro-sky)' }}>
          <div className="text-3xl mb-3">📝</div>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            এই ফিল্টারে কোনো সৃজনশীল প্রশ্ন পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((item, i) => (
            <CQViewer
              key={`${item.subject}-${item.question.id}`}
              question={item.question}
              subject={item.subject}
              index={i}
            />
          ))}
        </div>
      )}
    </>
  );
}
