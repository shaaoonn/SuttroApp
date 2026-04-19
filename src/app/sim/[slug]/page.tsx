import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSimulation, simulations } from '@/simulations/registry';
import OhmsLawSim from '@/simulations/physics/ohms-law/OhmsLawSim';
import LightReflectionSim from '@/simulations/physics/light-reflection/LightReflectionSim';
import LightRefractionSim from '@/simulations/physics/light-refraction/LightRefractionSim';
import AcidBaseSim from '@/simulations/chemistry/acid-base/AcidBaseSim';
import AtomicStructureSim from '@/simulations/chemistry/atomic-structure/AtomicStructureSim';
import CellDivisionSim from '@/simulations/biology/cell-division/CellDivisionSim';
import PhotosynthesisSim from '@/simulations/biology/photosynthesis/PhotosynthesisSim';
import PythagoreanSim from '@/simulations/math/pythagorean/PythagoreanSim';
import CircleGeometrySim from '@/simulations/math/circle-geometry/CircleGeometrySim';
import TrigonometrySim from '@/simulations/higher-math/trigonometry/TrigonometrySim';
import StraightLineSim from '@/simulations/higher-math/straight-line/StraightLineSim';
import SentenceStructureSim from '@/simulations/english/sentence-structure/SentenceStructureSim';
import TenseTimelineSim from '@/simulations/english/tense-timeline/TenseTimelineSim';

interface SimPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return simulations.map((sim) => ({ slug: sim.slug }));
}

export async function generateMetadata({ params }: SimPageProps) {
  const { slug } = await params;
  const sim = getSimulation(slug);
  if (!sim) return { title: 'সিমুলেশন পাওয়া যায়নি — Suttro' };

  return {
    title: `${sim.config.title.bn} — Suttro | suttro.app`,
    description: `${sim.config.title.bn} ইন্টারেক্টিভ সিমুলেশন। NCTB ক্লাস ${sim.config.nctb.class}, অধ্যায় ${sim.config.nctb.chapter}।`,
  };
}

const SIMULATION_COMPONENTS: Record<string, React.ComponentType> = {
  'ohms-law': OhmsLawSim,
  'light-reflection': LightReflectionSim,
  'light-refraction': LightRefractionSim,
  'acid-base': AcidBaseSim,
  'atomic-structure': AtomicStructureSim,
  'cell-division': CellDivisionSim,
  'photosynthesis': PhotosynthesisSim,
  'pythagorean': PythagoreanSim,
  'circle-geometry': CircleGeometrySim,
  'trigonometry': TrigonometrySim,
  'straight-line': StraightLineSim,
  'sentence-structure': SentenceStructureSim,
  'tense-timeline': TenseTimelineSim,
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export default async function SimPage({ params }: SimPageProps) {
  const { slug } = await params;
  const sim = getSimulation(slug);
  if (!sim) notFound();

  const SimComponent = SIMULATION_COMPONENTS[slug];
  if (!SimComponent) notFound();

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      {/* ── Player: edge-to-edge on mobile (YouTube-style), centered on desktop ── */}
      <div className="sim-player-wrap">
        <SimComponent />
      </div>

      {/* ── Content below player: padded ── */}
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-5 lg:py-8">
        {/* Breadcrumb (desktop only — mobile uses native AppBar back button) */}
        <nav
          className="hidden lg:flex items-center gap-2 text-base mb-5"
          style={{ color: 'var(--suttro-muted)' }}
        >
          <Link href="/simulations" className="hover:underline">সিমুলেশন</Link>
          <span>&rsaquo;</span>
          <span>{SUBJECT_LABELS[sim.config.subject]}</span>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--suttro-text)' }}>{sim.config.title.bn}</span>
        </nav>

        {/* Title + meta */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
            {sim.config.title.bn}
          </h1>
          <p className="text-sm lg:text-base" style={{ color: 'var(--suttro-muted)' }}>
            {sim.config.title.en} · NCTB ক্লাস {sim.config.nctb.class}, অধ্যায় {sim.config.nctb.chapter}
          </p>
        </div>

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
                      {v.min}–{v.max} {v.unit}
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
                ক্লাস {sim.config.nctb.class} · {SUBJECT_LABELS[sim.config.subject]} · অধ্যায় {sim.config.nctb.chapter}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
