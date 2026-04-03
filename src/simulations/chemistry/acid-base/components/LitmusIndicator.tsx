'use client';

// ─────────────────────────────────────────────
// Litmus Indicator — Shows litmus paper test result
// Red paper: stays red in acid, turns blue in base
// Blue paper: turns red in acid, stays blue in base
// ─────────────────────────────────────────────

interface LitmusIndicatorProps {
  x: number;
  y: number;
  nature: 'acid' | 'base' | 'neutral';
  solutionColor: string;
  hasLiquid: boolean;
}

export default function LitmusIndicator({
  x,
  y,
  nature,
  solutionColor,
  hasLiquid,
}: LitmusIndicatorProps) {
  // Litmus colors
  const redLitmusColor = !hasLiquid
    ? 'rgb(239, 68, 68)'          // original red
    : nature === 'base'
      ? 'rgb(59, 130, 246)'       // turns blue in base
      : 'rgb(239, 68, 68)';       // stays red in acid/neutral

  const blueLitmusColor = !hasLiquid
    ? 'rgb(59, 130, 246)'          // original blue
    : nature === 'acid'
      ? 'rgb(239, 68, 68)'        // turns red in acid
      : 'rgb(59, 130, 246)';      // stays blue in base/neutral

  const paperW = 18;
  const paperH = 50;
  const gap = 28;

  return (
    <g>
      {/* Label */}
      <text
        x={x + gap / 2 + paperW / 2}
        y={y - 10}
        fill="rgba(255,255,255,0.5)"
        fontSize={11}
        textAnchor="middle"
        fontFamily="var(--font-hind-siliguri)"
      >
        লিটমাস পরীক্ষা
      </text>

      {/* Red litmus paper */}
      <rect
        x={x}
        y={y}
        width={paperW}
        height={paperH}
        rx={2}
        fill={redLitmusColor}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <text
        x={x + paperW / 2}
        y={y + paperH + 14}
        fill="rgba(255,255,255,0.4)"
        fontSize={9}
        textAnchor="middle"
        fontFamily="var(--font-hind-siliguri)"
      >
        লাল
      </text>

      {/* Blue litmus paper */}
      <rect
        x={x + gap}
        y={y}
        width={paperW}
        height={paperH}
        rx={2}
        fill={blueLitmusColor}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <text
        x={x + gap + paperW / 2}
        y={y + paperH + 14}
        fill="rgba(255,255,255,0.4)"
        fontSize={9}
        textAnchor="middle"
        fontFamily="var(--font-hind-siliguri)"
      >
        নীল
      </text>

      {/* Dip indicator */}
      {hasLiquid && (
        <line
          x1={x - 4} y1={y + paperH * 0.6}
          x2={x + gap + paperW + 4} y2={y + paperH * 0.6}
          stroke={solutionColor}
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.4}
        />
      )}

      {/* Result label */}
      {hasLiquid && (
        <text
          x={x + gap / 2 + paperW / 2}
          y={y + paperH + 30}
          fill={solutionColor}
          fontSize={10}
          textAnchor="middle"
          fontFamily="var(--font-hind-siliguri)"
          fontWeight="bold"
        >
          {nature === 'acid' ? 'অ্যাসিডিক' : nature === 'base' ? 'ক্ষারীয়' : 'প্রশম'}
        </text>
      )}
    </g>
  );
}
