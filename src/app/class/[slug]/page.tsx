import Link from 'next/link';
import VideoPlayerWrapper from '@/components/player/VideoPlayerWrapper';

// ─────────────────────────────────────────────
// Class Video Player Page
// Uses same player shell concept as simulation
// ─────────────────────────────────────────────

interface ClassPageProps {
  params: Promise<{ slug: string }>;
}

// Sample class data — in production: Supabase query
const CLASS_DATA: Record<string, {
  title: string;
  subject: string;
  chapter: number;
  classLevel: number;
  date: string;
  duration: string;
  hlsSrc: string | null;
  description: string;
}> = {
  '2026-04-02-ohms-law': {
    title: 'ওহমের সূত্র — তত্ত্ব ও সিমুলেশন',
    subject: 'পদার্থবিজ্ঞান',
    chapter: 11,
    classLevel: 9,
    date: '০২ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    hlsSrc: null, // Will be HLS URL when available
    description: 'ওহমের সূত্র কী, কিভাবে কাজ করে, V=IR সূত্র থেকে গণনা, এবং সিমুলেশন দিয়ে হাতে-কলমে অনুশীলন।',
  },
};

const SUBJECT_COLORS: Record<string, string> = {
  'পদার্থবিজ্ঞান': '#2563EB',
  'রসায়ন': '#7C3AED',
  'জীববিজ্ঞান': '#059669',
};

export async function generateMetadata({ params }: ClassPageProps) {
  const { slug } = await params;
  const cls = CLASS_DATA[slug];
  if (!cls) return { title: 'ক্লাস পাওয়া যায়নি — সূত্র' };

  return {
    title: `${cls.title} — সূত্র | suttro.app`,
    description: cls.description,
  };
}

export default async function ClassPlayerPage({ params }: ClassPageProps) {
  const { slug } = await params;
  const cls = CLASS_DATA[slug];

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/classes" className="hover:underline">ক্লাস আর্কাইভ</Link>
          <span>&rsaquo;</span>
          {cls && (
            <>
              <span>{cls.subject}</span>
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
              chapterTag={`${cls.subject} · অধ্যায় ${cls.chapter}`}
            />
          ) : (
            <div
              className="aspect-video flex items-center justify-center"
              style={{ background: 'var(--player-bg)' }}
            >
              <div className="text-center">
                <div className="text-5xl mb-4 opacity-40">▶</div>
                <p className="text-white/60 text-sm mb-2">
                  {cls ? 'ভিডিও শীঘ্রই আপলোড হবে' : 'ক্লাস পাওয়া যায়নি'}
                </p>
                {cls && (
                  <p className="text-white/30 text-xs">
                    HLS স্ট্রিমিং দিয়ে দেখা যাবে
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Below player info */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
              {cls?.title || 'ক্লাস রেকর্ডিং'}
            </h1>
            {cls && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-2.5 py-1 rounded text-xs font-medium text-white"
                    style={{ background: SUBJECT_COLORS[cls.subject] || '#666' }}
                  >
                    {cls.subject} · অধ্যায় {cls.chapter}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                    ক্লাস {cls.classLevel} · {cls.date} · {cls.duration}
                  </span>
                </div>
                <div
                  className="rounded-[14px] border p-5"
                  style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                    ক্লাসের বিষয়বস্তু
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--suttro-text)' }}>
                    {cls.description}
                  </p>
                </div>
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
                className="w-full py-2.5 rounded-[10px] text-sm font-medium mb-2 suttro-transition hover:opacity-90"
                style={{ background: 'var(--suttro-primary)', color: 'white' }}
              >
                &#8599; শেয়ার করো
              </button>
              <button
                className="w-full py-2.5 rounded-[10px] text-sm font-medium suttro-transition"
                style={{ border: '1.5px solid var(--suttro-border)', color: 'var(--suttro-text)' }}
              >
                &#11015; অফলাইন ডাউনলোড
              </button>
            </div>

            {/* Related simulation */}
            {cls && (
              <div
                className="rounded-[14px] p-5"
                style={{ background: 'var(--suttro-sky)' }}
              >
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                  সম্পর্কিত সিমুলেশন
                </h3>
                <Link
                  href="/sim/ohms-law"
                  className="flex items-center justify-between text-sm suttro-transition hover:opacity-80"
                  style={{ color: 'var(--suttro-primary)' }}
                >
                  <span>ওহমের সূত্র সিমুলেশন</span>
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
