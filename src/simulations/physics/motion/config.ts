import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// গতি (Motion) - SSC Physics Chapter 2
// Covers all 4 kinematic equations + free fall
// ─────────────────────────────────────────────

export const motionConfig: SimulationConfig = {
  id: 'motion',
  slug: 'motion',
  title: { bn: 'গতি', en: 'Motion' },
  subject: 'physics',
  nctb: { class: 9, chapter: 2, section: '2.0' },
  variables: [
    {
      id: 'u',
      label: { bn: 'আদিবেগ', en: 'Initial velocity' },
      unit: 'm/s',
      min: -50,
      max: 50,
      default: 0,
      step: 0.5,
    },
    {
      id: 'v',
      label: { bn: 'শেষবেগ', en: 'Final velocity' },
      unit: 'm/s',
      min: -50,
      max: 50,
      default: 20,
      step: 0.5,
    },
    {
      id: 'a',
      label: { bn: 'ত্বরণ', en: 'Acceleration' },
      unit: 'm/s²',
      min: -20,
      max: 20,
      default: 2,
      step: 0.1,
    },
    {
      id: 's',
      label: { bn: 'সরণ', en: 'Displacement' },
      unit: 'm',
      min: -500,
      max: 500,
      default: 100,
      step: 1,
    },
    {
      id: 't',
      label: { bn: 'সময়', en: 'Time' },
      unit: 's',
      min: 0,
      max: 30,
      default: 10,
      step: 0.1,
    },
  ],
  formulas: [
    {
      expression: 'v = u + at',
      description: {
        bn: 'গতির ১ম সূত্র — শেষবেগ',
        en: 'First equation — final velocity',
      },
    },
    {
      expression: 's = ut + ½at²',
      description: {
        bn: 'গতির ২য় সূত্র — সরণ',
        en: 'Second equation — displacement',
      },
    },
    {
      expression: 'v² = u² + 2as',
      description: {
        bn: 'গতির ৩য় সূত্র — সময়হীন সম্পর্ক',
        en: 'Third equation — time-independent',
      },
    },
    {
      expression: 's = (u + v)t / 2',
      description: {
        bn: 'গড়বেগ সূত্র — সরণ',
        en: 'Average velocity — displacement',
      },
    },
    {
      expression: 'h = ½gt²',
      description: {
        bn: 'মুক্ত পতন (g = 9.81 m/s²)',
        en: 'Free fall (g = 9.81 m/s²)',
      },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 1200, height: 600 },
};
