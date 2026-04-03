'use client';

import { useState, useCallback, useMemo } from 'react';
import { lightReflectionConfig } from './config';
import type { VariableConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Light Reflection Physics — θᵢ = θᵣ
// Calculates ray geometry, angles, intersection point
// ─────────────────────────────────────────────

const DEG_TO_RAD = Math.PI / 180;

export interface RayGeometry {
  // Mirror
  mirrorStartX: number;
  mirrorStartY: number;
  mirrorEndX: number;
  mirrorEndY: number;
  mirrorCenterX: number;
  mirrorCenterY: number;

  // Normal line
  normalTopY: number;
  normalBottomY: number;

  // Incident ray (from top-left to mirror center)
  incidentStartX: number;
  incidentStartY: number;

  // Reflected ray (from mirror center to top-right)
  reflectedEndX: number;
  reflectedEndY: number;

  // Angles
  incidenceAngle: number;
  reflectionAngle: number;
}

export function useLightReflection() {
  const config = lightReflectionConfig;

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

  const incidenceAngle = variables.incidenceAngle ?? 45;
  const mirrorLength = variables.mirrorLength ?? 200;

  // Compute ray geometry
  const geometry = useMemo<RayGeometry>(() => {
    const cx = config.canvasSize.width / 2;   // 400
    const mirrorY = config.canvasSize.height * 0.65; // mirror at 65% height

    const halfMirror = mirrorLength / 2;
    const mirrorStartX = cx - halfMirror;
    const mirrorEndX = cx + halfMirror;

    // Normal line extends above and below mirror center
    const normalLen = 180;

    // Incident ray: comes from upper-left toward mirror center
    const angleRad = incidenceAngle * DEG_TO_RAD;
    const rayLen = 280;

    // Incident ray start (above mirror, offset by angle)
    const incidentStartX = cx - Math.sin(angleRad) * rayLen;
    const incidentStartY = mirrorY - Math.cos(angleRad) * rayLen;

    // Reflected ray end (mirror to upper-right, same angle)
    const reflectedEndX = cx + Math.sin(angleRad) * rayLen;
    const reflectedEndY = mirrorY - Math.cos(angleRad) * rayLen;

    return {
      mirrorStartX,
      mirrorStartY: mirrorY,
      mirrorEndX,
      mirrorEndY: mirrorY,
      mirrorCenterX: cx,
      mirrorCenterY: mirrorY,

      normalTopY: mirrorY - normalLen,
      normalBottomY: mirrorY + normalLen * 0.3,

      incidentStartX,
      incidentStartY,

      reflectedEndX,
      reflectedEndY,

      incidenceAngle,
      reflectionAngle: incidenceAngle, // θᵢ = θᵣ
    };
  }, [incidenceAngle, mirrorLength, config.canvasSize]);

  const computed = {
    reflectionAngle: incidenceAngle,
  };

  return {
    variables,
    computed,
    setVariable,
    resetAll,
    config,
    geometry,
  };
}
