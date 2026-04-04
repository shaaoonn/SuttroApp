'use client';

import { useState, useCallback, useMemo } from 'react';
import { circleGeometryConfig } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Circle Geometry Logic
// Area = πr², Circumference = 2πr
// ─────────────────────────────────────────────

export interface CircleState {
  radius: number;
  diameter: number;
  area: number;
  circumference: number;
  /** Pixel radius for drawing */
  pixelRadius: number;
  /** Scale factor */
  scale: number;
}

export function useCircleGeometry() {
  const config = circleGeometryConfig;

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

  const radius = variables.radius ?? 5;

  const state = useMemo<CircleState>(() => {
    const diameter = radius * 2;
    const area = Math.PI * radius * radius;
    const circumference = 2 * Math.PI * radius;
    const scale = 18;
    const pixelRadius = radius * scale;

    return {
      radius,
      diameter,
      area,
      circumference,
      pixelRadius,
      scale,
    };
  }, [radius]);

  return {
    variables,
    state,
    setVariable,
    resetAll,
    config,
  };
}
