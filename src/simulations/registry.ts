// ─────────────────────────────────────────────
// Simulation Registry — Central list of all simulations
// Add new simulations here after creating them
// ─────────────────────────────────────────────

import type { SimulationConfig } from './_template/config';
import { ohmsLawConfig } from './physics/ohms-law/config';
import { lightReflectionConfig } from './physics/light-reflection/config';
import { lightRefractionConfig } from './physics/light-refraction/config';

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
  {
    slug: 'light-reflection',
    config: lightReflectionConfig,
    component: () => import('./physics/light-reflection/LightReflectionSim'),
  },
  {
    slug: 'light-refraction',
    config: lightRefractionConfig,
    component: () => import('./physics/light-refraction/LightRefractionSim'),
  },
];

export function getSimulation(slug: string): SimRegistryEntry | undefined {
  return simulations.find((s) => s.slug === slug);
}
