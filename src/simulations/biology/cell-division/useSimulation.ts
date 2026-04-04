'use client';

import { useState, useCallback, useMemo } from 'react';
import { cellDivisionConfig, PHASES, type PhaseInfo } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Cell Division — Mitosis Simulation Logic
// 6 phases of mitotic cell division
// ─────────────────────────────────────────────

export interface CellState {
  phase: PhaseInfo;
  phaseIndex: number;
  speed: number;
  /** Nucleus visible (disappears in metaphase/anaphase) */
  nucleusVisible: boolean;
  /** Nuclear membrane opacity (fades during prophase) */
  membraneOpacity: number;
  /** Chromosome condensation level 0-1 */
  condensation: number;
  /** Spindle fibers visible */
  spindleVisible: boolean;
  /** Chromosome separation ratio 0-1 (anaphase) */
  separation: number;
  /** Cleavage furrow progress 0-1 (cytokinesis) */
  cleavage: number;
  /** Cell elongation factor */
  elongation: number;
}

export function useCellDivision() {
  const config = cellDivisionConfig;

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

  const phaseIndex = Math.round(variables.phase ?? 0);
  const speed = variables.speed ?? 1.0;

  const state = useMemo<CellState>(() => {
    const phase = PHASES[phaseIndex] || PHASES[0];

    // Phase-dependent visual states
    let nucleusVisible = true;
    let membraneOpacity = 1.0;
    let condensation = 0;
    let spindleVisible = false;
    let separation = 0;
    let cleavage = 0;
    let elongation = 1.0;

    switch (phaseIndex) {
      case 0: // Interphase
        nucleusVisible = true;
        membraneOpacity = 1.0;
        condensation = 0;
        break;
      case 1: // Prophase
        nucleusVisible = true;
        membraneOpacity = 0.5;
        condensation = 0.8;
        spindleVisible = true;
        break;
      case 2: // Metaphase
        nucleusVisible = false;
        membraneOpacity = 0;
        condensation = 1.0;
        spindleVisible = true;
        break;
      case 3: // Anaphase
        nucleusVisible = false;
        membraneOpacity = 0;
        condensation = 1.0;
        spindleVisible = true;
        separation = 1.0;
        elongation = 1.3;
        break;
      case 4: // Telophase
        nucleusVisible = true;
        membraneOpacity = 0.7;
        condensation = 0.3;
        spindleVisible = false;
        separation = 1.0;
        elongation = 1.4;
        break;
      case 5: // Cytokinesis
        nucleusVisible = true;
        membraneOpacity = 1.0;
        condensation = 0;
        separation = 1.0;
        cleavage = 1.0;
        elongation = 1.5;
        break;
    }

    return {
      phase,
      phaseIndex,
      speed,
      nucleusVisible,
      membraneOpacity,
      condensation,
      spindleVisible,
      separation,
      cleavage,
      elongation,
    };
  }, [phaseIndex, speed]);

  const nextPhase = useCallback(() => {
    setVariables((prev) => ({
      ...prev,
      phase: Math.min(5, (prev.phase ?? 0) + 1),
    }));
  }, []);

  const prevPhase = useCallback(() => {
    setVariables((prev) => ({
      ...prev,
      phase: Math.max(0, (prev.phase ?? 0) - 1),
    }));
  }, []);

  return {
    variables,
    state,
    setVariable,
    resetAll,
    nextPhase,
    prevPhase,
    config,
  };
}
