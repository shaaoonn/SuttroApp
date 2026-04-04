'use client';

import { PHASES } from '../config';

// ─────────────────────────────────────────────
// Phase Timeline — Horizontal phase indicator
// Shows all 6 phases with current highlighted
// ─────────────────────────────────────────────

interface PhaseTimelineProps {
  x: number;
  y: number;
  width: number;
  currentPhase: number;
  onPhaseClick: (phase: number) => void;
}

export default function PhaseTimeline({
  x,
  y,
  width,
  currentPhase,
  onPhaseClick,
}: PhaseTimelineProps) {
  const stepW = width / PHASES.length;
  const dotR = 10;
  const lineY = y + 12;

  return (
    <g>
      {/* Background line */}
      <line
        x1={x + stepW / 2} y1={lineY}
        x2={x + width - stepW / 2} y2={lineY}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={2}
      />

      {/* Progress line */}
      <line
        x1={x + stepW / 2} y1={lineY}
        x2={x + stepW / 2 + (currentPhase / (PHASES.length - 1)) * (width - stepW)}
        y2={lineY}
        stroke={PHASES[currentPhase].color}
        strokeWidth={2}
        opacity={0.6}
      />

      {/* Phase dots + labels */}
      {PHASES.map((phase, i) => {
        const dotX = x + stepW / 2 + (i / (PHASES.length - 1)) * (width - stepW);
        const isActive = i === currentPhase;
        const isPast = i < currentPhase;

        return (
          <g
            key={i}
            style={{ cursor: 'pointer' }}
            onClick={() => onPhaseClick(i)}
          >
            {/* Clickable area */}
            <rect
              x={dotX - stepW / 2}
              y={lineY - 20}
              width={stepW}
              height={55}
              fill="transparent"
            />

            {/* Dot */}
            <circle
              cx={dotX}
              cy={lineY}
              r={isActive ? dotR + 2 : dotR}
              fill={isActive ? phase.color : isPast ? phase.color : 'rgba(255,255,255,0.1)'}
              stroke={phase.color}
              strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? 1 : isPast ? 0.5 : 0.3}
            />

            {/* Phase number */}
            <text
              x={dotX}
              y={lineY + 4}
              fill={isActive || isPast ? 'white' : 'rgba(255,255,255,0.4)'}
              fontSize={9}
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {i + 1}
            </text>

            {/* Phase name */}
            <text
              x={dotX}
              y={lineY + 28}
              fill={isActive ? phase.color : 'rgba(255,255,255,0.4)'}
              fontSize={isActive ? 10 : 9}
              fontWeight={isActive ? 'bold' : 'normal'}
              textAnchor="middle"
              fontFamily="var(--font-hind-siliguri)"
            >
              {phase.name.bn}
            </text>
          </g>
        );
      })}
    </g>
  );
}
