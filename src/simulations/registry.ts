// ─────────────────────────────────────────────
// Simulation Registry — Central list of all simulations
// Add new simulations here after creating them
// ─────────────────────────────────────────────

import type { SimulationConfig } from './_template/config';
import { ohmsLawConfig } from './physics/ohms-law/config';
import { lightReflectionConfig } from './physics/light-reflection/config';
import { lightRefractionConfig } from './physics/light-refraction/config';
import { acidBaseConfig } from './chemistry/acid-base/config';
import { atomicStructureConfig } from './chemistry/atomic-structure/config';
import { cellDivisionConfig } from './biology/cell-division/config';
import { photosynthesisConfig } from './biology/photosynthesis/config';
import { pythagoreanConfig } from './math/pythagorean/config';
import { circleGeometryConfig } from './math/circle-geometry/config';
import { trigonometryConfig } from './higher-math/trigonometry/config';
import { straightLineConfig } from './higher-math/straight-line/config';
import { sentenceStructureConfig } from './english/sentence-structure/config';
import { tenseTimelineConfig } from './english/tense-timeline/config';

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
  {
    slug: 'acid-base',
    config: acidBaseConfig,
    component: () => import('./chemistry/acid-base/AcidBaseSim'),
  },
  {
    slug: 'atomic-structure',
    config: atomicStructureConfig,
    component: () => import('./chemistry/atomic-structure/AtomicStructureSim'),
  },
  {
    slug: 'cell-division',
    config: cellDivisionConfig,
    component: () => import('./biology/cell-division/CellDivisionSim'),
  },
  {
    slug: 'photosynthesis',
    config: photosynthesisConfig,
    component: () => import('./biology/photosynthesis/PhotosynthesisSim'),
  },
  {
    slug: 'pythagorean',
    config: pythagoreanConfig,
    component: () => import('./math/pythagorean/PythagoreanSim'),
  },
  {
    slug: 'circle-geometry',
    config: circleGeometryConfig,
    component: () => import('./math/circle-geometry/CircleGeometrySim'),
  },
  {
    slug: 'trigonometry',
    config: trigonometryConfig,
    component: () => import('./higher-math/trigonometry/TrigonometrySim'),
  },
  {
    slug: 'straight-line',
    config: straightLineConfig,
    component: () => import('./higher-math/straight-line/StraightLineSim'),
  },
  {
    slug: 'sentence-structure',
    config: sentenceStructureConfig,
    component: () => import('./english/sentence-structure/SentenceStructureSim'),
  },
  {
    slug: 'tense-timeline',
    config: tenseTimelineConfig,
    component: () => import('./english/tense-timeline/TenseTimelineSim'),
  },
];

export function getSimulation(slug: string): SimRegistryEntry | undefined {
  return simulations.find((s) => s.slug === slug);
}
