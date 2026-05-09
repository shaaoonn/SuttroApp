'use client';

import { inertiaConfig } from '../config';
import type { InertiaVars, ScenarioKey, VariableKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  values: InertiaVars;
  onChange: (key: VariableKey, value: number) => void;
}

/**
 * Embedded sliders panel inside the canvas (top-right). Shows only the
 * variables relevant to the current scenario. Mirrors Master Sab style
 * but only the relevant sliders (not all 7 like Master Sab does).
 */
export default function InertiaSliders({ scenario, values, onChange }: Props) {
  // Per-scenario active variables
  const activeVars: VariableKey[] =
    scenario === 'busBrake'
      ? ['m', 'u', 'a', 'mu']
      : scenario === 'busStart'
        ? ['m', 'a', 'mu']
        : scenario === 'tablecloth'
          ? ['m', 'u', 'mu']
          : /* spaceObject */ ['m', 'u'];

  return (
    <div
      className="absolute top-2 right-2 z-10 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
        padding: '6px 8px',
      }}
    >
      <div className="flex items-end gap-1.5">
        {activeVars.map((key) => {
          const cfg = inertiaConfig.variables.find((v) => v.id === key);
          if (!cfg) return null;
          const val = values[key];
          const pct = ((val - cfg.min) / (cfg.max - cfg.min)) * 100;
          return (
            <div
              key={key}
              className="flex flex-col items-center"
              style={{ width: '34px' }}
            >
              <div
                className="relative cursor-pointer"
                style={{ width: '20px', height: '70px' }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const newPct = 100 - (y / rect.height) * 100;
                  const newVal = cfg.min + (newPct / 100) * (cfg.max - cfg.min);
                  const stepped = Math.round(newVal / cfg.step) * cfg.step;
                  onChange(key, Math.max(cfg.min, Math.min(cfg.max, stepped)));
                }}
              >
                {/* Track */}
                <div
                  className="absolute"
                  style={{
                    left: '8px',
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: '#CBD5E1',
                    borderRadius: '2px',
                  }}
                />
                {/* Fill */}
                <div
                  className="absolute"
                  style={{
                    left: '8px',
                    bottom: 0,
                    width: '4px',
                    height: `${pct}%`,
                    background: COLORS[key],
                    borderRadius: '2px',
                  }}
                />
                {/* Thumb */}
                <div
                  className="absolute rounded-full"
                  style={{
                    left: '4px',
                    bottom: `calc(${pct}% - 6px)`,
                    width: '12px',
                    height: '12px',
                    background: COLORS[key],
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </div>
              <input
                type="number"
                value={val.toFixed(cfg.step < 1 ? 2 : 0)}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) onChange(key, Math.max(cfg.min, Math.min(cfg.max, v)));
                }}
                className="w-full text-center font-mono mt-1 rounded-md"
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  color: '#1E293B',
                  fontSize: '9px',
                  padding: '1px 2px',
                  height: '18px',
                }}
                step={cfg.step}
              />
              <div
                className="font-bold mt-0.5"
                style={{ fontSize: '10px', color: COLORS[key] }}
              >
                {key === 'mu' ? 'μ' : key}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COLORS: Record<VariableKey, string> = {
  m: '#16A34A',
  u: '#3B82F6',
  a: '#EA580C',
  mu: '#8B5CF6',
  t: '#BE185D',
};
