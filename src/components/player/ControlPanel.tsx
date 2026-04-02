'use client';

import type { VariableConfig } from '@/simulations/_template/config';

// ─────────────────────────────────────────────
// ControlPanel — Floating variable sliders (top-right)
// Fixed overlay (Layer 3) — stays in place during pan/zoom
// Slot-based: fill with any variables from config
// ─────────────────────────────────────────────

interface ControlPanelProps {
  /** Variable configs from simulation config */
  variables: VariableConfig[];
  /** Current variable values */
  values: Record<string, number>;
  /** Callback when a variable changes */
  onChange: (id: string, value: number) => void;
  /** Reset all variables to defaults */
  onReset: () => void;
}

export default function ControlPanel({
  variables,
  values,
  onChange,
  onReset,
}: ControlPanelProps) {
  if (variables.length === 0) return null;

  return (
    <div className="control-panel top-3 right-3 w-64 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--player-muted)' }}
        >
          নিয়ন্ত্রণ
        </span>
        <button
          onClick={onReset}
          className="text-xs px-2 py-1 rounded hover:bg-white/10 suttro-transition"
          style={{ color: 'var(--player-muted)' }}
        >
          রিসেট
        </button>
      </div>

      {/* Variable sliders */}
      {variables.map((v) => {
        const value = values[v.id] ?? v.default;
        const decimals = v.step < 1 ? (v.step < 0.1 ? 2 : 1) : 0;

        return (
          <div key={v.id} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--player-text)' }}>
                {v.label.bn}
              </span>
              <span
                className="font-mono text-xs"
                style={{ color: 'var(--canvas-label)' }}
              >
                {value.toFixed(decimals)} {v.unit}
              </span>
            </div>
            <input
              type="range"
              min={v.min}
              max={v.max}
              step={v.step}
              value={value}
              onChange={(e) => onChange(v.id, parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--suttro-primary)' }}
            />
          </div>
        );
      })}
    </div>
  );
}
