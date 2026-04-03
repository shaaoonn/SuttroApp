import type { SimulationConfig } from '../../_template/config';

export const lightReflectionConfig: SimulationConfig = {
  id: 'light-reflection',
  slug: 'light-reflection',
  title: { bn: 'আলোর প্রতিফলন', en: 'Light Reflection' },
  subject: 'physics',
  nctb: { class: 9, chapter: 10, section: '10.2' },
  variables: [
    {
      id: 'incidenceAngle',
      label: { bn: 'আপতন কোণ', en: 'Angle of Incidence' },
      unit: '°',
      min: 5,
      max: 80,
      default: 45,
      step: 1,
    },
    {
      id: 'mirrorLength',
      label: { bn: 'দর্পণের দৈর্ঘ্য', en: 'Mirror Length' },
      unit: 'cm',
      min: 100,
      max: 300,
      default: 200,
      step: 10,
    },
  ],
  formulas: [
    {
      expression: 'θᵢ = θᵣ',
      description: { bn: 'আপতন কোণ = প্রতিফলন কোণ', en: 'Angle of Incidence = Angle of Reflection' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
