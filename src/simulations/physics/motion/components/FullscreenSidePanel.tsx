'use client';

import { useEffect, useState } from 'react';
import { EQUATIONS } from '../physics';
import type {
  EquationKey,
  KinematicVars,
  LayerVisibility,
  MotionState,
  ValidationError,
  VariableKey,
} from '../types';
import ErrorBanner from './ErrorBanner';
import FormulaDropdown from './FormulaDropdown';
import KinematicGraph from './KinematicGraph';
import LayerToggles from './LayerToggles';
import ResultDisplay from './ResultDisplay';
import StepDerivation from './StepDerivation';

// ─────────────────────────────────────────────
// FullscreenSidePanel — compact right rail used ONLY in fullscreen mode.
// Reuses the same components shown in the desktop right panel, but with
// tighter spacing, smaller graphs, and a vertical scrollbar.
// Width is controlled by the parent (typically 1/5 of viewport, 180–260 px).
// ─────────────────────────────────────────────

interface Props {
  mode: MotionState['mode'];
  equation: EquationKey;
  variantIndex: number;
  onVariantChange: (i: number) => void;
  values: KinematicVars;
  unknown: VariableKey | null;
  lastResult: MotionState['lastResult'];
  error: ValidationError | null;
  liveTime: number;
  liveV: number;
  liveS: number;
  duration: number;
  layers: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  isFreefall: boolean;
  distanceUnit?: 'm' | 'cm';
}

export default function FullscreenSidePanel({
  mode,
  equation,
  variantIndex,
  onVariantChange,
  values,
  unknown,
  lastResult,
  error,
  liveTime,
  liveV,
  liveS,
  duration,
  layers,
  onToggleLayer,
  isFreefall,
  distanceUnit = 'm',
}: Props) {
  const equationDef = EQUATIONS[equation];
  const variant = equationDef.variants[variantIndex] ?? equationDef.variants[0];

  // Mobile fullscreen detection — apply 0.8× zoom so formulas/result/graphs
  // fit comfortably in the narrow 1/5 rail on phone-landscape.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      className="flex flex-col gap-1.5 p-2 overflow-y-auto h-full w-full"
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
        // CSS zoom shrinks all child sizes (text, padding, graph height) uniformly.
        // Supported in modern Chrome/Edge/Safari/Firefox.
        zoom: isNarrow ? 0.8 : 1,
      }}
    >
      {mode === 'solver' && (
        <FormulaDropdown
          equation={equationDef}
          variantIndex={variantIndex}
          onChange={onVariantChange}
        />
      )}

      {mode === 'solver' && <StepDerivation variant={variant} />}

      <ResultDisplay
        liveTime={liveTime}
        liveV={liveV}
        liveS={liveS}
        unknown={unknown}
        values={values}
        lastResult={lastResult}
        error={error}
        mode={mode}
        distanceUnit={distanceUnit}
      />

      <ErrorBanner error={error} />

      <div>
        <div
          className="text-[9px] mb-1 font-semibold tracking-wide uppercase"
          style={{ color: '#94A3B8' }}
        >
          লেয়ার
        </div>
        <LayerToggles
          layers={layers}
          onToggle={onToggleLayer}
          isFreefall={isFreefall}
        />
      </div>

      {layers.vGraph && (
        <KinematicGraph
          variant="velocity"
          values={values}
          duration={duration}
          liveTime={liveTime}
          isFreefall={isFreefall}
          compact
        />
      )}
      {layers.sGraph && (
        <KinematicGraph
          variant="displacement"
          values={values}
          duration={duration}
          liveTime={liveTime}
          isFreefall={isFreefall}
          compact
        />
      )}
    </div>
  );
}
