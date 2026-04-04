'use client';

import { useState, useCallback, useMemo } from 'react';
import { atomicStructureConfig, ELEMENTS, type ElementData } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Atomic Structure — Bohr Model Simulation Logic
// Electron shells, nucleus composition
// ─────────────────────────────────────────────

const SHELL_NAMES = ['K', 'L', 'M', 'N'];

export interface AtomicState {
  element: ElementData;
  /** Total electrons (= protons for neutral atom) */
  electrons: number;
  /** Shell radii in SVG units */
  shellRadii: number[];
  /** Electron positions per shell (angle offsets for animation) */
  shellElectrons: number[];
  /** Electron configuration string e.g. "2, 8, 1" */
  configString: string;
  /** Shell labels e.g. ["K(2)", "L(8)", "M(1)"] */
  shellLabels: string[];
  /** Valence electrons (outermost shell) */
  valenceElectrons: number;
  /** Nucleus radius based on mass */
  nucleusRadius: number;
  /** Is noble gas? */
  isNobleGas: boolean;
}

export function useAtomicStructure() {
  const config = atomicStructureConfig;

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

  const atomicNumber = Math.round(variables.atomicNumber ?? 1);

  const state = useMemo<AtomicState>(() => {
    const element = ELEMENTS[atomicNumber - 1] || ELEMENTS[0];
    const electrons = element.z;
    const shells = element.shells;

    // Shell radii: start at 70, increment by 45
    const baseRadius = 70;
    const radiusStep = 45;
    const shellRadii = shells.map((_, i) => baseRadius + i * radiusStep);

    // Configuration string: "2, 8, 1"
    const configString = shells.join(', ');

    // Shell labels: "K(2)", "L(8)", "M(1)"
    const shellLabels = shells.map((count, i) => `${SHELL_NAMES[i]}(${count})`);

    // Valence electrons
    const valenceElectrons = shells[shells.length - 1];

    // Nucleus radius scales with mass number
    const nucleusRadius = 18 + Math.sqrt(element.mass) * 2.5;

    // Noble gases: He, Ne, Ar
    const nobleGasZ = [2, 10, 18];
    const isNobleGas = nobleGasZ.includes(element.z);

    return {
      element,
      electrons,
      shellRadii,
      shellElectrons: shells,
      configString,
      shellLabels,
      valenceElectrons,
      nucleusRadius,
      isNobleGas,
    };
  }, [atomicNumber]);

  return {
    variables,
    state,
    setVariable,
    resetAll,
    config,
  };
}
