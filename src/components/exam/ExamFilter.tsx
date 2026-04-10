'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ExamSummary } from '@/lib/data';
import { SUBJECT_COLORS as EXAM_SUBJECT_COLORS, SUBJECT_LABELS as EXAM_SUBJECT_LABELS, SUBJECT_ICONS as EXAM_SUBJECT_ICONS } from '@/lib/constants';

// ─────────────────────────────────────────────
// ExamFilter — Browse & filter exam papers
// ─────────────────────────────────────────────

const SUBJECT_LIGHT_BG: Record<string, string> = {
  physics: '#EFF6FF',
  chemistry: '#F5F3FF',
  biology: '#FDF2F8',
  math: '#FEF2F2',
  'higher-math': '#FFF7ED',
};

const SUBJECT_BORDER: Record<string, string> = {
  physics: '#BFDBFE',
  chemistry: '#DDD6FE',
  biology: '#FBCFE8',
  math: '#FECACA',
  'higher-math': '#FED7AA',
};

interface ExamFilterProps {
  exams: ExamSummary[];
}

export default function ExamFilter({ exams }: ExamFilterProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    exams.forEach((e) => { counts[e.subject] = (counts[e.subject] || 0) + 1; });
    return counts;
  }, [exams]);

  const filtered = useMemo(() => {
    if (!activeSubject) return exams;
    return exams.filter((e) => e.subject === activeSubject);
  }, [activeSubject, exams]);

  const handleSubjectClick = (key: string | null) => {
    setActiveSubject(key === activeSubject ? null : key);
  };

  return (
    <>
      {/* Subject filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => handleSubjectClick(null)}
          className="px-3 py-1.5 rounded-full text-[11px] font-semibold suttro-transition"
          style={
            activeSubject === null
              ? { background: '#134E4A', color: 'white' }
              : { background: '#F8FAFB', color: '#94A3B8', border: '1px solid #F0F4F3' }
          }
        >
          সব ({exams.length})
        </button>
        {Object.entries(EXAM_SUBJECT_LABELS).map(([key, label]) => {
          const isActive = activeSubject === key;
          const count = subjectCounts[key] || 0;
          if (count === 0) return null;
          const color = EXAM_SUBJECT_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => handleSubjectClick(key)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold suttro-transition"
              style={
                isActive
                  ? { background: color, color: 'white' }
                  : { background: '#F8FAFB', color: '#94A3B8', border: '1px solid #F0F4F3' }
              }
            >
              {EXAM_SUBJECT_ICONS[key]} {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Exam cards */}
      <div className="flex flex-col gap-1.5 lg:grid lg:grid-cols-2 lg:gap-5">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 rounded-xl p-8 text-center" style={{ background: 'white' }}>
            <div className="text-3xl mb-3">📝</div>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              এই বিষয়ে কোনো পরীক্ষা পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          filtered.map((exam) => {
            const color = EXAM_SUBJECT_COLORS[exam.subject] || '#0D9488';
            const lightBg = SUBJECT_LIGHT_BG[exam.subject] || '#F0FDFA';
            const border = SUBJECT_BORDER[exam.subject] || '#CCFBF1';
            return (
              <Link
                key={exam.id}
                href={`/exam/${exam.id}`}
                className="block rounded-xl p-3 suttro-transition active:scale-[0.98] lg:hover:shadow-lg lg:hover:-translate-y-1"
                style={{
                  background: 'white',
                  border: `1px solid ${border}`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  {/* Subject icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                    }}
                  >
                    {EXAM_SUBJECT_ICONS[exam.subject]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white"
                        style={{ background: color }}
                      >
                        {exam.subjectBn}
                      </span>
                      {exam.board && (
                        <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                          {exam.board}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-sm font-semibold mb-1 truncate" style={{ color: '#134E4A' }}>
                      {exam.title}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: '#5F9EA0' }}>
                      <span>{exam.questionCount} প্রশ্ন</span>
                      <span>·</span>
                      <span>{exam.duration} মিনিট</span>
                      <span>·</span>
                      <span>{exam.totalMarks} নম্বর</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="text-xs mt-2" style={{ color: '#94A3B8' }}>→</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
