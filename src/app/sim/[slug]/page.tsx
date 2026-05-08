import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSimulation, simulations } from '@/simulations/registry';
import { getSimulationMeta } from '@/lib/simulations-db';
import MotionSim from '@/simulations/physics/motion/MotionSim';

interface SimPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return simulations.map((sim) => ({ slug: sim.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: SimPageProps) {
  const { slug } = await params;
  const sim = getSimulation(slug);
  if (!sim) return { title: 'সিমুলেশন পাওয়া যায়নি - Suttro' };

  // Prefer DB meta, fall back to code config
  const dbMeta = await getSimulationMeta(slug);
  const titleBn = dbMeta?.title_bn ?? sim.config.title.bn;
  const description =
    dbMeta?.description_bn ??
    `${titleBn} ইন্টারেক্টিভ সিমুলেশন। NCTB ক্লাস ${sim.config.nctb.class}, অধ্যায় ${sim.config.nctb.chapter}।`;

  return {
    title: `${titleBn} - Suttro | suttro.app`,
    description,
  };
}

// Map slug → component. Each accepts an optional videoUrl prop.
type SimComponent = React.ComponentType<{ videoUrl?: string }>;
const SIMULATION_COMPONENTS: Record<string, SimComponent> = {
  motion: MotionSim,
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

/** Convert YouTube watch URL to embed URL — handles youtu.be, watch?v=, /embed/ */
function toEmbedUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let id = '';
      if (u.hostname.includes('youtu.be')) {
        id = u.pathname.replace('/', '');
      } else if (u.pathname.startsWith('/embed/')) {
        id = u.pathname.replace('/embed/', '');
      } else {
        id = u.searchParams.get('v') ?? '';
      }
      if (!id) return undefined;
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return undefined;
  }
}

export default async function SimPage({ params }: SimPageProps) {
  const { slug } = await params;
  const sim = getSimulation(slug);
  if (!sim) notFound();

  const SimComponent = SIMULATION_COMPONENTS[slug];
  if (!SimComponent) notFound();

  // Fetch DB meta (admin-editable) — fall back to code config
  const dbMeta = await getSimulationMeta(slug);

  // If admin marked private/deleted, hide
  if (dbMeta && dbMeta.status !== 'public') notFound();

  const titleBn = dbMeta?.title_bn ?? sim.config.title.bn;
  const titleEn = dbMeta?.title_en ?? sim.config.title.en;
  const descriptionBn = dbMeta?.description_bn;
  const longDescriptionBn = dbMeta?.long_description_bn;
  const subject = dbMeta?.subject ?? sim.config.subject;
  const nctbClass = dbMeta?.nctb_class ?? sim.config.nctb.class;
  const nctbChapter = dbMeta?.nctb_chapter ?? sim.config.nctb.chapter;
  const videoUrl = toEmbedUrl(dbMeta?.youtube_url);

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      {/* ── Player ── */}
      <div className="sim-player-wrap">
        <SimComponent videoUrl={videoUrl} />
      </div>

      {/* ── Content below player ── */}
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-5 lg:py-8">
        {/* Breadcrumb */}
        <nav
          className="hidden lg:flex items-center gap-2 text-base mb-5"
          style={{ color: 'var(--suttro-muted)' }}
        >
          <Link href="/simulations" className="hover:underline">সিমুলেশন</Link>
          <span>&rsaquo;</span>
          <span>{SUBJECT_LABELS[subject]}</span>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--suttro-text)' }}>{titleBn}</span>
        </nav>

        {/* Title + meta */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
            {titleBn}
          </h1>
          <p className="text-sm lg:text-base" style={{ color: 'var(--suttro-muted)' }}>
            {titleEn} · NCTB ক্লাস {nctbClass}, অধ্যায় {nctbChapter}
          </p>
          {descriptionBn && (
            <p className="text-sm lg:text-base mt-3" style={{ color: 'var(--suttro-text)' }}>
              {descriptionBn}
            </p>
          )}
        </div>

        {/* Long description (if admin filled) */}
        {longDescriptionBn && (
          <div
            className="mb-6 rounded-[14px] border p-5 text-sm lg:text-base leading-relaxed"
            style={{
              borderColor: 'var(--suttro-border)',
              background: 'var(--suttro-white)',
              color: 'var(--suttro-text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {longDescriptionBn}
          </div>
        )}

        {/* Info grid */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Formulas */}
            {sim.config.formulas.length > 0 && (
              <div
                className="rounded-[14px] border p-5"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
                  সম্পর্কিত সূত্র
                </h3>
                {sim.config.formulas.map((f, i) => (
                  <div key={i} className="flex flex-wrap items-baseline gap-3 mb-2 last:mb-0">
                    <span
                      className="font-mono text-base px-2.5 py-1 rounded"
                      style={{ background: 'var(--suttro-primary-bg)', color: 'var(--suttro-primary-text)' }}
                    >
                      {f.expression}
                    </span>
                    <span className="text-sm lg:text-base" style={{ color: 'var(--suttro-muted)' }}>
                      {f.description.bn}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Variables */}
            <div
              className="rounded-[14px] border p-5"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
                ভ্যারিয়েবল
              </h3>
              <div className="space-y-2">
                {sim.config.variables.map((v) => (
                  <div key={v.id} className="flex justify-between text-sm lg:text-base">
                    <span style={{ color: 'var(--suttro-text)' }}>{v.label.bn}</span>
                    <span className="font-mono" style={{ color: 'var(--suttro-muted)' }}>
                      {v.min}-{v.max} {v.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Share/Download */}
            <div
              className="rounded-[14px] border p-5"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <button
                className="w-full py-2.5 rounded-[10px] text-base font-medium mb-2 suttro-transition hover:opacity-90 tappable"
                style={{ background: 'var(--suttro-primary)', color: 'white' }}
              >
                &#8599; শেয়ার করো
              </button>
              <button
                className="w-full py-2.5 rounded-[10px] text-base font-medium suttro-transition tappable"
                style={{ border: '1.5px solid var(--suttro-border)', color: 'var(--suttro-text)' }}
              >
                &#11015; অফলাইন ডাউনলোড
              </button>
            </div>

            {/* NCTB ref */}
            <div
              className="rounded-[14px] p-5"
              style={{ background: 'var(--suttro-primary-bg)', border: '1px solid var(--suttro-primary-border)' }}
            >
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--suttro-primary-text)' }}>
                NCTB রেফারেন্স
              </h3>
              <p className="text-sm lg:text-base" style={{ color: 'var(--suttro-primary-text)', opacity: 0.8 }}>
                ক্লাস {nctbClass} · {SUBJECT_LABELS[subject]} · অধ্যায় {nctbChapter}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
