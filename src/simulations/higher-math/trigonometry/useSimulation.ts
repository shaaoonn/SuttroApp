'use client';

import { useState, useCallback, useMemo } from 'react';
import { trigonometryConfig } from './config';
import type { VariableConfig } from '../../_template/config';

const DEG = Math.PI / 180;

export interface TrigState {
  angle: number;
  angleRad: number;
  sinValue: number;
  cosValue: number;
  tanValue: number;
  /** Point on unit circle */
  px: number;
  py: number;
  /** Quadrant (1-4) */
  quadrant: number;
}

export function useTrigonometry() {
  const config = trigonometryConfig;
  const initialVars: Record<string, number> = {};
  config.variables.forEach((v: VariableConfig) => { initialVars[v.id] = v.default; });

  const [variables, setVariables] = useState<Record<string, number>>(initialVars);
  const setVariable = useCallback((id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  }, []);
  const resetAll = useCallback(() => { setVariables(initialVars); }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const angle = variables.angle ?? 45;

  const state = useMemo<TrigState>(() => {
    const angleRad = angle * DEG;
    const sinValue = Math.sin(angleRad);
    const cosValue = Math.cos(angleRad);
    const tanValue = Math.abs(cosValue) < 1e-10 ? Infinity : sinValue / cosValue;
    const quadrant = angle <= 90 ? 1 : angle <= 180 ? 2 : angle <= 270 ? 3 : 4;

    const R = 160; // unit circle radius in px
    const px = cosValue * R;
    const py = -sinValue * R; // SVG y is inverted

    return { angle, angleRad, sinValue, cosValue, tanValue, px, py, quadrant };
  }, [angle]);

  return { variables, state, setVariable, resetAll, config };
}
