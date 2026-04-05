import Link from 'next/link';
import VideoPlayerWrapper from '@/components/player/VideoPlayerWrapper';
import YouTubePlayerWrapper from '@/components/player/YouTubePlayerWrapper';

// ─────────────────────────────────────────────
// Class Video Player Page
// Supports HLS streaming + YouTube embeds
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
  youtubeId: string | null;
  description: string;
  relatedSim: { slug: string; label: string } | null;
}> = {
  // ── পদার্থবিজ্ঞান (Physics) ──
  '2026-04-02-ohms-law': {
    title: 'ওহমের সূত্র — তত্ত্ব ও সিমুলেশন',
    subject: 'পদার্থবিজ্ঞান',
    chapter: 11,
    classLevel: 9,
    date: '০২ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    hlsSrc: null,
    youtubeId: 'h3o6ZKf3QTU',
    description: 'ওহমের সূত্র কী, কিভাবে কাজ করে, V=IR সূত্র থেকে গণনা, এবং সিমুলেশন দিয়ে হাতে-কলমে অনুশীলন।',
    relatedSim: { slug: 'ohms-law', label: 'ওহমের সূত্র সিমুলেশন' },
  },
  '2026-04-03-light-reflection': {
    title: 'আলোর প্রতিফলন — সমতল দর্পণ',
    subject: 'পদার্থবিজ্ঞান',
    chapter: 10,
    classLevel: 9,
    date: '০৩ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    hlsSrc: null,
    youtubeId: 'tyiaB96lgOE',
    description: 'আলোর প্রতিফলনের সূত্র, সমতল দর্পণে প্রতিবিম্ব গঠন, এবং প্রতিফলনের নিয়মাবলী।',
    relatedSim: { slug: 'light-reflection', label: 'আলোর প্রতিফলন সিমুলেশন' },
  },
  '2026-04-06-light-refraction': {
    title: 'আলোর প্রতিসরণ — স্নেলের সূত্র',
    subject: 'পদার্থবিজ্ঞান',
    chapter: 10,
    classLevel: 9,
    date: '০৬ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    hlsSrc: null,
    youtubeId: '9Y0Qirsl4fk',
    description: 'আলোর প্রতিসরণ, স্নেলের সূত্র, প্রতিসরণাঙ্ক, এবং আলোর গতিপথ পরিবর্তনের কারণ।',
    relatedSim: { slug: 'light-refraction', label: 'আলোর প্রতিসরণ সিমুলেশন' },
  },

  // ── রসায়ন (Chemistry) ──
  '2026-04-04-acid-base': {
    title: 'অ্যাসিড-ক্ষার বিক্রিয়া ও pH স্কেল',
    subject: 'রসায়ন',
    chapter: 5,
    classLevel: 9,
    date: '০৪ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    hlsSrc: null,
    youtubeId: 'INKPA6RILS0',
    description: 'অ্যাসিড ও ক্ষারের ধর্ম, pH স্কেল, প্রশমন বিক্রিয়া, এবং দৈনন্দিন জীবনে অ্যাসিড-ক্ষারের ব্যবহার।',
    relatedSim: { slug: 'acid-base', label: 'অ্যাসিড-ক্ষার সিমুলেশন' },
  },
  '2026-04-07-atomic-structure': {
    title: 'পরমাণুর গঠন — বোর মডেল',
    subject: 'রসায়ন',
    chapter: 3,
    classLevel: 9,
    date: '০৭ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    hlsSrc: null,
    youtubeId: '629kKhLr_xw',
    description: 'পরমাণুর গঠন, ইলেকট্রন-প্রোটন-নিউট্রন, বোর মডেল, ইলেকট্রন বিন্যাস ও পর্যায় সারণি।',
    relatedSim: { slug: 'atomic-structure', label: 'পরমাণুর গঠন সিমুলেশন' },
  },

  // ── জীববিজ্ঞান (Biology) ──
  '2026-04-05-cell-division': {
    title: 'কোষ বিভাজন — মাইটোসিস',
    subject: 'জীববিজ্ঞান',
    chapter: 3,
    classLevel: 10,
    date: '০৫ এপ্রিল ২০২৬',
    duration: '৫৫ মিনিট',
    hlsSrc: null,
    youtubeId: 'djJgivCm18k',
    description: 'মাইটোসিস কোষ বিভাজনের ধাপ — প্রোফেজ, মেটাফেজ, অ্যানাফেজ, টেলোফেজ ও সাইটোকাইনেসিস।',
    relatedSim: { slug: 'cell-division', label: 'কোষ বিভাজন সিমুলেশন' },
  },
  '2026-04-08-photosynthesis': {
    title: 'সালোকসংশ্লেষণ — আলোক ও অন্ধকার পর্যায়',
    subject: 'জীববিজ্ঞান',
    chapter: 4,
    classLevel: 9,
    date: '০৮ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    hlsSrc: null,
    youtubeId: 'cpLOajjJ10Q',
    description: 'সালোকসংশ্লেষণ প্রক্রিয়া, ক্লোরোফিলের ভূমিকা, আলোক ও অন্ধকার পর্যায়, এবং ATP উৎপাদন।',
    relatedSim: { slug: 'photosynthesis', label: 'সালোকসংশ্লেষণ সিমুলেশন' },
  },

  // ── সাধারণ গণিত (Math) ──
  '2026-04-09-pythagorean': {
    title: 'পিথাগোরাসের উপপাদ্য',
    subject: 'সাধারণ গণিত',
    chapter: 9,
    classLevel: 9,
    date: '০৯ এপ্রিল ২০২৬',
    duration: '৩৫ মিনিট',
    hlsSrc: null,
    youtubeId: 'yCAB23Y7T-Q',
    description: 'পিথাগোরাসের উপপাদ্য, a² + b² = c² সূত্রের প্রমাণ, এবং সমকোণী ত্রিভুজের সমস্যা সমাধান।',
    relatedSim: { slug: 'pythagorean', label: 'পিথাগোরাসের উপপাদ্য সিমুলেশন' },
  },
  '2026-04-10-circle-geometry': {
    title: 'বৃত্তের ক্ষেত্রফল ও পরিধি',
    subject: 'সাধারণ গণিত',
    chapter: 8,
    classLevel: 9,
    date: '১০ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    hlsSrc: null,
    youtubeId: 'JVDS7HxxxA4',
    description: 'বৃত্তের ক্ষেত্রফল πr², পরিধি 2πr, ব্যাস ও ব্যাসার্ধের সম্পর্ক, এবং বৃত্ত সংক্রান্ত গাণিতিক সমস্যা।',
    relatedSim: { slug: 'circle-geometry', label: 'বৃত্তের জ্যামিতি সিমুলেশন' },
  },

  // ── উচ্চতর গণিত (Higher Math) ──
  '2026-04-11-trigonometry': {
    title: 'ত্রিকোণমিতিক অনুপাত — sin, cos, tan',
    subject: 'উচ্চতর গণিত',
    chapter: 8,
    classLevel: 9,
    date: '১১ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    hlsSrc: null,
    youtubeId: 'oGQB13M_oWE',
    description: 'ত্রিকোণমিতিক অনুপাত — sin θ, cos θ, tan θ-এর সংজ্ঞা, একক বৃত্ত, এবং বিশেষ কোণের মান।',
    relatedSim: { slug: 'trigonometry', label: 'ত্রিকোণমিতি সিমুলেশন' },
  },
  '2026-04-12-straight-line': {
    title: 'সরলরেখার সমীকরণ — y = mx + c',
    subject: 'উচ্চতর গণিত',
    chapter: 3,
    classLevel: 10,
    date: '১২ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    hlsSrc: null,
    youtubeId: '2XgLvZ9ofKk',
    description: 'সরলরেখার সমীকরণ, ঢাল ও y-অন্তঃখণ্ড, দুই বিন্দু দিয়ে যাওয়া রেখার সমীকরণ নির্ণয়।',
    relatedSim: { slug: 'straight-line', label: 'সরলরেখা সিমুলেশন' },
  },

  // ── ইংরেজি (English) ──
  '2026-04-13-tense': {
    title: 'Tense — ১২টি কাল সম্পূর্ণ আলোচনা',
    subject: 'ইংরেজি',
    chapter: 2,
    classLevel: 9,
    date: '১৩ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    hlsSrc: null,
    youtubeId: 'Bw-SmUib6cI',
    description: 'ইংরেজি ১২টি Tense — Past, Present, Future এবং Simple, Continuous, Perfect, Perfect Continuous।',
    relatedSim: { slug: 'tense-timeline', label: 'টেন্স টাইমলাইন সিমুলেশন' },
  },
  '2026-04-14-sentence-structure': {
    title: 'Sentence Structure — SVO বিশ্লেষণ',
    subject: 'ইংরেজি',
    chapter: 1,
    classLevel: 9,
    date: '১৪ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    hlsSrc: null,
    youtubeId: 'eanlAd9vH8Q',
    description: 'বাক্য গঠন — Subject, Verb, Object, বিবৃতিমূলক, প্রশ্নবোধক, অনুজ্ঞাসূচক ও বিস্ময়সূচক বাক্য।',
    relatedSim: { slug: 'sentence-structure', label: 'বাক্য গঠন সিমুলেশন' },
  },
};

const SUBJECT_COLORS: Record<string, string> = {
  'পদার্থবিজ্ঞান': '#2563EB',
  'রসায়ন': '#7C3AED',
  'জীববিজ্ঞান': '#059669',
  'সাধারণ গণিত': '#DC2626',
  'উচ্চতর গণিত': '#EA580C',
  'ইংরেজি': '#0891B2',
};

export function generateStaticParams() {
  return Object.keys(CLASS_DATA).map((slug) => ({ slug }));
}

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
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-base mb-4" style={{ color: 'var(--suttro-muted)' }}>
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
          ) : cls?.youtubeId ? (
            <YouTubePlayerWrapper
              videoId={cls.youtubeId}
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
                    style={{ background: SUBJECT_COLORS[cls.subject] || '#666' }}
                  >
                    {cls.subject} · অধ্যায় {cls.chapter}
                  </span>
                  <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                    ক্লাস {cls.classLevel} · {cls.date} · {cls.duration}
                  </span>
                </div>
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
