import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// জড়তা (Inertia) — Newton's 1st Law
// SSC Physics Chapter 3, Section 3.1
// 4 scenarios: bus brake, bus accelerate, tablecloth, free object
// ─────────────────────────────────────────────

export const inertiaConfig: SimulationConfig = {
  id: 'inertia',
  slug: 'inertia',
  title: { bn: 'জড়তা', en: 'Inertia (Newton\'s 1st Law)' },
  subject: 'physics',
  nctb: { class: 9, chapter: 3, section: '3.1' },
  variables: [
    {
      id: 'm',
      label: { bn: 'বস্তুর ভর', en: 'Mass' },
      unit: 'kg',
      min: 1,
      max: 200,
      default: 50,
      step: 1,
    },
    {
      id: 'u',
      label: { bn: 'আদিবেগ', en: 'Initial velocity' },
      unit: 'm/s',
      min: 0,
      max: 30,
      default: 16,
      step: 0.5,
    },
    {
      id: 'a',
      label: { bn: 'ত্বরণ/মন্দন', en: 'Acceleration/deceleration' },
      unit: 'm/s²',
      min: -15,
      max: 15,
      default: -8,
      step: 0.5,
    },
    {
      id: 'mu',
      label: { bn: 'ঘর্ষণাঙ্ক', en: 'Friction coefficient' },
      unit: '',
      min: 0,
      max: 1,
      default: 0.3,
      step: 0.05,
    },
    {
      id: 't',
      label: { bn: 'সময়', en: 'Time' },
      unit: 's',
      min: 0,
      max: 10,
      default: 3,
      step: 0.1,
    },
  ],
  formulas: [
    {
      expression: 'F_net = 0  ⟹  v = const',
      description: { bn: 'নিউটনের ১ম সূত্র', en: 'Newton\'s 1st Law' },
    },
    {
      expression: 'জড়তা ∝ ভর',
      description: { bn: 'ভর যত বেশি জড়তা তত বেশি', en: 'Inertia ∝ mass' },
    },
    {
      expression: 'f = μmg',
      description: { bn: 'ঘর্ষণ বল', en: 'Friction force' },
    },
    {
      expression: 'v = u − at',
      description: { bn: 'বাস থামতে সময়', en: 'Bus stopping time' },
    },
    {
      expression: 's = ut − ½at²',
      description: { bn: 'থামার আগে দূরত্ব', en: 'Stopping distance' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 1200, height: 600 },
};
