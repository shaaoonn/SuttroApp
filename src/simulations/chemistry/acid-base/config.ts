import type { SimulationConfig } from '../../_template/config';

export const acidBaseConfig: SimulationConfig = {
  id: 'acid-base',
  slug: 'acid-base',
  title: { bn: 'অ্যাসিড-ক্ষার ও pH স্কেল', en: 'Acid-Base & pH Scale' },
  subject: 'chemistry',
  nctb: { class: 9, chapter: 5, section: '5.3' },
  variables: [
    {
      id: 'acidVolume',
      label: { bn: 'অ্যাসিড পরিমাণ', en: 'Acid Volume' },
      unit: 'mL',
      min: 0,
      max: 100,
      default: 0,
      step: 5,
    },
    {
      id: 'baseVolume',
      label: { bn: 'ক্ষার পরিমাণ', en: 'Base Volume' },
      unit: 'mL',
      min: 0,
      max: 100,
      default: 0,
      step: 5,
    },
    {
      id: 'acidStrength',
      label: { bn: 'অ্যাসিড ঘনমাত্রা', en: 'Acid Concentration' },
      unit: 'M',
      min: 0.1,
      max: 2.0,
      default: 1.0,
      step: 0.1,
    },
    {
      id: 'baseStrength',
      label: { bn: 'ক্ষার ঘনমাত্রা', en: 'Base Concentration' },
      unit: 'M',
      min: 0.1,
      max: 2.0,
      default: 1.0,
      step: 0.1,
    },
  ],
  formulas: [
    {
      expression: 'pH = -log[H⁺]',
      description: { bn: 'pH নির্ণয়ের সূত্র', en: 'pH calculation formula' },
    },
    {
      expression: 'pH + pOH = 14',
      description: { bn: 'pH ও pOH-এর সম্পর্ক', en: 'pH and pOH relationship' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};

// Common substances for reference
export const SUBSTANCE_EXAMPLES = [
  { name: { bn: 'ব্যাটারি অ্যাসিড', en: 'Battery Acid' }, pH: 1.0 },
  { name: { bn: 'লেবুর রস', en: 'Lemon Juice' }, pH: 2.0 },
  { name: { bn: 'ভিনেগার', en: 'Vinegar' }, pH: 3.0 },
  { name: { bn: 'কোমল পানীয়', en: 'Soft Drink' }, pH: 4.0 },
  { name: { bn: 'বৃষ্টির পানি', en: 'Rain Water' }, pH: 5.6 },
  { name: { bn: 'দুধ', en: 'Milk' }, pH: 6.5 },
  { name: { bn: 'বিশুদ্ধ পানি', en: 'Pure Water' }, pH: 7.0 },
  { name: { bn: 'রক্ত', en: 'Blood' }, pH: 7.4 },
  { name: { bn: 'সমুদ্রের পানি', en: 'Sea Water' }, pH: 8.1 },
  { name: { bn: 'বেকিং সোডা', en: 'Baking Soda' }, pH: 9.0 },
  { name: { bn: 'সাবান', en: 'Soap' }, pH: 10.0 },
  { name: { bn: 'ব্লিচ', en: 'Bleach' }, pH: 12.5 },
  { name: { bn: 'NaOH দ্রবণ', en: 'NaOH Solution' }, pH: 14.0 },
];
