import { notFound } from 'next/navigation';
import { getSimulation, simulations } from '@/simulations/registry';
import OhmsLawSim from '@/simulations/physics/ohms-law/OhmsLawSim';

interface SimPageProps {
  params: Promise<{ slug: string }>;
}

// Static generation for known simulations
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

// Component map — direct imports for each simulation
const SIMULATION_COMPONENTS: Record<string, React.ComponentType> = {
  'ohms-law': OhmsLawSim,
};

export default async function SimPage({ params }: SimPageProps) {
  const { slug } = await params;
  const sim = getSimulation(slug);

  if (!sim) notFound();

  const SimComponent = SIMULATION_COMPONENTS[slug];
  if (!SimComponent) notFound();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-suttro-surface p-4">
      <div className="w-full max-w-5xl">
        <SimComponent />
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold text-suttro-deep">
          {sim.config.title.bn}
        </h2>
        <p className="text-sm text-suttro-muted mt-1">
          NCTB ক্লাস {sim.config.nctb.class} · অধ্যায় {sim.config.nctb.chapter}
        </p>
      </div>
    </div>
  );
}
