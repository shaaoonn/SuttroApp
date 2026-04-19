'use client';

import type { CellState } from '../useSimulation';

// ─────────────────────────────────────────────
// Cell - SVG cell body with membrane, nucleus,
// chromosomes, spindle fibers, cleavage furrow
// ─────────────────────────────────────────────

interface CellProps {
  cx: number;
  cy: number;
  radius: number;
  state: CellState;
}

/** Generate chromosome positions based on phase */
function getChromosomePositions(
  phase: number,
  cx: number,
  cy: number,
  count: number
) {
  const positions: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  const colors = ['#60A5FA', '#F87171', '#34D399', '#FBBF24'];

  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    const angle = (i / count) * Math.PI * 2 + Math.PI / 6;

    switch (phase) {
      case 0: {
        // Interphase: chromatin scattered in nucleus
        const r = 30 + (i % 3) * 12;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        positions.push({
          x1: x - 8, y1: y - 3,
          x2: x + 8, y2: y + 3,
          color,
        });
        break;
      }
      case 1: {
        // Prophase: condensing, X-shaped
        const r = 25 + (i % 3) * 15;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        positions.push({
          x1: x - 6, y1: y - 8,
          x2: x + 6, y2: y + 8,
          color,
        });
        break;
      }
      case 2: {
        // Metaphase: lined up at equator
        const spread = 15;
        const xOff = (i - count / 2) * spread;
        positions.push({
          x1: cx + xOff, y1: cy - 10,
          x2: cx + xOff, y2: cy + 10,
          color,
        });
        break;
      }
      case 3: {
        // Anaphase: separating to poles
        const xOff = (i % (count / 2)) * 15 - 15;
        const yOff = i < count / 2 ? -70 : 70;
        positions.push({
          x1: cx + xOff, y1: cy + yOff - 6,
          x2: cx + xOff, y2: cy + yOff + 6,
          color,
        });
        break;
      }
      case 4: {
        // Telophase: at poles, decondensing
        const pole = i < count / 2 ? -75 : 75;
        const r = 15 + (i % 2) * 8;
        const a = ((i % (count / 2)) / (count / 2)) * Math.PI * 2;
        positions.push({
          x1: cx + r * Math.cos(a) - 5, y1: cy + pole + r * Math.sin(a) - 3,
          x2: cx + r * Math.cos(a) + 5, y2: cy + pole + r * Math.sin(a) + 3,
          color,
        });
        break;
      }
      case 5: {
        // Cytokinesis: in two daughter nuclei
        const pole = i < count / 2 ? -90 : 90;
        const r = 12 + (i % 2) * 6;
        const a = ((i % (count / 2)) / (count / 2)) * Math.PI * 2;
        positions.push({
          x1: cx + r * Math.cos(a) - 4, y1: cy + pole + r * Math.sin(a) - 2,
          x2: cx + r * Math.cos(a) + 4, y2: cy + pole + r * Math.sin(a) + 2,
          color,
        });
        break;
      }
    }
  }
  return positions;
}

export default function Cell({ cx, cy, radius, state }: CellProps) {
  const {
    phaseIndex, nucleusVisible, membraneOpacity,
    condensation, spindleVisible, separation,
    cleavage, elongation,
  } = state;

  const chromosomeCount = 4; // 2n = 4 (simplified)
  const chromosomes = getChromosomePositions(phaseIndex, cx, cy, chromosomeCount);

  // Cell dimensions (elongates in later phases)
  const cellRx = radius;
  const cellRy = radius * elongation;

  // Nucleus radius
  const nucleusR = radius * 0.4;

  return (
    <g>
      {/* Cell glow */}
      <defs>
        <radialGradient id="cellGlow">
          <stop offset="0%" stopColor="rgba(5,150,105,0.15)" />
          <stop offset="100%" stopColor="rgba(5,150,105,0)" />
        </radialGradient>
        <radialGradient id="nucleusGrad">
          <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
          <stop offset="80%" stopColor="rgba(99,102,241,0.1)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.05)" />
        </radialGradient>
      </defs>

      <ellipse cx={cx} cy={cy} rx={cellRx + 30} ry={cellRy + 30}
        fill="url(#cellGlow)" />

      {/* Cell membrane */}
      <ellipse
        cx={cx} cy={cy}
        rx={cellRx} ry={cellRy}
        fill="rgba(5,150,105,0.08)"
        stroke="rgba(5,150,105,0.5)"
        strokeWidth={3}
      />

      {/* Cleavage furrow (cytokinesis) */}
      {cleavage > 0 && (
        <>
          <line
            x1={cx - cellRx * cleavage * 0.5} y1={cy}
            x2={cx - 5} y2={cy}
            stroke="rgba(5,150,105,0.6)"
            strokeWidth={3}
          />
          <line
            x1={cx + 5} y1={cy}
            x2={cx + cellRx * cleavage * 0.5} y2={cy}
            stroke="rgba(5,150,105,0.6)"
            strokeWidth={3}
          />
        </>
      )}

      {/* Spindle fibers */}
      {spindleVisible && (
        <g opacity={0.3}>
          {/* Centrioles at poles */}
          <circle cx={cx} cy={cy - cellRy + 15} r={6}
            fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth={1.5} />
          <circle cx={cx} cy={cy + cellRy - 15} r={6}
            fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth={1.5} />

          {/* Fibers */}
          {[-20, -8, 0, 8, 20].map((xOff, i) => (
            <g key={i}>
              <line
                x1={cx} y1={cy - cellRy + 15}
                x2={cx + xOff} y2={cy + (separation > 0 ? -20 : 0)}
                stroke="rgba(251,191,36,0.25)"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <line
                x1={cx} y1={cy + cellRy - 15}
                x2={cx + xOff} y2={cy + (separation > 0 ? 20 : 0)}
                stroke="rgba(251,191,36,0.25)"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            </g>
          ))}
        </g>
      )}

      {/* Nuclear membrane */}
      {nucleusVisible && (
        <g opacity={membraneOpacity}>
          {phaseIndex <= 1 ? (
            // Single nucleus (interphase/prophase)
            <circle
              cx={cx} cy={cy} r={nucleusR}
              fill="url(#nucleusGrad)"
              stroke="rgba(99,102,241,0.4)"
              strokeWidth={2}
              strokeDasharray={membraneOpacity < 1 ? '4,3' : 'none'}
            />
          ) : (
            // Two daughter nuclei (telophase/cytokinesis)
            <>
              <circle
                cx={cx} cy={cy - 75} r={nucleusR * 0.7}
                fill="url(#nucleusGrad)"
                stroke="rgba(99,102,241,0.4)"
                strokeWidth={2}
                strokeDasharray={membraneOpacity < 1 ? '4,3' : 'none'}
              />
              <circle
                cx={cx} cy={cy + 75} r={nucleusR * 0.7}
                fill="url(#nucleusGrad)"
                stroke="rgba(99,102,241,0.4)"
                strokeWidth={2}
                strokeDasharray={membraneOpacity < 1 ? '4,3' : 'none'}
              />
            </>
          )}
        </g>
      )}

      {/* Nucleolus (only in interphase) */}
      {phaseIndex === 0 && (
        <circle
          cx={cx + 10} cy={cy - 8} r={8}
          fill="rgba(168,85,247,0.3)"
          stroke="rgba(168,85,247,0.2)"
          strokeWidth={1}
        />
      )}

      {/* Chromosomes / Chromatin */}
      {chromosomes.map((chr, i) => {
        const thickness = condensation > 0.5 ? 4 : 2;
        return (
          <g key={i}>
            <line
              x1={chr.x1} y1={chr.y1}
              x2={chr.x2} y2={chr.y2}
              stroke={chr.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              opacity={0.8}
            />
            {/* X-shape for condensed chromosomes (prophase+) */}
            {condensation > 0.5 && phaseIndex >= 1 && phaseIndex <= 3 && (
              <line
                x1={chr.x1 + (chr.x2 - chr.x1)} y1={chr.y1}
                x2={chr.x1} y2={chr.y2}
                stroke={chr.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                opacity={0.6}
              />
            )}
          </g>
        );
      })}

      {/* Cytoplasm organelles (small dots) */}
      {[
        { x: cx - 60, y: cy - 30 }, { x: cx + 55, y: cy + 20 },
        { x: cx - 40, y: cy + 50 }, { x: cx + 30, y: cy - 55 },
        { x: cx - 70, y: cy + 10 }, { x: cx + 65, y: cy - 10 },
      ].map((pos, i) => (
        <circle
          key={`org-${i}`}
          cx={pos.x} cy={pos.y} r={3}
          fill="rgba(5,150,105,0.15)"
          stroke="rgba(5,150,105,0.1)"
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}
