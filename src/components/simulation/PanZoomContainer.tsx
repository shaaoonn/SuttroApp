'use client';

import { forwardRef, type ReactNode } from 'react';
import DotGridCanvas from './DotGridCanvas';
import type { InteractionMode } from '@/hooks/useInteractionMode';
import type { PanZoomState } from '@/hooks/usePanZoom';

// ─────────────────────────────────────────────
// PanZoomContainer — Viewport + Transform layer
//
// Architecture:
//   Viewport (this div): clips overflow, fills parent
//   └── DotGridCanvas (transform layer): large canvas that moves
//       └── Simulation objects (positioned in canvas coords)
//   └── Fixed overlay (Layer 3, optional)
//
// forwardRef so parent can measure viewport for auto-fit
// ─────────────────────────────────────────────

interface PanZoomContainerProps {
  /** Pan/zoom state from usePanZoom */
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
  /** Canvas virtual size (from simulation config) */
  canvasSize?: { width: number; height: number };
  /** Simulation visual elements (Layer 2, moves with transform) */
  children?: ReactNode;
  /** Fixed overlay elements (Layer 3, control panels etc.) */
  overlay?: ReactNode;
}

const PanZoomContainer = forwardRef<HTMLDivElement, PanZoomContainerProps>(
  function PanZoomContainer(
    {
      panZoom,
      mode,
      canvasSize = { width: 900, height: 600 },
      children,
      overlay,
    },
    ref,
  ) {
    // Only pass pan/zoom handlers in hand mode
    const canvasHandlers = mode === 'hand' ? panZoom.handlers : undefined;

    return (
      // Viewport — fills parent, clips the large canvas
      <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: 'var(--player-bg)' }}>
        {/* Layer 1+2: Dot grid + simulation objects (transform layer) */}
        <DotGridCanvas
          transformStyle={panZoom.transformStyle}
          zoom={panZoom.zoom}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          handlers={canvasHandlers}
        >
          {children}
        </DotGridCanvas>

        {/* Layer 3: Fixed UI overlay */}
        {overlay && <div className="fixed-overlay">{overlay}</div>}
      </div>
    );
  },
);

export default PanZoomContainer;
