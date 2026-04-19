'use client';

import { useState, useCallback, useMemo } from 'react';
import { lightRefractionConfig } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Light Refraction Physics
// Snell's Law: n₁ sin θ₁ = n₂ sin θ₂
// Critical angle & Total Internal Reflection
// ─────────────────────────────────────────────

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export interface RefractionGeometry {
  // Boundary
  boundaryY: number;
  centerX: number;

  // Medium regions
  medium1Color: string; // top
  medium2Color: string; // bottom

  // Normal line
  normalTopY: number;
  normalBottomY: number;

  // Incident ray
  incidentStartX: number;
  incidentStartY: number;

  // Refracted ray (null if TIR)
  refractedEndX: number | null;
  refractedEndY: number | null;

  // Reflected ray (always exists, full intensity during TIR)
  reflectedEndX: number;
  reflectedEndY: number;

  // Angles
  incidenceAngle: number;
  refractionAngle: number | null; // null if TIR
  criticalAngle: number | null;   // null if n1 <= n2

  // State
  isTIR: boolean;                 // Total Internal Reflection
  isDenseToRare: boolean;         // n1 > n2
  reflectionIntensity: number;    // 0-1, increases near critical angle
}

function getMediumColor(n: number): string {
  // Higher refractive index = denser = darker blue
  if (n <= 1.05) return 'rgba(135, 206, 250, 0.08)'; // air - nearly transparent
  if (n <= 1.4)  return 'rgba(64, 164, 223, 0.18)';  // water
  if (n <= 1.8)  return 'rgba(100, 140, 200, 0.30)';  // glass
  return 'rgba(140, 120, 220, 0.40)';                  // diamond
}

export function getMediumName(n: number): string {
  if (n <= 1.05) return 'বায়ু';
  if (Math.abs(n - 1.33) < 0.05) return 'পানি';
  if (Math.abs(n - 1.50) < 0.05) return 'কাচ';
  if (Math.abs(n - 2.42) < 0.1) return 'হীরা';
  return `n=${n.toFixed(2)}`;
}

export function useLightRefraction() {
  const config = lightRefractionConfig;

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

  const swapMedia = useCallback(() => {
    setVariables((prev) => ({
      ...prev,
      n1: prev.n2,
      n2: prev.n1,
    }));
  }, []);

  const incAngle = variables.incidenceAngle ?? 30;
  const n1 = variables.n1 ?? 1.5;
  const n2 = variables.n2 ?? 1.0;

  const geometry = useMemo<RefractionGeometry>(() => {
    const cx = config.canvasSize.width / 2;  // 400
    const boundaryY = config.canvasSize.height / 2; // 300
    const rayLen = 220;

    const isDenseToRare = n1 > n2;

    // Critical angle (only when going dense → rare)
    let criticalAngle: number | null = null;
    if (isDenseToRare) {
      criticalAngle = Math.asin(n2 / n1) * RAD;
    }

    // Check for TIR
    const isTIR = isDenseToRare && criticalAngle !== null && incAngle >= criticalAngle;

    // Refraction angle (Snell's law)
    let refractionAngle: number | null = null;
    if (!isTIR) {
      const sinTheta2 = (n1 * Math.sin(incAngle * DEG)) / n2;
      if (sinTheta2 <= 1) {
        refractionAngle = Math.asin(sinTheta2) * RAD;
      }
    }

    // Reflection intensity (Fresnel approximation - simplified)
    let reflectionIntensity = 0.15; // always some reflection
    if (isDenseToRare && criticalAngle !== null) {
      const ratio = incAngle / criticalAngle;
      if (ratio > 0.8) {
        reflectionIntensity = 0.15 + 0.85 * Math.pow((ratio - 0.8) / 0.2, 2);
      }
      if (isTIR) reflectionIntensity = 1.0;
    }

    // Incident ray (from top to boundary center)
    const incRad = incAngle * DEG;
    const incidentStartX = cx - Math.sin(incRad) * rayLen;
    const incidentStartY = boundaryY - Math.cos(incRad) * rayLen;

    // Reflected ray (mirror of incident, in medium 1)
    const reflectedEndX = cx + Math.sin(incRad) * rayLen;
    const reflectedEndY = boundaryY - Math.cos(incRad) * rayLen;

    // Refracted ray (in medium 2, below boundary)
    let refractedEndX: number | null = null;
    let refractedEndY: number | null = null;
    if (refractionAngle !== null) {
      const refRad = refractionAngle * DEG;
      refractedEndX = cx + Math.sin(refRad) * rayLen;
      refractedEndY = boundaryY + Math.cos(refRad) * rayLen;
    }

    return {
      boundaryY,
      centerX: cx,
      medium1Color: getMediumColor(n1),
      medium2Color: getMediumColor(n2),
      normalTopY: boundaryY - 200,
      normalBottomY: boundaryY + 200,
      incidentStartX,
      incidentStartY,
      refractedEndX,
      refractedEndY,
      reflectedEndX,
      reflectedEndY,
      incidenceAngle: incAngle,
      refractionAngle,
      criticalAngle,
      isTIR,
      isDenseToRare,
      reflectionIntensity,
    };
  }, [incAngle, n1, n2, config.canvasSize]);

  const computed = {
    refractionAngle: geometry.refractionAngle ?? 0,
    criticalAngle: geometry.criticalAngle ?? 0,
  };

  return {
    variables,
    computed,
    setVariable,
    resetAll,
    swapMedia,
    config,
    geometry,
    n1,
    n2,
  };
}
