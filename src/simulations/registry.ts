// ─────────────────────────────────────────────
// Simulation Registry - Central list of all simulations
// Add new simulations here after creating them
// ─────────────────────────────────────────────

import type { SimulationConfig } from './_template/config';
import { motionConfig } from './physics/motion/config';

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
];

export function getSimulation(slug: string): SimRegistryEntry | undefined {
  return simulations.find((s) => s.slug === slug);
}
