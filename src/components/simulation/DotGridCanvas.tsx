'use client';

import { type ReactNode, type PointerEvent, type WheelEvent } from 'react';

// ─────────────────────────────────────────────
// DotGridCanvas — Figma-style dot grid background
// This is the transform layer: it's LARGER than the viewport
// and moves with pan/zoom (CSS transform).
// Children (simulation objects) sit on this canvas.
// ─────────────────────────────────────────────

interface DotGridCanvasProps {
  /** CSS transform style from usePanZoom */
  transformStyle: { transform: string; transformOrigin: string };
  /** Current zoom level */
  zoom: number;
  /** Canvas virtual size */
  canvasWidth: number;
  canvasHeight: number;
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
  canvasWidth,
  canvasHeight,
  handlers,
  children,
}: DotGridCanvasProps) {
  // Figma-style: fixed spacing in canvas coordinates
  // At any zoom level, dots are always visible
  const dotSpacing = 24;
  // Dot size inversely scales so it stays visible when zoomed out
  const dotRadius = Math.max(1, 1.5 / Math.max(zoom, 0.3));

  return (
    <div
      className="absolute"
      style={{
        width: canvasWidth,
        height: canvasHeight,
        ...transformStyle,
        // Figma-style dot grid
        backgroundImage:
          `radial-gradient(circle, rgba(255,255,255,0.2) ${dotRadius}px, transparent ${dotRadius}px)`,
        backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        backgroundColor: 'var(--player-bg)',
      }}
      {...(handlers ?? {})}
    >
      {children}
    </div>
  );
}
