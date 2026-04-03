'use client';

import { getPHColorSmooth } from '../useSimulation';
import { SUBSTANCE_EXAMPLES } from '../config';

// ─────────────────────────────────────────────
// pH Scale — Vertical gradient bar (0-14)
// Shows current pH position with indicator arrow
// Common substance markers on the side
// ─────────────────────────────────────────────

interface PHScaleProps {
  x: number;
  y: number;
  height: number;
  currentPH: number;
  showSubstances: boolean;
}

export default function PHScale({
  x,
  y,
  height,
  currentPH,
  showSubstances,
}: PHScaleProps) {
  const barWidth = 30;
  const segments = 56; // smooth gradient segments
  const segmentH = height / segments;

  // Map pH to Y position
  const phToY = (pH: number) => y + (pH / 14) * height;
  const currentY = phToY(currentPH);

  return (
    <g>
      {/* Scale gradient bar */}
      {Array.from({ length: segments }, (_, i) => {
        const pH = (i / segments) * 14;
        return (
          <rect
            key={i}
            x={x}
            y={y + i * segmentH}
            width={barWidth}
            height={segmentH + 1}
            fill={getPHColorSmooth(pH)}
            opacity={0.85}
          />
        );
      })}

      {/* Border */}
      <rect
        x={x}
        y={y}
        width={barWidth}
        height={height}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        rx={4}
      />

      {/* pH number labels (0-14) */}
      {Array.from({ length: 15 }, (_, i) => (
        <g key={i}>
          <line
            x1={x - 4} y1={phToY(i)}
            x2={x} y2={phToY(i)}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
          <text
            x={x - 8}
            y={phToY(i) + 4}
            fill="rgba(255,255,255,0.5)"
            fontSize={10}
            textAnchor="end"
            fontFamily="monospace"
          >
            {i}
          </text>
        </g>
      ))}

      {/* Region labels */}
      <text
        x={x + barWidth / 2} y={y + height * 0.12}
        fill="rgba(255,255,255,0.7)" fontSize={10}
        textAnchor="middle" fontFamily="var(--font-hind-siliguri)"
        fontWeight="bold"
      >
        অ্যাসিড
      </text>
      <text
        x={x + barWidth / 2} y={y + height * 0.5 + 4}
        fill="rgba(255,255,255,0.7)" fontSize={10}
        textAnchor="middle" fontFamily="var(--font-hind-siliguri)"
        fontWeight="bold"
      >
        প্রশম
      </text>
      <text
        x={x + barWidth / 2} y={y + height * 0.88}
        fill="rgba(255,255,255,0.7)" fontSize={10}
        textAnchor="middle" fontFamily="var(--font-hind-siliguri)"
        fontWeight="bold"
      >
        ক্ষার
      </text>

      {/* Current pH indicator arrow */}
      <g>
        {/* Arrow pointing to scale */}
        <polygon
          points={`${x - 14},${currentY} ${x - 24},${currentY - 7} ${x - 24},${currentY + 7}`}
          fill={getPHColorSmooth(currentPH)}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1.5}
        >
          <animate
            attributeName="opacity"
            values="1;0.7;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </polygon>

        {/* pH value badge */}
        <rect
          x={x - 70}
          y={currentY - 12}
          width={44}
          height={24}
          rx={6}
          fill={getPHColorSmooth(currentPH)}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
        />
        <text
          x={x - 48}
          y={currentY + 5}
          fill="white"
          fontSize={13}
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {currentPH.toFixed(1)}
        </text>
      </g>

      {/* Horizontal line at pH 7 (neutral marker) */}
      <line
        x1={x - 4} y1={phToY(7)}
        x2={x + barWidth + 4} y2={phToY(7)}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
        strokeDasharray="4,3"
      />

      {/* Substance markers on the right */}
      {showSubstances && SUBSTANCE_EXAMPLES.map((sub, i) => {
        const subY = phToY(sub.pH);
        return (
          <g key={i}>
            <line
              x1={x + barWidth} y1={subY}
              x2={x + barWidth + 8} y2={subY}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
            <text
              x={x + barWidth + 12}
              y={subY + 3}
              fill="rgba(255,255,255,0.4)"
              fontSize={9}
              fontFamily="var(--font-hind-siliguri)"
            >
              {sub.name.bn} ({sub.pH})
            </text>
          </g>
        );
      })}
    </g>
  );
}
