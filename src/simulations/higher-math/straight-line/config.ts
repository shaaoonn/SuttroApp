import type { SimulationConfig } from '../../_template/config';

export const straightLineConfig: SimulationConfig = {
  id: 'straight-line',
  slug: 'straight-line',
  title: { bn: 'সরলরেখার সমীকরণ', en: 'Equation of Straight Line' },
  subject: 'higher-math',
  nctb: { class: 9, chapter: 3, section: '3.2' },
  variables: [
    { id: 'slope', label: { bn: 'ঢাল (m)', en: 'Slope (m)' }, unit: '', min: -5, max: 5, default: 1, step: 0.5 },
    { id: 'intercept', label: { bn: 'y-ছেদাংশ (c)', en: 'y-intercept (c)' }, unit: '', min: -5, max: 5, default: 0, step: 0.5 },
  ],
  formulas: [
    { expression: 'y = mx + c', description: { bn: 'ঢাল-ছেদাংশ আকার', en: 'Slope-intercept form' } },
    { expression: 'm = (y₂-y₁)/(x₂-x₁)', description: { bn: 'ঢাল নির্ণয়ের সূত্র', en: 'Slope formula' } },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
