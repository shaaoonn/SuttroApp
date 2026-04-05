'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ExamPaper } from '@/data/exams';
import { EXAM_SUBJECT_COLORS, EXAM_SUBJECT_LABELS, EXAM_SUBJECT_ICONS } from '@/data/exams';

// ─────────────────────────────────────────────
// ExamFilter — Browse & filter exam papers
// ─────────────────────────────────────────────

interface ExamFilterProps {
  exams: ExamPaper[];
}

export default function ExamFilter({ exams }: ExamFilterProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Count exams per subject
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    exams.forEach((e) => {
      counts[e.subject] = (counts[e.subject] || 0) + 1;
    });
    return counts;
  }, [exams]);

  // Filtered exams
  const filtered = useMemo(() => {
    if (!activeSubject) return exams;
    return exams.filter((e) => e.subject === activeSubject);
  }, [activeSubject, exams]);

  const handleSubjectClick = (key: string | null) => {
    setActiveSubject(key === activeSubject ? null : key);
  };

  return (
    <>
      {/* Subject filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleSubjectClick(null)}
          className="px-5 py-2.5 rounded-full text-base font-medium suttro-transition"
          style={{
            background: activeSubject === null ? 'var(--suttro-deep)' : 'transparent',
            color: activeSubject === null ? 'white' : 'var(--suttro-text)',
            border: activeSubject === null ? 'none' : '1.5px solid var(--suttro-border)',
          }}
        >
          সব ({exams.length})
        </button>
        {Object.entries(EXAM_SUBJECT_LABELS).map(([key, label]) => {
          const isActive = activeSubject === key;
          const count = subjectCounts[key] || 0;
          if (count === 0) return null;
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

      {/* Exam cards */}
      <div className="grid lg:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 rounded-[14px] p-10 text-center" style={{ background: 'var(--suttro-sky)' }}>
            <div className="text-3xl mb-3">📝</div>
            <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
              এই বিষয়ে কোনো পরীক্ষা পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          filtered.map((exam) => {
            const color = EXAM_SUBJECT_COLORS[exam.subject] || '#1B6B4A';
            return (
              <Link
                key={exam.id}
                href={`/exam/${exam.id}`}
                className="group block rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                {/* Color bar */}
                <div className="h-2" style={{ background: color }} />

                <div className="p-5">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded text-sm font-medium text-white"
                      style={{ background: color }}
                    >
                      {EXAM_SUBJECT_ICONS[exam.subject]} {exam.subjectBn}
                    </span>
                    <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                      ক্লাস {exam.classLevel}
                    </span>
                    {exam.board && (
                      <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                        · {exam.board}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-[var(--suttro-primary)] suttro-transition" style={{ color: 'var(--suttro-deep)' }}>
                    {exam.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-base" style={{ color: 'var(--suttro-muted)' }}>
                      <span>📝</span> {exam.questions.length} প্রশ্ন
                    </div>
                    <div className="flex items-center gap-1.5 text-base" style={{ color: 'var(--suttro-muted)' }}>
                      <span>⏱</span> {exam.duration} মিনিট
                    </div>
                    <div className="flex items-center gap-1.5 text-base" style={{ color: 'var(--suttro-muted)' }}>
                      <span>📊</span> {exam.totalMarks} নম্বর
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4">
                    <span
                      className="text-base font-medium inline-flex items-center gap-2 suttro-transition"
                      style={{ color }}
                    >
                      পরীক্ষা দাও
                      <span className="suttro-transition group-hover:translate-x-1 inline-block">&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
