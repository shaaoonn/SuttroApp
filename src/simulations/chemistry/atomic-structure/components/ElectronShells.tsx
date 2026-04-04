'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────
// ElectronShells — Animated orbiting electrons
// Each shell is a dashed circle with electrons
// ─────────────────────────────────────────────

const SHELL_NAMES = ['K', 'L', 'M', 'N'];
const SHELL_COLORS = [
  'rgba(96,165,250,0.5)',   // K — blue
  'rgba(52,211,153,0.5)',   // L — green
  'rgba(251,191,36,0.5)',   // M — amber
  'rgba(244,114,182,0.5)',  // N — pink
];
const ELECTRON_COLORS = [
  '#60A5FA',  // K
  '#34D399',  // L
  '#FBBF24',  // M
  '#F472B6',  // N
];

interface ElectronShellsProps {
  cx: number;
  cy: number;
  shellRadii: number[];
  shellElectrons: number[];
}

export default function ElectronShells({
  cx,
  cy,
  shellRadii,
  shellElectrons,
}: ElectronShellsProps) {
  // Animation: rotate electrons
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;

    const animate = (ts: number) => {
      if (!start) start = ts;
      setTime((ts - start) / 1000);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <g>
      {shellRadii.map((radius, shellIdx) => {
        const electronCount = shellElectrons[shellIdx] || 0;
        const shellColor = SHELL_COLORS[shellIdx] || SHELL_COLORS[0];
        const electronColor = ELECTRON_COLORS[shellIdx] || ELECTRON_COLORS[0];
        const shellName = SHELL_NAMES[shellIdx] || '?';

        // Rotation speed: inner shells faster
        const speed = 0.5 / (shellIdx + 1);
        const baseAngle = time * speed * Math.PI * 2;

        return (
          <g key={shellIdx}>
            {/* Shell orbit ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={shellColor}
              strokeWidth={1}
              strokeDasharray="6,4"
            />

            {/* Shell label */}
            <text
              x={cx + radius + 8}
              y={cy - 6}
              fill={shellColor}
              fontSize={11}
              fontFamily="var(--font-hind-siliguri)"
            >
              {shellName}
            </text>

            {/* Electrons — evenly spaced around the orbit */}
            {Array.from({ length: electronCount }, (_, eIdx) => {
              const angle = baseAngle + (eIdx / electronCount) * Math.PI * 2;
              const ex = cx + radius * Math.cos(angle);
              const ey = cy + radius * Math.sin(angle);

              return (
                <g key={eIdx}>
                  {/* Electron glow */}
                  <circle
                    cx={ex}
                    cy={ey}
                    r={7}
                    fill={electronColor}
                    opacity={0.15}
                  />
                  {/* Electron body */}
                  <circle
                    cx={ex}
                    cy={ey}
                    r={4}
                    fill={electronColor}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={0.8}
                  />
                  {/* e⁻ label (only show for small electron counts) */}
                  {electronCount <= 4 && (
                    <text
                      x={ex}
                      y={ey + 1}
                      fill="white"
                      fontSize={5}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      e⁻
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
