'use client';

import { useState, useCallback, useMemo } from 'react';
import { acidBaseConfig } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Acid-Base & pH Scale Chemistry
// pH = -log[H⁺], pH + pOH = 14
// Neutralization: HCl + NaOH → NaCl + H₂O
// ─────────────────────────────────────────────

export interface AcidBaseState {
  /** Computed pH value (0-14) */
  pH: number;
  /** pOH value */
  pOH: number;
  /** [H⁺] concentration in M */
  hConcentration: number;
  /** [OH⁻] concentration in M */
  ohConcentration: number;
  /** Total volume in mL */
  totalVolume: number;
  /** Acid moles */
  acidMoles: number;
  /** Base moles */
  baseMoles: number;
  /** Whether the solution is neutral */
  isNeutral: boolean;
  /** Nature: 'acid' | 'base' | 'neutral' */
  nature: 'acid' | 'base' | 'neutral';
  /** Liquid fill ratio (0-1) */
  fillRatio: number;
  /** Solution color based on pH */
  solutionColor: string;
  /** Litmus result */
  litmusColor: string;
}

/** Get color for a given pH value - universal indicator colors */
export function getPHColor(pH: number): string {
  if (pH <= 1)  return 'rgb(220, 38, 38)';    // deep red
  if (pH <= 2)  return 'rgb(239, 68, 68)';    // red
  if (pH <= 3)  return 'rgb(249, 115, 22)';   // orange
  if (pH <= 4)  return 'rgb(245, 158, 11)';   // amber
  if (pH <= 5)  return 'rgb(234, 179, 8)';    // yellow
  if (pH <= 6)  return 'rgb(163, 190, 40)';   // yellow-green
  if (pH <= 7.5) return 'rgb(34, 197, 94)';   // green (neutral)
  if (pH <= 8)  return 'rgb(16, 185, 129)';   // teal-green
  if (pH <= 9)  return 'rgb(6, 182, 212)';    // cyan
  if (pH <= 10) return 'rgb(59, 130, 246)';   // blue
  if (pH <= 11) return 'rgb(99, 102, 241)';   // indigo
  if (pH <= 12) return 'rgb(139, 92, 246)';   // violet
  if (pH <= 13) return 'rgb(168, 85, 247)';   // purple
  return 'rgb(147, 51, 234)';                  // deep purple
}

/** Get interpolated color for pH (smooth transitions) */
export function getPHColorSmooth(pH: number): string {
  // Define color stops
  const stops: [number, [number, number, number]][] = [
    [0,  [220, 38, 38]],
    [2,  [239, 68, 68]],
    [3,  [249, 115, 22]],
    [4,  [245, 158, 11]],
    [5,  [234, 179, 8]],
    [6,  [163, 190, 40]],
    [7,  [34, 197, 94]],
    [8,  [6, 182, 212]],
    [9,  [59, 130, 246]],
    [10, [99, 102, 241]],
    [11, [139, 92, 246]],
    [12, [168, 85, 247]],
    [14, [147, 51, 234]],
  ];

  // Clamp
  const p = Math.max(0, Math.min(14, pH));

  // Find the two stops to interpolate between
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (p >= stops[i][0] && p <= stops[i + 1][0]) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper[0] - lower[0];
  const t = range === 0 ? 0 : (p - lower[0]) / range;

  const r = Math.round(lower[1][0] + (upper[1][0] - lower[1][0]) * t);
  const g = Math.round(lower[1][1] + (upper[1][1] - lower[1][1]) * t);
  const b = Math.round(lower[1][2] + (upper[1][2] - lower[1][2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

export function useAcidBase() {
  const config = acidBaseConfig;

  const initialVars: Record<string, number> = {};
  config.variables.forEach((v: VariableConfig) => {
    initialVars[v.id] = v.default;
  });

  const [variables, setVariables] = useState<Record<string, number>>(initialVars);

  const setVariable = useCallback((id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setVariables(initialVars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract current values
  const acidVolume = variables.acidVolume ?? 0;       // mL
  const baseVolume = variables.baseVolume ?? 0;       // mL
  const acidStrength = variables.acidStrength ?? 1.0; // M
  const baseStrength = variables.baseStrength ?? 1.0; // M

  const state = useMemo<AcidBaseState>(() => {
    const totalVolume = acidVolume + baseVolume;

    // No liquid → pure water
    if (totalVolume === 0) {
      return {
        pH: 7.0,
        pOH: 7.0,
        hConcentration: 1e-7,
        ohConcentration: 1e-7,
        totalVolume: 0,
        acidMoles: 0,
        baseMoles: 0,
        isNeutral: true,
        nature: 'neutral',
        fillRatio: 0,
        solutionColor: getPHColorSmooth(7),
        litmusColor: 'rgb(34, 197, 94)',
      };
    }

    // Calculate moles: moles = volume(L) × concentration(M)
    const acidMoles = (acidVolume / 1000) * acidStrength;
    const baseMoles = (baseVolume / 1000) * baseStrength;
    const totalVolumeL = totalVolume / 1000;

    let pH: number;
    let nature: 'acid' | 'base' | 'neutral';

    const excessMoles = acidMoles - baseMoles;

    if (Math.abs(excessMoles) < 1e-10) {
      // Perfect neutralization
      pH = 7.0;
      nature = 'neutral';
    } else if (excessMoles > 0) {
      // Excess acid → [H⁺] = excess moles / total volume
      const hConc = excessMoles / totalVolumeL;
      pH = -Math.log10(hConc);
      nature = 'acid';
    } else {
      // Excess base → [OH⁻] = excess moles / total volume
      const ohConc = Math.abs(excessMoles) / totalVolumeL;
      const pOH = -Math.log10(ohConc);
      pH = 14 - pOH;
      nature = 'base';
    }

    // Clamp pH to 0-14 range
    pH = Math.max(0, Math.min(14, pH));
    const pOH = 14 - pH;
    const hConcentration = Math.pow(10, -pH);
    const ohConcentration = Math.pow(10, -pOH);
    const isNeutral = Math.abs(pH - 7) < 0.1;

    // Fill ratio: total volume / max possible volume (200 mL)
    const fillRatio = Math.min(1, totalVolume / 200);

    return {
      pH,
      pOH,
      hConcentration,
      ohConcentration,
      totalVolume,
      acidMoles,
      baseMoles,
      isNeutral,
      nature,
      fillRatio,
      solutionColor: getPHColorSmooth(pH),
      litmusColor: nature === 'acid'
        ? 'rgb(239, 68, 68)'     // red litmus stays red / blue turns red
        : nature === 'base'
          ? 'rgb(59, 130, 246)'  // red litmus turns blue / blue stays blue
          : 'rgb(34, 197, 94)',  // neutral → green
    };
  }, [acidVolume, baseVolume, acidStrength, baseStrength]);

  return {
    variables,
    state,
    setVariable,
    resetAll,
    config,
  };
}
