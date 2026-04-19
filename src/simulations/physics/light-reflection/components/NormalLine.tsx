'use client';

// ─────────────────────────────────────────────
// Normal Line - Perpendicular to mirror surface
// Dashed line with label "অভিলম্ব"
// ─────────────────────────────────────────────

interface NormalLineProps {
  centerX: number;
  topY: number;
  bottomY: number;
  mirrorY: number;
}

export default function NormalLine({ centerX, topY, bottomY, mirrorY }: NormalLineProps) {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      {/* Normal line - dashed */}
      <line
        x1={centerX} y1={topY}
        x2={centerX} y2={bottomY}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1.5}
        strokeDasharray="8 5"
      />

      {/* N label at top */}
      <text
        x={centerX + 12}
        y={topY + 5}
        fill="rgba(255,255,255,0.5)"
        fontSize={13}
        fontFamily="var(--font-hind-siliguri)"
      >
        N
      </text>

      {/* Right angle marker at mirror surface */}
      <polyline
        points={`${centerX + 10},${mirrorY} ${centerX + 10},${mirrorY - 10} ${centerX},${mirrorY - 10}`}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={1}
      />

      {/* অভিলম্ব label */}
      <text
        x={centerX + 14}
        y={topY + 24}
        fill="rgba(255,255,255,0.35)"
        fontSize={11}
        fontFamily="var(--font-hind-siliguri)"
      >
        অভিলম্ব
      </text>
    </svg>
  );
}
