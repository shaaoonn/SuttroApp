import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuide } from '@/lib/data';
import { getSiteContent } from '@/lib/site-content';

// ─────────────────────────────────────────────
// Guide — Subject selection
// Mobile: gradient icon cards
// ─────────────────────────────────────────────

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'গাইড — বিষয়ভিত্তিক কন্টেন্ট — সূত্র | suttro.app',
  description: 'বিষয় ও অধ্যায় অনুযায়ী সব কন্টেন্ট — সিমুলেশন, ক্লাস, MCQ, সৃজনশীল — এক জায়গায়।',
};

// Subject-specific styling
const SUBJECT_STYLES: Record<string, { bg: string; light: string; lightBg: string; border: string; text: string }> = {
  physics: { bg: '#3B82F6', light: '#60A5FA', lightBg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  chemistry: { bg: '#7C3AED', light: '#A78BFA', lightBg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6' },
  biology: { bg: '#EC4899', light: '#F472B6', lightBg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D' },
  math: { bg: '#DC2626', light: '#F87171', lightBg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  'higher-math': { bg: '#EA580C', light: '#FB923C', lightBg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
  english: { bg: '#0891B2', light: '#22D3EE', lightBg: '#ECFEFF', border: '#A5F3FC', text: '#155E75' },
};

export default async function GuidePage() {
  const [GUIDE, cms] = await Promise.all([getGuide(), getSiteContent('guide')]);

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="px-4 py-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-lg font-bold" style={{ color: '#134E4A' }}>
              {cms.page_title || 'গাইড'}
            </h1>
            <p className="text-xs" style={{ color: '#5F9EA0' }}>
              {cms.page_subtitle || 'বিষয় বেছে নাও'} — {cms.page_description || 'অধ্যায় অনুযায়ী সব কন্টেন্ট'}
            </p>
          </div>

          {/* Subject cards */}
          <div className="flex flex-col gap-2">
            {GUIDE.map((g) => {
              const styles = SUBJECT_STYLES[g.subject] || {
                bg: g.color, light: g.color, lightBg: `${g.color}08`,
                border: `${g.color}30`, text: g.color,
              };

              const contentParts: string[] = [];
              if (g.totals.simulations > 0) contentParts.push(`${g.totals.simulations} সিম`);
              if (g.totals.classes > 0) contentParts.push(`${g.totals.classes} ভিডিও`);
              if (g.totals.mcq > 0) contentParts.push(`${g.totals.mcq} MCQ`);
              if (g.totals.cq > 0) contentParts.push(`${g.totals.cq} সৃজনশীল`);

              return (
                <Link
                  key={g.subject}
                  href={`/guide/${g.subject}`}
                  className="rounded-xl p-3.5 flex items-center gap-3 suttro-transition active:scale-[0.98]"
                  style={{
                    background: 'white',
                    border: `1px solid ${styles.border}`,
                  }}
                >
                  {/* Gradient icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${styles.bg}, ${styles.light})`,
                      boxShadow: `0 3px 10px ${styles.bg}20`,
                    }}
                  >
                    {g.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: styles.text }}>
                      {g.subjectBn}
                    </div>
                    <div className="text-[11px]" style={{ color: styles.light }}>
                      {g.chapters.length} অধ্যায় · {contentParts.join(' · ')}
                    </div>
                  </div>

                  {/* Content badges */}
                  <div className="flex flex-col gap-0.5">
                    {g.totals.simulations > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-medium text-right"
                        style={{ background: styles.lightBg, color: styles.text }}
                      >
                        🔬 {g.totals.simulations}
                      </span>
                    )}
                    {g.totals.mcq > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-medium text-right"
                        style={{ background: styles.lightBg, color: styles.text }}
                      >
                        📝 {g.totals.mcq}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop layout (preserved) */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3" style={{ color: '#134E4A' }}>
              {cms.page_title || 'গাইড'}
            </h1>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              {cms.page_subtitle || 'বিষয় বেছে নাও'} — {cms.page_description || 'অধ্যায় অনুযায়ী সব কন্টেন্ট এক জায়গায়।'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDE.map((g) => {
              const totalContent = g.totals.classes + g.totals.simulations + g.totals.mcq + g.totals.cq;
              const styles = SUBJECT_STYLES[g.subject] || {
                bg: g.color, light: g.color, lightBg: `${g.color}08`,
                border: `${g.color}30`, text: g.color,
              };
              return (
                <Link
                  key={g.subject}
                  href={`/guide/${g.subject}`}
                  className="group block rounded-[14px] border overflow-hidden suttro-transition hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: styles.border, background: 'white' }}
                >
                  <div className="h-2" style={{ background: styles.bg }} />
                  <div className="p-5">
                    <div className="text-3xl mb-2">{g.icon}</div>
                    <h2 className="text-xl font-bold mb-1 suttro-transition" style={{ color: styles.text }}>
                      {g.subjectBn}
                    </h2>
                    <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>
                      {g.chapters.length} অধ্যায় · {totalContent} কন্টেন্ট
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {g.totals.simulations > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: styles.lightBg, color: styles.text }}>
                          🔬 {g.totals.simulations} সিমুলেশন
                        </span>
                      )}
                      {g.totals.classes > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: styles.lightBg, color: styles.text }}>
                          📹 {g.totals.classes} ক্লাস
                        </span>
                      )}
                      {g.totals.mcq > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: styles.lightBg, color: styles.text }}>
                          📝 {g.totals.mcq} MCQ
                        </span>
                      )}
                      {g.totals.cq > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: styles.lightBg, color: styles.text }}>
                          📖 {g.totals.cq} সৃজনশীল
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
