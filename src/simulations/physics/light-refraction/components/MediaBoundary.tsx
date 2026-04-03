'use client';

import { getMediumName } from '../useSimulation';

// ─────────────────────────────────────────────
// Two media with horizontal boundary
// Top: Medium 1, Bottom: Medium 2
// Shows medium names and refractive indices
// ─────────────────────────────────────────────

interface MediaBoundaryProps {
  canvasWidth: number;
  canvasHeight: number;
  boundaryY: number;
  medium1Color: string;
  medium2Color: string;
  n1: number;
  n2: number;
  isDenseToRare: boolean;
  onSwap: () => void;
}

export default function MediaBoundary({
  canvasWidth,
  canvasHeight,
  boundaryY,
  medium1Color,
  medium2Color,
  n1,
  n2,
  isDenseToRare,
  onSwap,
}: MediaBoundaryProps) {
  const m1Name = getMediumName(n1);
  const m2Name = getMediumName(n2);
  const m1Label = isDenseToRare ? 'ঘন মাধ্যম' : 'হালকা মাধ্যম';
  const m2Label = isDenseToRare ? 'হালকা মাধ্যম' : 'ঘন মাধ্যম';

  return (
    <>
      {/* Medium 1 (top) */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: canvasWidth,
          height: boundaryY,
          background: medium1Color,
        }}
      />

      {/* Medium 2 (bottom) */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: boundaryY,
          width: canvasWidth,
          height: canvasHeight - boundaryY,
          background: medium2Color,
        }}
      />

      <svg
        className="absolute pointer-events-none"
        style={{ left: 0, top: 0, width: '100%', height: '100%' }}
      >
        {/* Boundary line */}
        <line
          x1={0} y1={boundaryY}
          x2={canvasWidth} y2={boundaryY}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={2}
        />

        {/* Medium 1 label (top-left) */}
        <text x={20} y={30} fill="rgba(255,255,255,0.5)" fontSize={13}
          fontFamily="var(--font-hind-siliguri)">
          মাধ্যম ১: {m1Name} (n₁ = {n1.toFixed(2)})
        </text>
        <text x={20} y={50} fill="rgba(255,255,255,0.3)" fontSize={11}
          fontFamily="var(--font-hind-siliguri)">
          {m1Label}
        </text>

        {/* Medium 2 label (bottom-left) */}
        <text x={20} y={boundaryY + 30} fill="rgba(255,255,255,0.5)" fontSize={13}
          fontFamily="var(--font-hind-siliguri)">
          মাধ্যম ২: {m2Name} (n₂ = {n2.toFixed(2)})
        </text>
        <text x={20} y={boundaryY + 50} fill="rgba(255,255,255,0.3)" fontSize={11}
          fontFamily="var(--font-hind-siliguri)">
          {m2Label}
        </text>
      </svg>

      {/* Swap button */}
      <button
        onClick={onSwap}
        className="absolute px-3 py-1.5 rounded-lg text-xs font-medium suttro-transition hover:bg-white/20"
        style={{
          right: 14,
          top: boundaryY - 16,
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 5,
        }}
      >
        ⇅ মাধ্যম বদলাও
      </button>
    </>
  );
}
