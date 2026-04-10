import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubjectGuide } from '@/lib/data';
import ChapterMasteryLoader from '@/components/guide/ChapterMasteryLoader';
import PracticeButton from '@/components/guide/PracticeButton';

// ─────────────────────────────────────────────
// Subject Guide — Chapter List
// Design reference Page 4
// ─────────────────────────────────────────────

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const guide = await getSubjectGuide(subject);
  if (!guide) return { title: 'পাওয়া যায়নি — সূত্র' };
  return {
    title: `${guide.subjectBn} গাইড — সূত্র | suttro.app`,
    description: `${guide.subjectBn} — ${guide.chapters.length} অধ্যায়ের সব কন্টেন্ট এক জায়গায়।`,
  };
}

// Subject-specific styling
const SUBJECT_STYLES: Record<string, { bg: string; lightBg: string; border: string; textColor: string; light: string }> = {
  physics: { bg: '#3B82F6', lightBg: '#EFF6FF', border: '#BFDBFE', textColor: '#1E40AF', light: '#60A5FA' },
  chemistry: { bg: '#7C3AED', lightBg: '#F5F3FF', border: '#DDD6FE', textColor: '#5B21B6', light: '#A78BFA' },
  biology: { bg: '#EC4899', lightBg: '#FDF2F8', border: '#FBCFE8', textColor: '#9D174D', light: '#F472B6' },
  math: { bg: '#DC2626', lightBg: '#FEF2F2', border: '#FECACA', textColor: '#991B1B', light: '#F87171' },
  'higher-math': { bg: '#EA580C', lightBg: '#FFF7ED', border: '#FED7AA', textColor: '#9A3412', light: '#FB923C' },
  english: { bg: '#0891B2', lightBg: '#ECFEFF', border: '#A5F3FC', textColor: '#155E75', light: '#22D3EE' },
};

const CONTENT_BADGES = [
  { key: 'simulations' as const, label: 'সিম' },
  { key: 'classes' as const, label: 'ভিডিও' },
  { key: 'mcq' as const, label: 'MCQ' },
  { key: 'cq' as const, label: 'সৃজনশীল' },
];

export default async function SubjectGuidePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const guide = await getSubjectGuide(subject);
  if (!guide) notFound();

  const styles = SUBJECT_STYLES[subject] || {
    bg: guide.color,
    lightBg: `${guide.color}08`,
    border: `${guide.color}30`,
    textColor: guide.color,
    light: guide.color,
  };

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* ── Subject Header ── */}
      <div
        className="px-4 py-4"
        style={{
          background: `linear-gradient(180deg, ${styles.lightBg}, #F8FAFB)`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{
              background: `linear-gradient(135deg, ${styles.bg}, ${styles.light})`,
            }}
          >
            {guide.icon}
          </div>
          <div className="flex-1">
            <h1
              className="text-lg font-bold"
              style={{ color: styles.textColor }}
            >
              {guide.subjectBn}
            </h1>
            <p className="text-xs" style={{ color: styles.light }}>
              ক্লাস ৯-১০ — {guide.chapters.length} অধ্যায়
            </p>
          </div>
        </div>

        {/* Content summary badges */}
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_BADGES.map((badge) => {
            const count = guide.totals[badge.key];
            if (count === 0) return null;
            return (
              <span
                key={badge.key}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{
                  background: styles.lightBg,
                  color: styles.textColor,
                  border: `1px solid ${styles.border}`,
                }}
              >
                {count} {badge.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Mastery progress (client component) */}
      <div className="px-4">
        <ChapterMasteryLoader
          subjectId={subject}
          totalChapters={guide.chapters.length}
          color={guide.color}
        />
      </div>

      {/* ── Chapter List ── */}
      <div className="px-4 pb-6">
        <div
          className="text-xs font-semibold mb-2 tracking-wider"
          style={{ color: '#5F9EA0' }}
        >
          অধ্যায়সমূহ
        </div>

        <div className="flex flex-col gap-1.5">
          {guide.chapters.map((ch) => {
            // Build content text: "সিম ২ · ভিডিও ১ · MCQ ৬৫"
            const contentParts: string[] = [];
            if (ch.content.simulations > 0) contentParts.push(`সিম ${ch.content.simulations}`);
            if (ch.content.classes > 0) contentParts.push(`ভিডিও ${ch.content.classes}`);
            if (ch.content.mcq > 0) contentParts.push(`MCQ ${ch.content.mcq}`);
            if (ch.content.cq > 0) contentParts.push(`সৃজনশীল ${ch.content.cq}`);
            const contentText = contentParts.join(' · ');

            return (
              <Link
                key={ch.chapter}
                href={`/guide/${subject}/${ch.chapter}`}
                className="rounded-xl p-3 flex items-center gap-2.5 suttro-transition active:scale-[0.98]"
                style={{
                  background: 'white',
                  border: `1px solid ${ch.total > 0 ? styles.border : '#F0F4F3'}`,
                }}
              >
                {/* Chapter number circle */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={
                    ch.total > 0
                      ? {
                          background: '#E2E8F0',
                          color: '#94A3B8',
                        }
                      : {
                          background: '#E2E8F0',
                          color: '#94A3B8',
                        }
                  }
                >
                  {ch.chapter}
                </div>

                {/* Chapter info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: '#134E4A' }}
                  >
                    অধ্যায় {ch.chapter}: {ch.name}
                  </div>
                  <div className="text-[11px]" style={{ color: '#5F9EA0' }}>
                    {ch.total > 0 ? contentText : 'শীঘ্রই আসছে'}
                  </div>
                </div>

                {/* Practice button or arrow */}
                {ch.content.mcq > 0 && (
                  <PracticeButton href={`/practice/${subject}/${ch.chapter}`} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
