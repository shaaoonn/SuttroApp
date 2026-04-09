import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getGuide, getSubjectGuide } from '@/lib/data';

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

// Content type badge config
const CONTENT_BADGES = [
  { key: 'simulations' as const, icon: '🔬', label: 'সিমুলেশন' },
  { key: 'classes' as const, icon: '📹', label: 'ক্লাস' },
  { key: 'mcq' as const, icon: '📝', label: 'MCQ' },
  { key: 'cq' as const, icon: '📖', label: 'সৃজনশীল' },
];

export default async function SubjectGuidePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const guide = await getSubjectGuide(subject);
  if (!guide) notFound();

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-base mb-6" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/guide" className="hover:underline">গাইড</Link>
          <span>&rsaquo;</span>
          <span style={{ color: guide.color }}>{guide.icon} {guide.subjectBn}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            {guide.icon} {guide.subjectBn}
          </h1>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            {guide.chapters.length} অধ্যায় — অধ্যায়ে ক্লিক করো সব কন্টেন্ট দেখতে।
          </p>

          {/* Subject totals */}
          <div className="flex flex-wrap gap-3 mt-4">
            {CONTENT_BADGES.map((badge) => {
              const count = guide.totals[badge.key];
              if (count === 0) return null;
              return (
                <span
                  key={badge.key}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: `${guide.color}12`, color: guide.color }}
                >
                  {badge.icon} {count} {badge.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Chapter cards */}
        <div className="space-y-4">
          {guide.chapters.map((ch) => (
            <Link
              key={ch.chapter}
              href={`/guide/${subject}/${ch.chapter}`}
              className="group block rounded-[14px] border overflow-hidden suttro-transition hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <div className="flex items-start gap-4 p-5">
                {/* Chapter number */}
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: guide.color }}
                >
                  {ch.chapter}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Chapter name */}
                  <h3
                    className="text-lg font-semibold mb-2 group-hover:text-[var(--suttro-primary)] suttro-transition"
                    style={{ color: 'var(--suttro-deep)' }}
                  >
                    {ch.name}
                  </h3>

                  {/* Content badges */}
                  {ch.total > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {CONTENT_BADGES.map((badge) => {
                        const count = ch.content[badge.key];
                        if (count === 0) return null;
                        return (
                          <span
                            key={badge.key}
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ background: `${guide.color}10`, color: guide.color }}
                          >
                            {badge.icon} {count}
                          </span>
                        );
                      })}
                      {ch.content.mcq > 0 && (
                        <Link
                          href={`/practice/${subject}/${ch.chapter}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-0.5 rounded text-xs font-medium suttro-transition hover:opacity-80"
                          style={{ background: 'var(--suttro-primary)', color: 'white' }}
                        >
                          অনুশীলন →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                      শীঘ্রই আসছে
                    </span>
                  )}
                </div>

                {/* Arrow */}
                {ch.total > 0 && (
                  <span
                    className="text-xl suttro-transition group-hover:translate-x-1"
                    style={{ color: guide.color }}
                  >
                    &rsaquo;
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
