// ─────────────────────────────────────────────
// Simulation Registry - Central list of all simulations
// Add new simulations here after creating them
// ─────────────────────────────────────────────

import type { SimulationConfig } from './_template/config';
import { motionConfig } from './physics/motion/config';
import { inertiaConfig } from './physics/inertia/config';
import { forceAccelerationConfig } from './physics/force-acceleration/config';

export interface SimRegistryEntry {
  slug: string;
  config: SimulationConfig;
  component: () => Promise<{ default: React.ComponentType }>;
}

export const simulations: SimRegistryEntry[] = [
  {
    slug: 'motion',
    config: motionConfig,
    component: () => import('./physics/motion/MotionSim'),
  },
  {
    slug: 'inertia',
    config: inertiaConfig,
    component: () => import('./physics/inertia/InertiaSim'),
  },
  {
    slug: 'force-acceleration',
    config: forceAccelerationConfig,
    component: () => import('./physics/force-acceleration/ForceAccelerationSim'),
  },
];

export function getSimulation(slug: string): SimRegistryEntry | undefined {
  return simulations.find((s) => s.slug === slug);
}
