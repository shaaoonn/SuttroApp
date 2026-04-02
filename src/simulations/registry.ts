// ─────────────────────────────────────────────
// Simulation Registry — Central list of all simulations
// Add new simulations here after creating them
// ─────────────────────────────────────────────

import type { SimulationConfig } from './_template/config';
import { ohmsLawConfig } from './physics/ohms-law/config';

export interface SimRegistryEntry {
  slug: string;
  config: SimulationConfig;
  component: () => Promise<{ default: React.ComponentType }>;
}

export const simulations: SimRegistryEntry[] = [
  {
    slug: 'ohms-law',
    config: ohmsLawConfig,
    component: () => import('./physics/ohms-law/OhmsLawSim'),
  },
];

export function getSimulation(slug: string): SimRegistryEntry | undefined {
  return simulations.find((s) => s.slug === slug);
}
