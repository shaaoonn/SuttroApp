import type { SimulationConfig } from '../../_template/config';

export const ohmsLawConfig: SimulationConfig = {
  id: 'ohms-law',
  slug: 'ohms-law',
  title: { bn: 'ওহমের সূত্র', en: "Ohm's Law" },
  subject: 'physics',
  nctb: { class: 9, chapter: 11, section: '11.1' },
  variables: [
    {
      id: 'voltage',
      label: { bn: 'ভোল্টেজ', en: 'Voltage' },
      unit: 'V',
      min: 0,
      max: 24,
      default: 6,
      step: 0.5,
    },
    {
      id: 'resistance',
      label: { bn: 'রোধ', en: 'Resistance' },
      unit: 'Ω',
      min: 1,
      max: 100,
      default: 10,
      step: 1,
    },
  ],
  formulas: [
    {
      expression: 'V = IR',
      description: {
        bn: 'ভোল্টেজ = কারেন্ট × রোধ',
        en: 'Voltage = Current × Resistance',
      },
    },
    {
      expression: 'P = VI',
      description: {
        bn: 'পাওয়ার = ভোল্টেজ × কারেন্ট',
        en: 'Power = Voltage × Current',
      },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 900, height: 600 },
};
