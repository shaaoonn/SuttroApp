// ─────────────────────────────────────────────
// Simulation Registry — Central list of all simulations
// Add new simulations here after creating them
// ─────────────────────────────────────────────

import type { SimulationConfig } from './_template/config';

export interface SimRegistryEntry {
  slug: string;
  config: SimulationConfig;
  component: () => Promise<{ default: React.ComponentType }>;
}

// ⬇️ ADD NEW SIMULATIONS HERE
export const simulations: SimRegistryEntry[] = [
  // Example:
  // {
  //   slug: 'ohms-law',
  //   config: ohmsLawConfig,
  //   component: () => import('./physics/ohms-law/OhmsLawSim'),
  // },
];

export function getSimulation(slug: string): SimRegistryEntry | undefined {
  return simulations.find((s) => s.slug === slug);
}
