'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────
// ElectronFlow - Animated electrons flowing through wire
// Speed proportional to current
// ─────────────────────────────────────────────

interface ElectronFlowProps {
  /** Wire path points [[x1,y1], [x2,y2], ...] */
  path: [number, number][];
  /** Animation speed factor (0 = stopped, 1 = max speed) */
  speed: number;
  /** Number of electrons visible */
  count?: number;
}

export default function ElectronFlow({
  path,
  speed,
  count = 6,
}: ElectronFlowProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (speed <= 0) return;

    let animFrame: number;
    const animate = () => {
      setOffset((prev) => (prev + speed * 2) % 100);
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [speed]);

  if (speed <= 0 || path.length < 2) return null;

  // Calculate total path length
  let totalLength = 0;
  const segments: { length: number; cumLength: number }[] = [];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i][0] - path[i - 1][0];
    const dy = path[i][1] - path[i - 1][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    totalLength += len;
    segments.push({ length: len, cumLength: totalLength });
  }

  // Position electrons along path
  const electrons: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const progress = ((offset + (i * 100) / count) % 100) / 100;
    const targetDist = progress * totalLength;

    let segIdx = 0;
    for (let s = 0; s < segments.length; s++) {
      if (segments[s].cumLength >= targetDist) {
        segIdx = s;
        break;
      }
    }

    const prevCum = segIdx > 0 ? segments[segIdx - 1].cumLength : 0;
    const t = (targetDist - prevCum) / segments[segIdx].length;
    const x = path[segIdx][0] + (path[segIdx + 1][0] - path[segIdx][0]) * t;
    const y = path[segIdx][1] + (path[segIdx + 1][1] - path[segIdx][1]) * t;
    electrons.push({ x, y });
  }

  // Bounding box
  const allX = path.map((p) => p[0]);
  const allY = path.map((p) => p[1]);
  const minX = Math.min(...allX) - 10;
  const minY = Math.min(...allY) - 10;
  const w = Math.max(...allX) - minX + 20;
  const h = Math.max(...allY) - minY + 20;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: minX, top: minY, width: w, height: h }}
    >
      {electrons.map((e, i) => (
        <circle
          key={i}
          cx={e.x - minX}
          cy={e.y - minY}
          r={3}
          fill="var(--canvas-wire)"
          opacity={0.8}
        />
      ))}
    </svg>
  );
}
