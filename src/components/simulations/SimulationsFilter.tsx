'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { SimulationConfig } from '@/simulations/_template/config';
import {
  SUBJECT_COLORS,
  SUBJECT_LABELS,
  SUBJECT_ICONS,
  CHAPTER_NAMES,
} from '@/data/classes';
import { SIM_THUMBNAILS } from './simThumbnails';

// ─────────────────────────────────────────────
// Interactive Simulation Filter — সূত্র
// Subject tabs + chapter dropdown + thumbnail cards
// ─────────────────────────────────────────────

interface SimEntry {
  slug: string;
  config: SimulationConfig;
}

interface SimulationsFilterProps {
  simulations: SimEntry[];
}

export default function SimulationsFilter({ simulations }: SimulationsFilterProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  // Get unique chapters for active subject
  const availableChapters = useMemo(() => {
    if (!activeSubject) return [];
    const chapters = new Set<number>();
    simulations.forEach((sim) => {
      if (sim.config.subject === activeSubject) chapters.add(sim.config.nctb.chapter);
    });
    return Array.from(chapters).sort((a, b) => a - b);
  }, [activeSubject, simulations]);

  // Filtered sims
  const filtered = useMemo(() => {
    return simulations.filter((sim) => {
      if (activeSubject && sim.config.subject !== activeSubject) return false;
      if (activeChapter !== null && sim.config.nctb.chapter !== activeChapter) return false;
      return true;
    });
  }, [activeSubject, activeChapter, simulations]);

  const handleSubjectClick = (key: string | null) => {
    if (key === activeSubject) {
      setActiveSubject(null);
      setActiveChapter(null);
    } else {
      setActiveSubject(key);
      setActiveChapter(null);
    }
  };

  // Count sims per subject
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    simulations.forEach((sim) => {
      counts[sim.config.subject] = (counts[sim.config.subject] || 0) + 1;
    });
    return counts;
  }, [simulations]);

  return (
    <>
      {/* Subject filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleSubjectClick(null)}
          className="px-4 py-2 rounded-full text-sm font-medium suttro-transition"
          style={{
            background: activeSubject === null ? 'var(--suttro-deep)' : 'transparent',
            color: activeSubject === null ? 'white' : 'var(--suttro-text)',
            border: activeSubject === null ? 'none' : '1.5px solid var(--suttro-border)',
          }}
        >
          সব ({simulations.length})
        </button>
        {Object.entries(SUBJECT_LABELS).map(([key, label]) => {
          const isActive = activeSubject === key;
          const count = subjectCounts[key] || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => handleSubjectClick(key)}
              className="px-4 py-2 rounded-full text-sm font-medium suttro-transition"
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

      {/* Chapter filter */}
      {activeSubject && availableChapters.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-[10px]"
          style={{ background: 'var(--suttro-sky)' }}
        >
          <span className="text-xs font-medium mr-1" style={{ color: 'var(--suttro-muted)' }}>
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
            {filtered.length}টি সিমুলেশন পাওয়া গেছে
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

      {/* Simulation grid */}
      {filtered.length === 0 ? (
        <div className="rounded-[14px] p-10 text-center" style={{ background: 'var(--suttro-sky)' }}>
          <div className="text-3xl mb-3">🔬</div>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            এই ফিল্টারে কোনো সিমুলেশন পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sim) => {
            const thumb = SIM_THUMBNAILS[sim.slug];
            return (
              <Link
                key={sim.slug}
                href={`/sim/${sim.slug}`}
                className="group block rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                {/* Thumbnail */}
                <div
                  className="h-44 relative overflow-hidden"
                  style={{ background: thumb?.bg || SUBJECT_COLORS[sim.config.subject] + '15' }}
                >
                  {/* SVG visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="text-6xl opacity-20 group-hover:scale-110 suttro-transition select-none"
                      style={{ color: SUBJECT_COLORS[sim.config.subject] }}
                    >
                      {thumb?.icon || SUBJECT_ICONS[sim.config.subject]}
                    </div>
                  </div>

                  {/* Thumbnail illustration */}
                  {thumb?.visual && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 group-hover:scale-[1.03] suttro-transition">
                      <div
                        dangerouslySetInnerHTML={{ __html: thumb.visual }}
                        className="w-full h-full max-w-[240px] max-h-[130px]"
                      />
                    </div>
                  )}

                  {/* Subject badge */}
                  <div
                    className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ background: SUBJECT_COLORS[sim.config.subject] }}
                  >
                    {SUBJECT_LABELS[sim.config.subject]} · অধ্যায় {sim.config.nctb.chapter}
                  </div>

                  {/* Play icon */}
                  <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 suttro-transition shadow-lg" style={{ background: 'var(--suttro-primary)' }}>
                    ▶
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--suttro-deep)' }}>
                    {sim.config.title.bn}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: 'var(--suttro-muted)' }}>
                    {sim.config.title.en} · ক্লাস {sim.config.nctb.class}
                  </p>

                  {/* Formulas */}
                  {sim.config.formulas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {sim.config.formulas.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className="font-mono text-xs px-2 py-1 rounded"
                          style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-deep)' }}
                        >
                          {f.expression}
                        </span>
                      ))}
                    </div>
                  )}

                  <span
                    className="text-sm font-medium inline-flex items-center gap-2 suttro-transition"
                    style={{ color: 'var(--suttro-primary)' }}
                  >
                    সিমুলেশন চালাও
                    <span className="suttro-transition group-hover:translate-x-1 inline-block">&rarr;</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
