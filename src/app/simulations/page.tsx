import type { Metadata } from 'next';
import { simulations } from '@/simulations/registry';
import SimulationCard from '@/components/ui/SimulationCard';

export const metadata: Metadata = {
  title: 'সিমুলেশন — সূত্র | suttro.app',
  description: 'NCTB ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান।',
};

const SUBJECT_FILTERS = [
  { id: 'all', label: 'সব', color: '' },
  { id: 'physics', label: 'পদার্থবিজ্ঞান', color: 'bg-physics' },
  { id: 'chemistry', label: 'রসায়ন', color: 'bg-chemistry' },
  { id: 'biology', label: 'জীববিজ্ঞান', color: 'bg-biology' },
];

export default function SimulationsPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--suttro-deep)' }}
          >
            সিমুলেশন
          </h1>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            NCTB ক্লাস ৯-১০ পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞান সিমুলেশন
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SUBJECT_FILTERS.map((filter) => (
            <button
              key={filter.id}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium suttro-transition ${
                filter.id === 'all'
                  ? 'text-white'
                  : 'hover:opacity-80'
              }`}
              style={
                filter.id === 'all'
                  ? { background: 'var(--suttro-deep)', color: 'white' }
                  : { background: 'var(--suttro-white)', color: 'var(--suttro-text)', border: '1px solid var(--suttro-border)' }
              }
            >
              {filter.color && (
                <span className={`inline-block w-2 h-2 rounded-full ${filter.color} mr-2`} />
              )}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {simulations.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <SimulationCard key={sim.slug} config={sim.config} slug={sim.slug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: 'var(--suttro-muted)' }}>
              শীঘ্রই আসছে...
            </p>
          </div>
        )}

        {/* Coming soon */}
        <div
          className="mt-12 rounded-[14px] border p-8 text-center"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <p className="text-base font-medium mb-1" style={{ color: 'var(--suttro-deep)' }}>
            আরও সিমুলেশন আসছে
          </p>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            আলোর প্রতিফলন, নিউটনের সূত্র, তরঙ্গ, সার্কিট বিল্ডার — সব তৈরি হচ্ছে।
          </p>
        </div>
      </div>
    </div>
  );
}
