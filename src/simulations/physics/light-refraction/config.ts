import type { SimulationConfig } from '../../_template/config';

export const lightRefractionConfig: SimulationConfig = {
  id: 'light-refraction',
  slug: 'light-refraction',
  title: { bn: 'আলোর প্রতিসরণ', en: 'Light Refraction' },
  subject: 'physics',
  nctb: { class: 9, chapter: 10, section: '10.3' },
  variables: [
    {
      id: 'incidenceAngle',
      label: { bn: 'আপতন কোণ', en: 'Angle of Incidence' },
      unit: '°',
      min: 0,
      max: 89,
      default: 30,
      step: 1,
    },
    {
      id: 'n1',
      label: { bn: 'মাধ্যম ১ প্রতিসরাঙ্ক', en: 'Refractive Index (n₁)' },
      unit: '',
      min: 1.0,
      max: 2.5,
      default: 1.5,
      step: 0.01,
    },
    {
      id: 'n2',
      label: { bn: 'মাধ্যম ২ প্রতিসরাঙ্ক', en: 'Refractive Index (n₂)' },
      unit: '',
      min: 1.0,
      max: 2.5,
      default: 1.0,
      step: 0.01,
    },
  ],
  formulas: [
    {
      expression: 'n₁ sin θ₁ = n₂ sin θ₂',
      description: { bn: 'স্নেলের সূত্র', en: "Snell's Law" },
    },
    {
      expression: 'θc = arcsin(n₂/n₁)',
      description: { bn: 'ক্রান্তি কোণ (যখন n₁ > n₂)', en: 'Critical Angle (when n₁ > n₂)' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};

// Medium presets for quick selection
export const MEDIUM_PRESETS = [
  { name: { bn: 'বায়ু', en: 'Air' }, n: 1.00 },
  { name: { bn: 'পানি', en: 'Water' }, n: 1.33 },
  { name: { bn: 'কাচ', en: 'Glass' }, n: 1.50 },
  { name: { bn: 'হীরা', en: 'Diamond' }, n: 2.42 },
];
