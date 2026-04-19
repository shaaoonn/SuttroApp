'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ClassRecording } from '@/data/classes';
import { ytThumb } from '@/lib/constants';

// ─────────────────────────────────────────────
// ClassesFilter - Compact, beautiful class archive
// Subject chips + chapter pills + card list
// ─────────────────────────────────────────────

const SUBJECT_STYLES: Record<string, { bg: string; light: string; lightBg: string; border: string; text: string; icon: string; label: string }> = {
  physics:      { bg: '#3B82F6', light: '#60A5FA', lightBg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '⚡', label: 'পদার্থ' },
  chemistry:    { bg: '#7C3AED', light: '#A78BFA', lightBg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', icon: '⚗️', label: 'রসায়ন' },
  biology:      { bg: '#EC4899', light: '#F472B6', lightBg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D', icon: '🧬', label: 'জীববিজ্ঞান' },
  math:         { bg: '#DC2626', light: '#F87171', lightBg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '📐', label: 'গণিত' },
  'higher-math':{ bg: '#EA580C', light: '#FB923C', lightBg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', icon: '📊', label: 'উচ্চতর গণিত' },
  english:      { bg: '#0891B2', light: '#22D3EE', lightBg: '#ECFEFF', border: '#A5F3FC', text: '#155E75', icon: '📝', label: 'ইংরেজি' },
};

interface ClassesFilterProps {
  classes: ClassRecording[];
  chapterNames: Record<string, Record<number, string>>;
}

export default function ClassesFilter({ classes, chapterNames }: ClassesFilterProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  const availableChapters = useMemo(() => {
    if (!activeSubject) return [];
    const chapters = new Set<number>();
    classes.forEach((cls) => {
      if (cls.subject === activeSubject) chapters.add(cls.chapter);
    });
    return Array.from(chapters).sort((a, b) => a - b);
  }, [activeSubject, classes]);

  const filtered = useMemo(() => {
    return classes.filter((cls) => {
      if (activeSubject && cls.subject !== activeSubject) return false;
      if (activeChapter !== null && cls.chapter !== activeChapter) return false;
      return true;
    });
  }, [classes, activeSubject, activeChapter]);

  const handleSubjectClick = (key: string | null) => {
    if (key === activeSubject) {
      setActiveSubject(null);
      setActiveChapter(null);
    } else {
      setActiveSubject(key);
      setActiveChapter(null);
    }
  };

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    classes.forEach((cls) => {
      counts[cls.subject] = (counts[cls.subject] || 0) + 1;
    });
    return counts;
  }, [classes]);

  const subStyle = activeSubject ? SUBJECT_STYLES[activeSubject] : null;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Subject chips (horizontal scroll on mobile) ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => handleSubjectClick(null)}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-semibold suttro-transition active:scale-[0.97]"
          style={{
            background: activeSubject === null ? '#134E4A' : 'white',
            color: activeSubject === null ? 'white' : '#64748B',
            border: activeSubject === null ? '1px solid #134E4A' : '1px solid #E2E8F0',
          }}
        >
          সব ({classes.length})
        </button>
        {Object.entries(SUBJECT_STYLES).map(([key, s]) => {
          const count = subjectCounts[key] || 0;
          if (count === 0) return null;
          const isActive = activeSubject === key;
          return (
            <button
              key={key}
              onClick={() => handleSubjectClick(key)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-semibold suttro-transition active:scale-[0.97] flex items-center gap-1.5"
              style={{
                background: isActive ? s.bg : 'white',
                color: isActive ? 'white' : s.text,
                border: `1px solid ${isActive ? s.bg : s.border}`,
              }}
            >
              <span className="text-sm">{s.icon}</span>
              {s.label}
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-md font-bold"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : s.lightBg,
                  color: isActive ? 'white' : s.text,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Chapter pills ── */}
      {activeSubject && subStyle && availableChapters.length > 0 && (
        <div
          className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide px-1 py-2 rounded-xl"
          style={{ background: subStyle.lightBg }}
        >
          <button
            onClick={() => setActiveChapter(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold suttro-transition"
            style={{
              background: activeChapter === null ? subStyle.bg : 'white',
              color: activeChapter === null ? 'white' : subStyle.text,
            }}
          >
            সব
          </button>
          {availableChapters.map((ch) => {
            const isActive = activeChapter === ch;
            const name = chapterNames[activeSubject]?.[ch];
            return (
              <button
                key={ch}
                onClick={() => setActiveChapter(isActive ? null : ch)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium suttro-transition whitespace-nowrap"
                style={{
                  background: isActive ? subStyle.bg : 'white',
                  color: isActive ? 'white' : subStyle.text,
                }}
              >
                {name ? `${ch}. ${name}` : `অধ্যায় ${ch}`}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filter summary ── */}
      {(activeSubject || activeChapter !== null) && (
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium" style={{ color: '#64748B' }}>
            {filtered.length}টি ক্লাস
          </span>
          <button
            onClick={() => { setActiveSubject(null); setActiveChapter(null); }}
            className="text-[12px] px-2.5 py-1 rounded-lg font-medium suttro-transition"
            style={{ background: '#FEF2F2', color: '#DC2626' }}
          >
            ✕ মুছো
          </button>
        </div>
      )}

      {/* ── Class cards ── */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ background: '#F8FAFC' }}>
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              কোনো ক্লাস পাওয়া যায়নি
            </p>
          </div>
        ) : (
          filtered.map((cls) => {
            const s = SUBJECT_STYLES[cls.subject] || SUBJECT_STYLES.physics;
            return (
              <Link
                key={cls.slug}
                href={cls.available ? `/class/${cls.slug}` : '#'}
                className="rounded-xl overflow-hidden suttro-transition active:scale-[0.98]"
                style={{
                  background: 'white',
                  border: `1px solid ${s.border}`,
                  opacity: cls.available ? 1 : 0.6,
                  pointerEvents: cls.available ? 'auto' : 'none',
                }}
              >
                {/* Thumbnail Row */}
                <div className="relative" style={{ aspectRatio: '16/8' }}>
                  {cls.youtubeId ? (
                    <img
                      src={ytThumb(cls.youtubeId, 'hq')}
                      alt={cls.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${s.bg}15, ${s.light}10)` }}
                    >
                      <span className="text-4xl">{s.icon}</span>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg backdrop-blur-sm"
                      style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)' }}
                    >
                      ▶
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold text-white bg-black/60 backdrop-blur-sm">
                    {cls.duration}
                  </div>
                  {/* Subject badge */}
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-bold text-white"
                    style={{ background: s.bg }}
                  >
                    {s.icon} {s.label}
                  </div>
                  {/* Not available overlay */}
                  {!cls.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg bg-black/50">
                        শীঘ্রই আসছে
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold mb-1 line-clamp-1" style={{ color: '#1E293B' }}>
                    {cls.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
                    <span
                      className="px-1.5 py-0.5 rounded font-medium"
                      style={{ background: s.lightBg, color: s.text }}
                    >
                      অধ্যায় {cls.chapter}
                    </span>
                    <span>{cls.date}</span>
                    <span>·</span>
                    <span>ক্লাস {cls.classLevel}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
