'use client';

import dynamic from 'next/dynamic';

// Lazy-load the simulation to avoid SSR issues with canvas
const OhmsLawSim = dynamic(
  () => import('@/simulations/physics/ohms-law/OhmsLawSim'),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-[10px] flex items-center justify-center"
        style={{ aspectRatio: '16/9', background: 'var(--player-bg)' }}
      >
        <span className="text-sm" style={{ color: 'var(--player-muted)' }}>
          সিমুলেশন লোড হচ্ছে...
        </span>
      </div>
    ),
  },
);

export default function HeroSimulation() {
  return (
    <div className="rounded-[14px] overflow-hidden shadow-2xl">
      <OhmsLawSim />
    </div>
  );
}
