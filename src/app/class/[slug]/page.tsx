import Link from 'next/link';
import VideoPlayerWrapper from '@/components/player/VideoPlayerWrapper';
import YouTubePlayerWrapper from '@/components/player/YouTubePlayerWrapper';
import { getClassBySlug } from '@/lib/data';
import { SUBJECT_LABELS } from '@/lib/constants';

// ─────────────────────────────────────────────
// Class Video Player Page
// Supports HLS streaming + YouTube embeds
// ─────────────────────────────────────────────

export const revalidate = 300;

interface ClassPageProps {
  params: Promise<{ slug: string }>;
}

const SUBJECT_COLORS_BN: Record<string, string> = {
  'পদার্থবিজ্ঞান': '#2563EB',
  'রসায়ন': '#7C3AED',
  'জীববিজ্ঞান': '#059669',
  'সাধারণ গণিত': '#DC2626',
  'উচ্চতর গণিত': '#EA580C',
  'ইংরেজি': '#0891B2',
};

export async function generateMetadata({ params }: ClassPageProps) {
  const { slug } = await params;
  const cls = await getClassBySlug(slug);
  if (!cls) return { title: 'ক্লাস পাওয়া যায়নি — সূত্র' };

  return {
    title: `${cls.title} — সূত্র | suttro.app`,
    description: cls.description || cls.title,
  };
}

export default async function ClassPlayerPage({ params }: ClassPageProps) {
  const { slug } = await params;
  const cls = await getClassBySlug(slug);

  // Get Bangla subject name for display
  const subjectBn = cls ? (SUBJECT_LABELS[cls.subject] || cls.subject) : '';
  const subjectColor = cls ? (SUBJECT_COLORS_BN[subjectBn] || '#666') : '#666';

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-base mb-4" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/classes" className="hover:underline">ক্লাস আর্কাইভ</Link>
          <span>&rsaquo;</span>
          {cls && (
            <>
              <span>{subjectBn}</span>
              <span>&rsaquo;</span>
            </>
          )}
          <span style={{ color: 'var(--suttro-text)' }}>
            {cls?.title || slug}
          </span>
        </nav>

        {/* Video Player */}
        <div className="rounded-[14px] overflow-hidden shadow-lg mb-8">
          {cls?.hlsSrc ? (
            <VideoPlayerWrapper
              src={cls.hlsSrc}
              title={cls.title}
              chapterTag={`${subjectBn} · অধ্যায় ${cls.chapter}`}
            />
          ) : cls?.youtubeId ? (
            <YouTubePlayerWrapper
              videoId={cls.youtubeId}
              title={cls.title}
              chapterTag={`${subjectBn} · অধ্যায় ${cls.chapter}`}
            />
          ) : (
            <div
              className="aspect-video flex items-center justify-center"
              style={{ background: 'var(--player-bg)' }}
            >
              <div className="text-center">
                <div className="text-5xl mb-4 opacity-40">▶</div>
                <p className="text-white/60 text-base mb-2">
                  {cls ? 'ভিডিও শীঘ্রই আপলোড হবে' : 'ক্লাস পাওয়া যায়নি'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Below player info */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
              {cls?.title || 'ক্লাস রেকর্ডিং'}
            </h1>
            {cls && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-2.5 py-1 rounded text-sm font-medium text-white"
                    style={{ background: subjectColor }}
                  >
                    {subjectBn} · অধ্যায় {cls.chapter}
                  </span>
                  <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                    ক্লাস {cls.classLevel} · {cls.date} · {cls.duration}
                  </span>
                </div>
                {cls.description && (
                  <div
                    className="rounded-[14px] border p-5"
                    style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
                  >
                    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                      ক্লাসের বিষয়বস্তু
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
                      {cls.description}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div
              className="rounded-[14px] border p-5 mb-6"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <button
                className="w-full py-2.5 rounded-[10px] text-base font-medium mb-2 suttro-transition hover:opacity-90"
                style={{ background: 'var(--suttro-primary)', color: 'white' }}
              >
                &#8599; শেয়ার করো
              </button>
              <button
                className="w-full py-2.5 rounded-[10px] text-base font-medium suttro-transition"
                style={{ border: '1.5px solid var(--suttro-border)', color: 'var(--suttro-text)' }}
              >
                &#11015; অফলাইন ডাউনলোড
              </button>
            </div>

            {/* Related simulation */}
            {cls?.relatedSim && (
              <div
                className="rounded-[14px] p-5"
                style={{ background: 'var(--suttro-sky)' }}
              >
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                  সম্পর্কিত সিমুলেশন
                </h3>
                <Link
                  href={`/sim/${cls.relatedSim.slug}`}
                  className="flex items-center justify-between text-base suttro-transition hover:opacity-80"
                  style={{ color: 'var(--suttro-primary)' }}
                >
                  <span>{cls.relatedSim.label}</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
