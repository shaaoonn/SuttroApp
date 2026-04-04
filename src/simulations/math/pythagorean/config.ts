import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Pythagorean Theorem — পিথাগোরাসের উপপাদ্য
// NCTB Class 9, Chapter 7: পরিমিতি
// a² + b² = c² (সমকোণী ত্রিভুজ)
// ─────────────────────────────────────────────

export const pythagoreanConfig: SimulationConfig = {
  id: 'pythagorean',
  slug: 'pythagorean',
  title: { bn: 'পিথাগোরাসের উপপাদ্য', en: 'Pythagorean Theorem' },
  subject: 'math',
  nctb: { class: 9, chapter: 7, section: '7.2' },
  variables: [
    {
      id: 'sideA',
      label: { bn: 'বাহু a (ভূমি)', en: 'Side a (Base)' },
      unit: '',
      min: 1,
      max: 12,
      default: 3,
      step: 0.5,
    },
    {
      id: 'sideB',
      label: { bn: 'বাহু b (লম্ব)', en: 'Side b (Height)' },
      unit: '',
      min: 1,
      max: 12,
      default: 4,
      step: 0.5,
    },
  ],
  formulas: [
    {
      expression: 'c² = a² + b²',
      description: { bn: 'অতিভুজের বর্গ = ভূমির বর্গ + লম্বের বর্গ', en: 'Hypotenuse² = Base² + Height²' },
    },
    {
      expression: 'c = √(a² + b²)',
      description: { bn: 'অতিভুজের দৈর্ঘ্য নির্ণয়', en: 'Finding hypotenuse length' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
