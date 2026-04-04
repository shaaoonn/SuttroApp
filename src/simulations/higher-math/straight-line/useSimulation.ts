'use client';

import { useState, useCallback, useMemo } from 'react';
import { straightLineConfig } from './config';
import type { VariableConfig } from '../../_template/config';

export interface LineState {
  slope: number;
  intercept: number;
  xIntercept: number | null;
  /** Two points for drawing the line */
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  /** Angle with x-axis */
  angleDeg: number;
  /** Is horizontal */
  isHorizontal: boolean;
  /** Is vertical-like (very steep) */
  isVerySteep: boolean;
}

export function useStraightLine() {
  const config = straightLineConfig;
  const initialVars: Record<string, number> = {};
  config.variables.forEach((v: VariableConfig) => { initialVars[v.id] = v.default; });

  const [variables, setVariables] = useState<Record<string, number>>(initialVars);
  const setVariable = useCallback((id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  }, []);
  const resetAll = useCallback(() => { setVariables(initialVars); }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const slope = variables.slope ?? 1;
  const intercept = variables.intercept ?? 0;

  const state = useMemo<LineState>(() => {
    const xIntercept = slope === 0 ? null : -intercept / slope;
    const angleDeg = Math.atan(slope) * (180 / Math.PI);
    const scale = 30; // pixels per unit
    const originX = 400;
    const originY = 300;

    // Line endpoints (extend to canvas edges)
    const xRange = 15;
    const x1 = -xRange;
    const y1 = slope * x1 + intercept;
    const x2 = xRange;
    const y2 = slope * x2 + intercept;

    return {
      slope,
      intercept,
      xIntercept,
      p1: { x: originX + x1 * scale, y: originY - y1 * scale },
      p2: { x: originX + x2 * scale, y: originY - y2 * scale },
      angleDeg,
      isHorizontal: slope === 0,
      isVerySteep: Math.abs(slope) > 4,
    };
  }, [slope, intercept]);

  return { variables, state, setVariable, resetAll, config };
}
