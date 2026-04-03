import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ক্লাস আর্কাইভ — সূত্র | suttro.app',
};

// ─────────────────────────────────────────────
// Sample class recordings data
// In production: fetched from Supabase
// ─────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  physics: '#2563EB',
  chemistry: '#7C3AED',
  biology: '#059669',
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
};

interface ClassRecording {
  slug: string;
  title: string;
  subject: string;
  chapter: number;
  classLevel: number;
  date: string;
  duration: string;
  available: boolean;
}

const CLASSES: ClassRecording[] = [
  {
    slug: '2026-04-02-ohms-law',
    title: 'ওহমের সূত্র — তত্ত্ব ও সিমুলেশন',
    subject: 'physics',
    chapter: 11,
    classLevel: 9,
    date: '০২ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    available: false,
  },
  {
    slug: '2026-04-03-light-reflection',
    title: 'আলোর প্রতিফলন — সমতল দর্পণ',
    subject: 'physics',
    chapter: 10,
    classLevel: 9,
    date: '০৩ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    available: false,
  },
  {
    slug: '2026-04-04-acid-base',
    title: 'অ্যাসিড-ক্ষার বিক্রিয়া',
    subject: 'chemistry',
    chapter: 5,
    classLevel: 9,
    date: '০৪ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    available: false,
  },
  {
    slug: '2026-04-05-cell-division',
    title: 'কোষ বিভাজন — মাইটোসিস ও মিয়োসিস',
    subject: 'biology',
    chapter: 3,
    classLevel: 10,
    date: '০৫ এপ্রিল ২০২৬',
    duration: '৫৫ মিনিট',
    available: false,
  },
];

export default function ClassesPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
          ক্লাস আর্কাইভ
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--suttro-muted)' }}>
          প্রতিদিনের ক্লাস রেকর্ডিং — যখন খুশি দেখো, বারবার দেখো।
        </p>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            className="px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: 'var(--suttro-deep)' }}
          >
            সব
          </button>
          {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
            <button
              key={key}
              className="px-4 py-2 rounded-full text-sm font-medium border suttro-transition hover:opacity-80"
              style={{ borderColor: 'var(--suttro-border)', color: 'var(--suttro-text)' }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: SUBJECT_COLORS[key] }}
              />
              {label}
            </button>
          ))}
        </div>

        {/* Class list */}
        <div className="space-y-4">
          {CLASSES.map((cls) => (
            <div
              key={cls.slug}
              className="rounded-[14px] border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              {/* Thumbnail / play icon */}
              <div
                className="w-full sm:w-32 h-20 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: 'var(--player-bg)' }}
              >
                <span className="text-white/40 text-2xl">▶</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ background: SUBJECT_COLORS[cls.subject] }}
                  >
                    {SUBJECT_LABELS[cls.subject]} · অধ্যায় {cls.chapter}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
                    ক্লাস {cls.classLevel}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1 truncate" style={{ color: 'var(--suttro-deep)' }}>
                  {cls.title}
                </h3>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--suttro-muted)' }}>
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
          ))}
        </div>

        {/* Coming soon note */}
        <div
          className="rounded-[14px] p-8 text-center mt-8"
          style={{ background: 'var(--suttro-sky)' }}
        >
          <div className="text-3xl mb-3">📹</div>
          <p className="text-base font-medium mb-2" style={{ color: 'var(--suttro-deep)' }}>
            আরও ক্লাস আসছে
          </p>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            HLS ভিডিও স্ট্রিমিং সহ সব ক্লাস রেকর্ডিং এখানে পাওয়া যাবে।
            প্রতিদিন নতুন ক্লাস যোগ হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
