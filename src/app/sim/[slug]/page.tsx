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
  if (!sim) return { title: 'সিমুলেশন পাওয়া যায়নি — সূত্র' };

  return {
    title: `${sim.config.title.bn} — সূত্র | suttro.app`,
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
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/simulations" className="hover:underline">সিমুলেশন</Link>
          <span>&rsaquo;</span>
          <span>{SUBJECT_LABELS[sim.config.subject]}</span>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--suttro-text)' }}>{sim.config.title.bn}</span>
        </nav>

        {/* Player */}
        <div className="rounded-[14px] overflow-hidden shadow-lg mb-8">
          <SimComponent />
        </div>

        {/* Below player info */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="sm:col-span-2">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
              {sim.config.title.bn}
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--suttro-muted)' }}>
              {sim.config.title.en} · NCTB ক্লাস {sim.config.nctb.class}, অধ্যায় {sim.config.nctb.chapter}
            </p>

            {/* Formulas */}
            {sim.config.formulas.length > 0 && (
              <div
                className="rounded-[14px] border p-5 mb-6"
                style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
                  সম্পর্কিত সূত্র
                </h3>
                {sim.config.formulas.map((f, i) => (
                  <div key={i} className="flex items-baseline gap-3 mb-2 last:mb-0">
                    <span
                      className="font-mono text-sm px-2 py-1 rounded"
                      style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-deep)' }}
                    >
                      {f.expression}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
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
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--suttro-deep)' }}>
                ভ্যারিয়েবল
              </h3>
              <div className="space-y-2">
                {sim.config.variables.map((v) => (
                  <div key={v.id} className="flex justify-between text-sm">
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
          <div>
            {/* Share/Download */}
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

            {/* NCTB ref */}
            <div
              className="rounded-[14px] p-5"
              style={{ background: 'var(--suttro-sky)' }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--suttro-deep)' }}>
                NCTB রেফারেন্স
              </h3>
              <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                ক্লাস {sim.config.nctb.class} · {SUBJECT_LABELS[sim.config.subject]} · অধ্যায় {sim.config.nctb.chapter}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
