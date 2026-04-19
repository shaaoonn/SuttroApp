'use client';

import type { FormulaConfig } from '@/simulations/_template/config';

// ─────────────────────────────────────────────
// FormulaDisplay - Shows active formulas (top-left)
// Fixed overlay (Layer 3)
// ─────────────────────────────────────────────

interface FormulaDisplayProps {
  formulas: FormulaConfig[];
}

export default function FormulaDisplay({ formulas }: FormulaDisplayProps) {
  if (formulas.length === 0) return null;

  return (
    <div className="readout-panel top-3 left-3 p-3">
      {formulas.map((f, i) => (
        <div key={i} className="mb-1 last:mb-0">
          <div
            className="font-mono text-sm"
            style={{ color: 'var(--canvas-label)' }}
          >
            {f.expression}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: 'var(--player-muted)' }}
          >
            {f.description.bn}
          </div>
        </div>
      ))}
    </div>
  );
}
