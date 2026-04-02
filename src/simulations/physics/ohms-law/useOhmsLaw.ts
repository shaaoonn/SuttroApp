'use client';

import { useState, useCallback, useMemo } from 'react';
import { ohmsLawConfig } from './config';

export function useOhmsLaw() {
  const [voltage, setVoltage] = useState(ohmsLawConfig.variables[0].default);
  const [resistance, setResistance] = useState(ohmsLawConfig.variables[1].default);

  const variables: Record<string, number> = { voltage, resistance };

  const setVariable = useCallback((id: string, value: number) => {
    if (id === 'voltage') setVoltage(value);
    if (id === 'resistance') setResistance(value);
  }, []);

  const resetAll = useCallback(() => {
    setVoltage(ohmsLawConfig.variables[0].default);
    setResistance(ohmsLawConfig.variables[1].default);
  }, []);

  // Physics calculations
  const computed = useMemo(() => {
    const current = voltage / resistance; // I = V/R (Amperes)
    const power = voltage * current; // P = VI (Watts)
    return { current, power };
  }, [voltage, resistance]);

  // Visual helpers
  const currentIntensity = useMemo(() => {
    // Normalize current to 0-1 for visual brightness
    const maxCurrent = ohmsLawConfig.variables[0].max / ohmsLawConfig.variables[1].min;
    return Math.min(1, computed.current / maxCurrent);
  }, [computed.current]);

  const bulbBrightness = useMemo(() => {
    // Brightness based on power, capped at reasonable level
    const maxPower = ohmsLawConfig.variables[0].max * (ohmsLawConfig.variables[0].max / ohmsLawConfig.variables[1].min);
    return Math.min(1, computed.power / maxPower);
  }, [computed.power]);

  // Electron flow speed (animation factor)
  const electronSpeed = useMemo(() => {
    if (voltage === 0) return 0;
    return Math.min(1, currentIntensity * 2);
  }, [voltage, currentIntensity]);

  return {
    variables,
    computed,
    setVariable,
    resetAll,
    config: ohmsLawConfig,
    // Visual helpers
    currentIntensity,
    bulbBrightness,
    electronSpeed,
  };
}
