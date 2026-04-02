'use client';

// ─────────────────────────────────────────────
// Wire — SVG connection line between two points
// Used to connect circuit components, etc.
// ─────────────────────────────────────────────

interface WireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
}

export default function Wire({
  x1,
  y1,
  x2,
  y2,
  color = 'var(--canvas-wire)',
  width = 2,
}: WireProps) {
  const minX = Math.min(x1, x2) - 5;
  const minY = Math.min(y1, y2) - 5;
  const w = Math.abs(x2 - x1) + 10;
  const h = Math.abs(y2 - y1) + 10;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: minX, top: minY, width: w, height: h }}
    >
      <line
        x1={x1 - minX}
        y1={y1 - minY}
        x2={x2 - minX}
        y2={y2 - minY}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </svg>
  );
}
