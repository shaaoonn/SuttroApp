'use client';

// ─────────────────────────────────────────────
// Mirror - Horizontal reflective surface
// Thick silver line with hash marks on back
// ─────────────────────────────────────────────

interface MirrorProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function Mirror({ startX, startY, endX, endY }: MirrorProps) {
  const length = endX - startX;
  const hashCount = Math.floor(length / 15);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      {/* Mirror surface - shiny silver */}
      <line
        x1={startX} y1={startY}
        x2={endX} y2={endY}
        stroke="#C0C0C0"
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Reflective highlight */}
      <line
        x1={startX} y1={startY - 1}
        x2={endX} y2={endY - 1}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
      />

      {/* Hash marks on back side (below mirror) */}
      {Array.from({ length: hashCount }).map((_, i) => {
        const x = startX + (i + 1) * (length / (hashCount + 1));
        return (
          <line
            key={i}
            x1={x} y1={startY + 3}
            x2={x - 8} y2={startY + 14}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Label */}
      <text
        x={(startX + endX) / 2}
        y={startY + 30}
        textAnchor="middle"
        fill="rgba(255,255,255,0.3)"
        fontSize={12}
        fontFamily="var(--font-hind-siliguri)"
      >
        সমতল দর্পণ
      </text>
    </svg>
  );
}
