import Link from 'next/link';
import VideoPlayerWrapper from '@/components/player/VideoPlayerWrapper';
import YouTubePlayerWrapper from '@/components/player/YouTubePlayerWrapper';
import ContentTracker from '@/components/ContentTracker';
import { getClassBySlug } from '@/lib/data';
import { SUBJECT_LABELS } from '@/lib/constants';

// ─────────────────────────────────────────────
// Class Video Player Page
// Design reference Page 7
// ─────────────────────────────────────────────

export const revalidate = 300;

interface ClassPageProps {
  params: Promise<{ slug: string }>;
}

const SUBJECT_COLORS: Record<string, { bg: string; light: string; lightBg: string; border: string; text: string }> = {
  'পদার্থবিজ্ঞান': { bg: '#3B82F6', light: '#60A5FA', lightBg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  'রসায়ন': { bg: '#7C3AED', light: '#A78BFA', lightBg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6' },
  'জীববিজ্ঞান': { bg: '#EC4899', light: '#F472B6', lightBg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D' },
  'সাধারণ গণিত': { bg: '#DC2626', light: '#F87171', lightBg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  'উচ্চতর গণিত': { bg: '#EA580C', light: '#FB923C', lightBg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
  'ইংরেজি': { bg: '#0891B2', light: '#22D3EE', lightBg: '#ECFEFF', border: '#A5F3FC', text: '#155E75' },
};

export async function generateMetadata({ params }: ClassPageProps) {
  const { slug } = await params;
  const cls = await getClassBySlug(slug);
  if (!cls) return { title: 'ক্লাস পাওয়া যায়নি - সূত্র' };
  return {
    title: `${cls.title} - সূত্র | suttro.app`,
    description: cls.description || cls.title,
  };
}

export default async function ClassPlayerPage({ params }: ClassPageProps) {
  const { slug } = await params;
  const cls = await getClassBySlug(slug);

  const subjectBn = cls ? (SUBJECT_LABELS[cls.subject] || cls.subject) : '';
  const styles = SUBJECT_COLORS[subjectBn] || {
    bg: '#0D9488', light: '#14B8A6', lightBg: '#F0FDFA', border: '#CCFBF1', text: '#134E4A',
  };

  return (
    <div style={{ background: '#F8FAFB' }}>
      {cls && <ContentTracker eventType="class_opened" contentType="class" contentId={slug} />}

      {/* ══════ MOBILE ══════ */}
      <div className="lg:hidden">
        {/* Video Player - full width, no padding */}
        <div style={{ background: '#0d1117' }}>
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
              style={{ background: '#0d1117' }}
            >
              <div className="text-center">
                <div
                  className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <span className="text-white text-lg">▶</span>
                </div>
                <p className="text-white/50 text-xs">
                  {cls ? 'ভিডিও শীঘ্রই আপলোড হবে' : 'ক্লাস পাওয়া যায়নি'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="px-4 py-4">
          {cls ? (
            <>
              <h1 className="text-base font-bold mb-1" style={{ color: '#134E4A' }}>
                {cls.title}
              </h1>
              <div className="text-[11px] mb-3" style={{ color: '#5F9EA0' }}>
                {cls.date} · {cls.duration}
              </div>

              {/* Action buttons row */}
              <div className="flex gap-4 mb-4">
                {[
                  { icon: '❤', label: 'লাইক' },
                  { icon: '⇓', label: 'ডাউনলোড' },
                  { icon: '↗', label: 'শেয়ার' },
                  { icon: '★', label: 'বুকমার্ক' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <span className="text-base" style={{ color: '#0D9488' }}>
                      {action.icon}
                    </span>
                    <span className="text-[9px]" style={{ color: '#94A3B8' }}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Related content */}
              <div className="text-xs font-semibold mb-2" style={{ color: '#134E4A' }}>
                সম্পর্কিত কন্টেন্ট
              </div>

              {cls.relatedSim && (
                <Link
                  href={`/sim/${cls.relatedSim.slug}`}
                  className="flex items-center gap-2.5 rounded-xl p-3 mb-1.5 suttro-transition active:scale-[0.98]"
                  style={{ background: 'white', border: `1px solid ${styles.border}` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${styles.bg}, ${styles.light})`,
                    }}
                  >
                    ⚡
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold" style={{ color: styles.text }}>
                      সিমুলেশন চালাও
                    </div>
                    <div className="text-[10px]" style={{ color: '#5F9EA0' }}>
                      ইন্টারেক্টিভ {cls.relatedSim.label}
                    </div>
                  </div>
                </Link>
              )}

              {/* MCQ link for this chapter */}
              <Link
                href={`/practice/${cls.subject}/${cls.chapter}`}
                className="flex items-center gap-2.5 rounded-xl p-3 suttro-transition active:scale-[0.98]"
                style={{ background: 'white', border: '1px solid #DDD6FE' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                  }}
                >
                  ✎
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold" style={{ color: '#5B21B6' }}>
                    MCQ পরীক্ষা দাও
                  </div>
                  <div className="text-[10px]" style={{ color: '#5F9EA0' }}>
                    অধ্যায় {cls.chapter} এর প্রশ্ন
                  </div>
                </div>
              </Link>

              {/* Description */}
              {cls.description && (
                <div className="mt-3 rounded-xl p-3" style={{ background: 'white', border: '1px solid #F0F4F3' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#134E4A' }}>
                    ক্লাসের বিষয়বস্তু
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#5F9EA0' }}>
                    {cls.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: '#94A3B8' }}>ক্লাস পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ DESKTOP (preserved) ══════ */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <nav className="flex items-center gap-2 text-base mb-4" style={{ color: '#94A3B8' }}>
            <Link href="/classes" className="hover:underline">ক্লাস আর্কাইভ</Link>
            <span>&rsaquo;</span>
            {cls && (
              <>
                <span>{subjectBn}</span>
                <span>&rsaquo;</span>
              </>
            )}
            <span style={{ color: '#134E4A' }}>{cls?.title || slug}</span>
          </nav>

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
              <div className="aspect-video flex items-center justify-center" style={{ background: '#0d1117' }}>
                <div className="text-center">
                  <div className="text-5xl mb-4 opacity-40">▶</div>
                  <p className="text-white/60 text-base mb-2">
                    {cls ? 'ভিডিও শীঘ্রই আপলোড হবে' : 'ক্লাস পাওয়া যায়নি'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#134E4A' }}>
                {cls?.title || 'ক্লাস রেকর্ডিং'}
              </h1>
              {cls && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded text-sm font-medium text-white" style={{ background: styles.bg }}>
                      {subjectBn} · অধ্যায় {cls.chapter}
                    </span>
                    <span className="text-base" style={{ color: '#94A3B8' }}>
                      ক্লাস {cls.classLevel} · {cls.date} · {cls.duration}
                    </span>
                  </div>
                  {cls.description && (
                    <div className="rounded-[14px] border p-5" style={{ borderColor: '#F0F4F3', background: 'white' }}>
                      <h3 className="text-base font-semibold mb-2" style={{ color: '#134E4A' }}>ক্লাসের বিষয়বস্তু</h3>
                      <p className="text-base leading-relaxed" style={{ color: '#5F9EA0' }}>{cls.description}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <div className="rounded-[14px] border p-5 mb-6" style={{ borderColor: '#F0F4F3', background: 'white' }}>
                <button className="w-full py-2.5 rounded-[10px] text-base font-medium mb-2 text-white suttro-transition hover:opacity-90" style={{ background: '#0D9488' }}>
                  ↗ শেয়ার করো
                </button>
                <button className="w-full py-2.5 rounded-[10px] text-base font-medium suttro-transition" style={{ border: '1.5px solid #F0F4F3', color: '#134E4A' }}>
                  ⇓ অফলাইন ডাউনলোড
                </button>
              </div>
              {cls?.relatedSim && (
                <div className="rounded-[14px] p-5" style={{ background: '#F0FDFA' }}>
                  <h3 className="text-base font-semibold mb-2" style={{ color: '#134E4A' }}>সম্পর্কিত সিমুলেশন</h3>
                  <Link href={`/sim/${cls.relatedSim.slug}`} className="flex items-center justify-between text-base suttro-transition hover:opacity-80" style={{ color: '#0D9488' }}>
                    <span>{cls.relatedSim.label}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
