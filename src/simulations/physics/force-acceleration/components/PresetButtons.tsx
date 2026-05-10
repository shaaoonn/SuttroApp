'use client';

import { SCENARIO_PRESETS } from '../physics';
import type { ForceVars, PlanetKey, ScenarioKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  onApply: (values: ForceVars) => void;
  onPlanetChange?: (p: PlanetKey) => void;
}

export default function PresetButtons({ scenario, onApply, onPlanetChange }: Props) {
  const presets = SCENARIO_PRESETS[scenario];
  if (!presets || presets.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((p, i) => (
        <button
          key={i}
          onClick={() => {
            onApply(p.values as ForceVars);
            if (p.planet && onPlanetChange) onPlanetChange(p.planet);
          }}
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
