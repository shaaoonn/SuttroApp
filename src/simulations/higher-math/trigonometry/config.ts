import type { SimulationConfig } from '../../_template/config';

export const trigonometryConfig: SimulationConfig = {
  id: 'trigonometry',
  slug: 'trigonometry',
  title: { bn: 'ত্রিকোণমিতিক অনুপাত', en: 'Trigonometric Ratios' },
  subject: 'higher-math',
  nctb: { class: 9, chapter: 9, section: '9.1' },
  variables: [
    {
      id: 'angle',
      label: { bn: 'কোণ θ', en: 'Angle θ' },
      unit: '°',
      min: 0,
      max: 360,
      default: 45,
      step: 1,
    },
  ],
  formulas: [
    { expression: 'sin θ = লম্ব / অতিভুজ', description: { bn: 'সাইন অনুপাত', en: 'Sine ratio' } },
    { expression: 'cos θ = ভূমি / অতিভুজ', description: { bn: 'কোসাইন অনুপাত', en: 'Cosine ratio' } },
    { expression: 'tan θ = লম্ব / ভূমি', description: { bn: 'ট্যানজেন্ট অনুপাত', en: 'Tangent ratio' } },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
