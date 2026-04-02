// ─────────────────────────────────────────────
// Simulation Config — EDIT THIS for each simulation
// Copy _template/ → rename → customize this file
// ─────────────────────────────────────────────

export interface VariableConfig {
  id: string;
  label: { bn: string; en: string };
  unit: string;
  min: number;
  max: number;
  default: number;
  step: number;
}

export interface FormulaConfig {
  expression: string;
  description: { bn: string; en: string };
}

export interface SimulationConfig {
  id: string;
  slug: string;
  title: { bn: string; en: string };
  subject: 'physics' | 'chemistry' | 'biology';
  nctb: { class: 9 | 10; chapter: number; section: string };
  variables: VariableConfig[];
  formulas: FormulaConfig[];
  defaultZoom: number;
  canvasSize: { width: number; height: number };
}

// ⬇️ EDIT THIS — replace with your simulation's config
export const simConfig: SimulationConfig = {
  id: 'template',
  slug: 'template',
  title: { bn: 'টেমপ্লেট সিমুলেশন', en: 'Template Simulation' },
  subject: 'physics',
  nctb: { class: 9, chapter: 0, section: '0.0' },
  variables: [
    // Example variable — replace with your own:
    // {
    //   id: 'voltage',
    //   label: { bn: 'ভোল্টেজ', en: 'Voltage' },
    //   unit: 'V',
    //   min: 0, max: 24, default: 5, step: 0.5,
    // },
  ],
  formulas: [
    // Example formula — replace with your own:
    // {
    //   expression: 'V = IR',
    //   description: { bn: 'ভোল্টেজ = কারেন্ট × রোধ', en: 'Voltage = Current × Resistance' },
    // },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
