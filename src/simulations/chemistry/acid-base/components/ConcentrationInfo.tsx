'use client';

import type { AcidBaseState } from '../useSimulation';

// ─────────────────────────────────────────────
// Concentration Info - Shows [H⁺] and [OH⁻]
// with scientific notation
// ─────────────────────────────────────────────

interface ConcentrationInfoProps {
  x: number;
  y: number;
  state: AcidBaseState;
}

function formatScientific(n: number): string {
  if (n === 0) return '0';
  const exp = Math.floor(Math.log10(n));
  const mantissa = n / Math.pow(10, exp);
  if (Math.abs(mantissa - 1) < 0.01) return `10^${exp}`;
  return `${mantissa.toFixed(1)} x 10^${exp}`;
}

export default function ConcentrationInfo({
  x,
  y,
  state,
}: ConcentrationInfoProps) {
  const lineH = 22;

  return (
    <g>
      {/* Box background */}
      <rect
        x={x}
        y={y}
        width={200}
        height={100}
        rx={8}
        fill="rgba(0,0,0,0.3)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />

      {/* Title */}
      <text
        x={x + 12} y={y + 18}
        fill="rgba(255,255,255,0.5)"
        fontSize={10}
        fontFamily="var(--font-hind-siliguri)"
        fontWeight="bold"
      >
        ঘনমাত্রা তথ্য
      </text>

      {/* [H+] */}
      <text
        x={x + 12} y={y + 18 + lineH}
        fill="rgb(239, 68, 68)"
        fontSize={11}
        fontFamily="monospace"
      >
        [H⁺] = {formatScientific(state.hConcentration)} M
      </text>

      {/* [OH-] */}
      <text
        x={x + 12} y={y + 18 + lineH * 2}
        fill="rgb(59, 130, 246)"
        fontSize={11}
        fontFamily="monospace"
      >
        [OH⁻] = {formatScientific(state.ohConcentration)} M
      </text>

      {/* pOH */}
      <text
        x={x + 12} y={y + 18 + lineH * 3}
        fill="rgba(255,255,255,0.45)"
        fontSize={11}
        fontFamily="monospace"
      >
        pOH = {state.pOH.toFixed(1)}
      </text>
    </g>
  );
}
