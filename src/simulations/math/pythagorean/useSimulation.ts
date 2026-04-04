'use client';

import { useState, useCallback, useMemo } from 'react';
import { pythagoreanConfig } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Pythagorean Theorem Logic
// a² + b² = c²
// ─────────────────────────────────────────────

export interface PythagoreanState {
  a: number;
  b: number;
  c: number;
  aSquared: number;
  bSquared: number;
  cSquared: number;
  /** Is this a Pythagorean triple (all integers)? */
  isTriple: boolean;
  /** Angle opposite to side a */
  angleA: number;
  /** Angle opposite to side b */
  angleB: number;
  /** Triangle pixel coordinates (scaled) */
  triangle: {
    ax: number; ay: number; // right angle vertex
    bx: number; by: number; // end of side a (base)
    cx: number; cy: number; // end of side b (height)
  };
  /** Scale factor for drawing */
  scale: number;
}

export function usePythagorean() {
  const config = pythagoreanConfig;

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

  const a = variables.sideA ?? 3;
  const b = variables.sideB ?? 4;

  const state = useMemo<PythagoreanState>(() => {
    const aSquared = a * a;
    const bSquared = b * b;
    const cSquared = aSquared + bSquared;
    const c = Math.sqrt(cSquared);

    // Check if Pythagorean triple
    const isTriple = Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c);

    // Angles in degrees
    const angleA = Math.atan(a / b) * (180 / Math.PI);
    const angleB = Math.atan(b / a) * (180 / Math.PI);

    // Scale to fit canvas (max side around 250px)
    const maxSide = Math.max(a, b);
    const scale = 220 / maxSide;

    // Triangle vertices (right angle at bottom-left)
    const originX = 250;
    const originY = 420;

    const triangle = {
      ax: originX,               ay: originY,               // right angle (origin)
      bx: originX + a * scale,   by: originY,               // base end
      cx: originX,               cy: originY - b * scale,   // height end
    };

    return {
      a, b, c,
      aSquared, bSquared, cSquared,
      isTriple,
      angleA, angleB,
      triangle,
      scale,
    };
  }, [a, b]);

  return {
    variables,
    state,
    setVariable,
    resetAll,
    config,
  };
}
