'use client';

import { type ReactNode } from 'react';
import DotGridCanvas from './DotGridCanvas';
import type { InteractionMode } from '@/hooks/useInteractionMode';
import type { PanZoomState } from '@/hooks/usePanZoom';

// ─────────────────────────────────────────────
// PanZoomContainer — Manages the 3-layer canvas system
// Layer 1: Dot grid (moves with transform)
// Layer 2: Simulation objects (moves with transform)
// Layer 3: Fixed overlay (stays in place)
//
// In Hand mode: entire canvas pans/zooms
// In Mouse mode: individual objects are interactive
// ─────────────────────────────────────────────

interface PanZoomContainerProps {
  /** Pan/zoom state and handlers from usePanZoom */
  panZoom: PanZoomState & {
    transformStyle: { transform: string; transformOrigin: string };
    handlers: {
      onPointerDown: (e: React.PointerEvent) => void;
      onPointerMove: (e: React.PointerEvent) => void;
      onPointerUp: () => void;
      onWheel: (e: React.WheelEvent) => void;
    };
  };
  /** Current effective interaction mode */
  mode: InteractionMode;
  /** Simulation visual elements (Layer 2, moves with transform) */
  children?: ReactNode;
  /** Fixed overlay elements (Layer 3, control panels etc.) */
  overlay?: ReactNode;
}

export default function PanZoomContainer({
  panZoom,
  mode,
  children,
  overlay,
}: PanZoomContainerProps) {
  // Only pass pan/zoom handlers in hand mode
  const canvasHandlers = mode === 'hand' ? panZoom.handlers : undefined;

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Layer 1+2: Dot grid + simulation objects */}
      <DotGridCanvas
        transformStyle={panZoom.transformStyle}
        zoom={panZoom.zoom}
        handlers={canvasHandlers}
      >
        {children}
      </DotGridCanvas>

      {/* Layer 3: Fixed UI overlay */}
      {overlay && <div className="fixed-overlay">{overlay}</div>}
    </div>
  );
}
