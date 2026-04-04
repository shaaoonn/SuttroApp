'use client';

// ─────────────────────────────────────────────
// Nucleus — Protons (red) + Neutrons (grey)
// Clustered in center with subtle animation
// ─────────────────────────────────────────────

interface NucleusProps {
  cx: number;
  cy: number;
  radius: number;
  protons: number;
  neutrons: number;
  symbol: string;
}

/** Generate clustered particle positions inside nucleus */
function getParticlePositions(
  count: number,
  radius: number,
  seed: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  if (count === 0) return positions;
  if (count === 1) return [{ x: 0, y: 0 }];

  // Golden angle distribution for natural-looking clustering
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const maxR = radius * 0.75;

  for (let i = 0; i < count; i++) {
    const r = maxR * Math.sqrt((i + 0.5) / count);
    const theta = goldenAngle * (i + seed);
    positions.push({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
    });
  }
  return positions;
}

export default function Nucleus({
  cx,
  cy,
  radius,
  protons,
  neutrons,
  symbol,
}: NucleusProps) {
  const protonPositions = getParticlePositions(protons, radius, 0);
  const neutronPositions = getParticlePositions(neutrons, radius, 0.5);
  const particleR = Math.max(2.5, Math.min(5, radius / (Math.sqrt(protons + neutrons) + 1)));

  return (
    <g>
      {/* Nucleus glow */}
      <defs>
        <radialGradient id="nucleusGlow">
          <stop offset="0%" stopColor="rgba(251,146,60,0.4)" />
          <stop offset="60%" stopColor="rgba(251,146,60,0.1)" />
          <stop offset="100%" stopColor="rgba(251,146,60,0)" />
        </radialGradient>
      </defs>

      {/* Glow circle */}
      <circle cx={cx} cy={cy} r={radius * 1.8} fill="url(#nucleusGlow)">
        <animate
          attributeName="r"
          values={`${radius * 1.6};${radius * 2.0};${radius * 1.6}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Nucleus body */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="rgba(251,146,60,0.15)"
        stroke="rgba(251,146,60,0.3)"
        strokeWidth={1.5}
      />

      {/* Neutrons (grey, behind protons) */}
      {neutronPositions.map((pos, i) => (
        <circle
          key={`n-${i}`}
          cx={cx + pos.x}
          cy={cy + pos.y}
          r={particleR}
          fill="rgba(156,163,175,0.7)"
          stroke="rgba(156,163,175,0.3)"
          strokeWidth={0.5}
        />
      ))}

      {/* Protons (red) */}
      {protonPositions.map((pos, i) => (
        <circle
          key={`p-${i}`}
          cx={cx + pos.x}
          cy={cy + pos.y}
          r={particleR}
          fill="rgba(239,68,68,0.8)"
          stroke="rgba(239,68,68,0.4)"
          strokeWidth={0.5}
        />
      ))}

      {/* Element symbol in center */}
      <text
        x={cx}
        y={cy + 1}
        fill="white"
        fontSize={Math.min(20, radius * 0.8)}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="monospace"
        style={{ textShadow: '0 0 6px rgba(251,146,60,0.6)' }}
      >
        {symbol}
      </text>
    </g>
  );
}
