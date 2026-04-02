'use client';

import { type ReactNode, type PointerEvent, type WheelEvent } from 'react';

// ─────────────────────────────────────────────
// DotGridCanvas — Graph paper-style dot grid background
// Layer 1 + 2: moves with pan/zoom transform
// Dot spacing scales with zoom level for visual feedback
// ─────────────────────────────────────────────

interface DotGridCanvasProps {
  /** CSS transform style from usePanZoom */
  transformStyle: { transform: string; transformOrigin: string };
  /** Current zoom level (for dot spacing) */
  zoom: number;
  /** Pointer event handlers (only active in hand mode) */
  handlers?: {
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: () => void;
    onWheel: (e: WheelEvent) => void;
  };
  /** Simulation visual elements (Layer 2) */
  children?: ReactNode;
}

export default function DotGridCanvas({
  transformStyle,
  zoom,
  handlers,
  children,
}: DotGridCanvasProps) {
  const dotSize = 20 * zoom;

  return (
    <div
      className="sim-canvas absolute inset-0"
      style={{
        ...transformStyle,
        backgroundSize: `${dotSize}px ${dotSize}px`,
      }}
      {...(handlers ?? {})}
    >
      {children}
    </div>
  );
}
