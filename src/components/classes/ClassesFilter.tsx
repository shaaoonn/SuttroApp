'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CLASSES,
  SUBJECT_COLORS,
  SUBJECT_LABELS,
  SUBJECT_ICONS,
  CHAPTER_NAMES,
  ytThumb,
} from '@/data/classes';

// ─────────────────────────────────────────────
// Interactive Class Filter — সূত্র
// Subject tabs + chapter dropdown + animated list
// ─────────────────────────────────────────────

export default function ClassesFilter() {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  // Get unique chapters for the active subject
  const availableChapters = useMemo(() => {
    if (!activeSubject) return [];
    const chapters = new Set<number>();
    CLASSES.forEach((cls) => {
      if (cls.subject === activeSubject) chapters.add(cls.chapter);
    });
    return Array.from(chapters).sort((a, b) => a - b);
  }, [activeSubject]);

  // Filtered classes
  const filtered = useMemo(() => {
    return CLASSES.filter((cls) => {
      if (activeSubject && cls.subject !== activeSubject) return false;
      if (activeChapter !== null && cls.chapter !== activeChapter) return false;
      return true;
    });
  }, [activeSubject, activeChapter]);

  // Handle subject click
  const handleSubjectClick = (key: string | null) => {
    if (key === activeSubject) {
      // Toggle off
      setActiveSubject(null);
      setActiveChapter(null);
    } else {
      setActiveSubject(key);
      setActiveChapter(null);
    }
  };

  // Count classes per subject
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CLASSES.forEach((cls) => {
      counts[cls.subject] = (counts[cls.subject] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <>
      {/* Subject filter tabs */}
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
          সব ({CLASSES.length})
        </button>
        {Object.entries(SUBJECT_LABELS).map(([key, label]) => {
          const isActive = activeSubject === key;
          const count = subjectCounts[key] || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => handleSubjectClick(key)}
              className="px-5 py-2.5 rounded-full text-base font-medium suttro-transition"
              style={{
                background: isActive ? SUBJECT_COLORS[key] : 'transparent',
                color: isActive ? 'white' : 'var(--suttro-text)',
                border: isActive ? 'none' : '1.5px solid var(--suttro-border)',
              }}
            >
              <span className="mr-1.5">{SUBJECT_ICONS[key]}</span>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Chapter filter — only shows when a subject is selected */}
      {activeSubject && availableChapters.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-[10px]"
          style={{ background: 'var(--suttro-sky)' }}
        >
          <span
            className="text-xs font-medium mr-1"
            style={{ color: 'var(--suttro-muted)' }}
          >
            অধ্যায়:
          </span>
          <button
            onClick={() => setActiveChapter(null)}
            className="px-3 py-1.5 rounded-full text-xs font-medium suttro-transition"
            style={{
              background: activeChapter === null ? SUBJECT_COLORS[activeSubject] : 'var(--suttro-white)',
              color: activeChapter === null ? 'white' : 'var(--suttro-text)',
              border: activeChapter === null ? 'none' : '1px solid var(--suttro-border)',
            }}
          >
            সব অধ্যায়
          </button>
          {availableChapters.map((ch) => {
            const isActive = activeChapter === ch;
            const chapterName = CHAPTER_NAMES[activeSubject]?.[ch];
            return (
              <button
                key={ch}
                onClick={() => setActiveChapter(isActive ? null : ch)}
                className="px-3 py-1.5 rounded-full text-xs font-medium suttro-transition"
                style={{
                  background: isActive ? SUBJECT_COLORS[activeSubject] : 'var(--suttro-white)',
                  color: isActive ? 'white' : 'var(--suttro-text)',
                  border: isActive ? 'none' : '1px solid var(--suttro-border)',
                }}
                title={chapterName || `অধ্যায় ${ch}`}
              >
                {chapterName ? `${ch}. ${chapterName}` : `অধ্যায় ${ch}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Active filter summary */}
      {(activeSubject || activeChapter !== null) && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
            {filtered.length}টি ক্লাস পাওয়া গেছে
          </span>
          <button
            onClick={() => { setActiveSubject(null); setActiveChapter(null); }}
            className="text-xs px-2 py-0.5 rounded-full suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-primary)' }}
          >
            ফিল্টার মুছো &times;
          </button>
        </div>
      )}

      {/* Class list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div
            className="rounded-[14px] p-10 text-center"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-3xl mb-3">📭</div>
            <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              এই ফিল্টারে কোনো ক্লাস পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          filtered.map((cls) => (
            <div
              key={cls.slug}
              className="rounded-[14px] border p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4 suttro-transition hover:shadow-md"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              {/* Thumbnail */}
              <div
                className="w-full lg:w-40 h-[90px] rounded-[10px] shrink-0 relative overflow-hidden group/thumb"
                style={{ background: 'var(--player-bg)' }}
              >
                {cls.youtubeId ? (
                  <img
                    src={ytThumb(cls.youtubeId)}
                    alt={cls.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 suttro-transition"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: SUBJECT_COLORS[cls.subject] + '18' }}
                  >
                    <span className="text-3xl">{SUBJECT_ICONS[cls.subject]}</span>
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/thumb:opacity-100 suttro-transition">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ background: 'var(--suttro-primary)' }}
                  >
                    ▶
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-white bg-black/70">
                  {cls.duration}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ background: SUBJECT_COLORS[cls.subject] }}
                  >
                    {SUBJECT_LABELS[cls.subject]}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: SUBJECT_COLORS[cls.subject] + '15', color: SUBJECT_COLORS[cls.subject] }}
                  >
                    অধ্যায় {cls.chapter}
                    {CHAPTER_NAMES[cls.subject]?.[cls.chapter]
                      ? ` · ${CHAPTER_NAMES[cls.subject][cls.chapter]}`
                      : ''}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
                    ক্লাস {cls.classLevel}
                  </span>
                </div>
                <h3
                  className="text-base font-semibold mb-1 truncate"
                  style={{ color: 'var(--suttro-deep)' }}
                >
                  {cls.title}
                </h3>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: 'var(--suttro-muted)' }}
                >
                  <span>{cls.date}</span>
                  <span>·</span>
                  <span>{cls.duration}</span>
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0">
                {cls.available ? (
                  <Link
                    href={`/class/${cls.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90"
                    style={{ background: 'var(--suttro-primary)' }}
                  >
                    দেখো &rarr;
                  </Link>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm"
                    style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-muted)' }}
                  >
                    শীঘ্রই আসছে
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
