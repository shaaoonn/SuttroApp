'use client';

import { useState, useCallback } from 'react';
import { simConfig, type VariableConfig } from './config';

// ─────────────────────────────────────────────
// Simulation Logic Hook — CUSTOMIZE per simulation
// Add physics/chemistry/biology calculations here
// ─────────────────────────────────────────────

export interface SimulationState {
  variables: Record<string, number>;
  computed: Record<string, number>;
}

export function useSimulation() {
  // Initialize variables from config defaults
  const initialVars: Record<string, number> = {};
  simConfig.variables.forEach((v: VariableConfig) => {
    initialVars[v.id] = v.default;
  });

  const [variables, setVariables] = useState<Record<string, number>>(initialVars);

  const setVariable = useCallback((id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setVariables(initialVars);
  }, []);

  // ⬇️ ADD YOUR COMPUTED VALUES HERE
  // Example for Ohm's Law:
  // const computed = {
  //   current: variables.voltage / variables.resistance,
  //   power: variables.voltage * (variables.voltage / variables.resistance),
  // };
  const computed: Record<string, number> = {};

  return {
    variables,
    computed,
    setVariable,
    resetAll,
    config: simConfig,
  };
}
