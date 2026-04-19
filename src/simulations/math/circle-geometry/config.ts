import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Circle - Area & Circumference
// NCTB Class 9, Chapter 7: পরিমিতি
// ─────────────────────────────────────────────

export const circleGeometryConfig: SimulationConfig = {
  id: 'circle-geometry',
  slug: 'circle-geometry',
  title: { bn: 'বৃত্তের ক্ষেত্রফল ও পরিধি', en: 'Circle - Area & Circumference' },
  subject: 'math',
  nctb: { class: 9, chapter: 7, section: '7.4' },
  variables: [
    {
      id: 'radius',
      label: { bn: 'ব্যাসার্ধ (r)', en: 'Radius (r)' },
      unit: '',
      min: 1,
      max: 10,
      default: 5,
      step: 0.5,
    },
  ],
  formulas: [
    {
      expression: 'ক্ষেত্রফল = πr²',
      description: { bn: 'বৃত্তের ক্ষেত্রফল নির্ণয়ের সূত্র', en: 'Area of a circle' },
    },
    {
      expression: 'পরিধি = 2πr',
      description: { bn: 'বৃত্তের পরিধি নির্ণয়ের সূত্র', en: 'Circumference of a circle' },
    },
    {
      expression: 'π ≈ 3.14159',
      description: { bn: 'পাই-এর মান (পরিধি ÷ ব্যাস)', en: 'Pi - ratio of circumference to diameter' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
