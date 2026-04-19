import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Photosynthesis - সালোকসংশ্লেষণ
// NCTB Class 9, Chapter 3: জীবনীশক্তি
// Light intensity, CO₂, H₂O → Glucose + O₂
// ─────────────────────────────────────────────

export const photosynthesisConfig: SimulationConfig = {
  id: 'photosynthesis',
  slug: 'photosynthesis',
  title: { bn: 'সালোকসংশ্লেষণ', en: 'Photosynthesis' },
  subject: 'biology',
  nctb: { class: 9, chapter: 3, section: '3.1' },
  variables: [
    {
      id: 'lightIntensity',
      label: { bn: 'আলোর তীব্রতা', en: 'Light Intensity' },
      unit: '%',
      min: 0,
      max: 100,
      default: 50,
      step: 5,
    },
    {
      id: 'co2Level',
      label: { bn: 'CO₂ ঘনমাত্রা', en: 'CO₂ Concentration' },
      unit: '%',
      min: 0,
      max: 100,
      default: 50,
      step: 5,
    },
    {
      id: 'waterLevel',
      label: { bn: 'পানির পরিমাণ', en: 'Water Level' },
      unit: '%',
      min: 0,
      max: 100,
      default: 50,
      step: 5,
    },
  ],
  formulas: [
    {
      expression: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      description: { bn: 'সালোকসংশ্লেষণের সমীকরণ (সূর্যালোক + ক্লোরোফিল)', en: 'Photosynthesis equation (sunlight + chlorophyll)' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
