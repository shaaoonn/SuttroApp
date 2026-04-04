'use client';

import { useState, useCallback, useMemo } from 'react';
import { photosynthesisConfig } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Photosynthesis Simulation Logic
// Rate depends on light, CO₂, and water
// Limiting factor principle
// ─────────────────────────────────────────────

export interface PhotosynthesisState {
  /** Photosynthesis rate (0-100) */
  rate: number;
  /** Oxygen production rate (bubbles/min equivalent) */
  oxygenRate: number;
  /** Glucose production rate */
  glucoseRate: number;
  /** Limiting factor */
  limitingFactor: string;
  /** Light intensity 0-100 */
  light: number;
  /** CO₂ level 0-100 */
  co2: number;
  /** Water level 0-100 */
  water: number;
  /** Sun glow intensity */
  sunGlow: number;
  /** Leaf color saturation (more green with more activity) */
  leafGreen: number;
  /** Number of O₂ bubbles to show */
  bubbleCount: number;
  /** Arrow flow speed multiplier */
  flowSpeed: number;
}

export function usePhotosynthesis() {
  const config = photosynthesisConfig;

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

  const light = variables.lightIntensity ?? 50;
  const co2 = variables.co2Level ?? 50;
  const water = variables.waterLevel ?? 50;

  const state = useMemo<PhotosynthesisState>(() => {
    // Limiting factor principle: rate = minimum of all factors
    const normalizedLight = light / 100;
    const normalizedCO2 = co2 / 100;
    const normalizedWater = water / 100;

    // Rate is determined by the limiting factor
    const rate = Math.min(normalizedLight, normalizedCO2, normalizedWater) * 100;

    // Determine limiting factor
    let limitingFactor = 'কোনোটি নয়';
    if (rate === 0) {
      if (light === 0) limitingFactor = 'আলো';
      else if (co2 === 0) limitingFactor = 'CO₂';
      else limitingFactor = 'পানি';
    } else {
      const min = Math.min(normalizedLight, normalizedCO2, normalizedWater);
      if (min === normalizedLight) limitingFactor = 'আলো';
      else if (min === normalizedCO2) limitingFactor = 'CO₂';
      else limitingFactor = 'পানি';
    }

    // Oxygen production (proportional to rate)
    const oxygenRate = rate * 0.6;

    // Glucose production
    const glucoseRate = rate * 0.3;

    // Visual parameters
    const sunGlow = normalizedLight;
    const leafGreen = 0.3 + rate / 100 * 0.7;
    const bubbleCount = Math.floor(rate / 10);
    const flowSpeed = 0.5 + (rate / 100) * 2;

    return {
      rate,
      oxygenRate,
      glucoseRate,
      limitingFactor,
      light,
      co2,
      water,
      sunGlow,
      leafGreen,
      bubbleCount,
      flowSpeed,
    };
  }, [light, co2, water]);

  return {
    variables,
    state,
    setVariable,
    resetAll,
    config,
  };
}
