import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// বল ও ত্বরণ — Newton's 2nd Law + Momentum + Impulse + Weight
// SSC Physics Chapter 3, Sections 3.2, 3.3, 3.4 (২য় সূত্র)
// 5 scenarios: F=ma cart push, p=mv momentum, F=Δp/Δt impulse,
//              W=mg weight on planets, force types overview
// ─────────────────────────────────────────────

export const forceAccelerationConfig: SimulationConfig = {
  id: 'force-acceleration',
  slug: 'force-acceleration',
  title: { bn: 'বল ও ত্বরণ', en: 'Force & Acceleration (Newton 2nd Law)' },
  subject: 'physics',
  nctb: { class: 9, chapter: 3, section: '3.4' },
  variables: [
    {
      id: 'F',
      label: { bn: 'প্রযুক্ত বল', en: 'Applied force' },
      unit: 'N',
      min: -500,
      max: 500,
      default: 100,
      step: 5,
    },
    {
      id: 'm',
      label: { bn: 'ভর', en: 'Mass' },
      unit: 'kg',
      min: 0.1,
      max: 200,
      default: 50,
      step: 0.5,
    },
    {
      id: 'mu',
      label: { bn: 'ঘর্ষণাঙ্ক', en: 'Friction coefficient' },
      unit: '',
      min: 0,
      max: 1,
      default: 0.2,
      step: 0.05,
    },
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
      id: 't',
      label: { bn: 'সময়', en: 'Time' },
      unit: 's',
      min: 0.01,
      max: 10,
      default: 0.5,
      step: 0.1,
    },
    {
      id: 'g',
      label: { bn: 'মহাকর্ষজ ত্বরণ', en: 'Gravitational acceleration' },
      unit: 'm/s²',
      min: 1.0,
      max: 25,
      default: 9.81,
      step: 0.1,
    },
  ],
  formulas: [
    {
      expression: 'F = ma',
      description: { bn: 'নিউটনের ২য় সূত্র', en: 'Newton 2nd Law' },
    },
    {
      expression: 'p = mv',
      description: { bn: 'ভরবেগ', en: 'Momentum' },
    },
    {
      expression: 'F = (mv − mu) / t',
      description: { bn: 'ভরবেগের পরিবর্তনের হার', en: 'Rate of momentum change' },
    },
    {
      expression: 'Ft = mv − mu',
      description: { bn: 'আবেগ-ভরবেগ উপপাদ্য', en: 'Impulse-momentum theorem' },
    },
    {
      expression: 'W = mg',
      description: { bn: 'ওজন', en: 'Weight' },
    },
    {
      expression: 'F_net = F − μmg',
      description: { bn: 'ঘর্ষণসহ মোট বল', en: 'Net force with friction' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 1200, height: 600 },
};
