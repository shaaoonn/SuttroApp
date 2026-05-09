'use client';

import { SCENARIO_PRESETS } from '../physics';
import type { InertiaVars, ScenarioKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  onApply: (values: InertiaVars) => void;
}

/**
 * Preset-example buttons that pre-fill sliders with NCTB textbook /
 * SSC exam-classic scenarios. Each button shows the example label and
 * loads the question text below.
 */
export default function PresetButtons({ scenario, onApply }: Props) {
  const presets = SCENARIO_PRESETS[scenario];
  if (!presets || presets.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((p, i) => (
        <button
          key={i}
          onClick={() => onApply(p.values as InertiaVars)}
          className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
          }}
          title={p.question}
        >
          📖 {p.label}
        </button>
      ))}
    </div>
  );
}
