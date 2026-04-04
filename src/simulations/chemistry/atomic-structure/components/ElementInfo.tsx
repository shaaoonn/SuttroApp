'use client';

import type { AtomicState } from '../useSimulation';

// ─────────────────────────────────────────────
// ElementInfo — Element details panel (SVG)
// Shows name, symbol, mass, electron config
// ─────────────────────────────────────────────

interface ElementInfoProps {
  x: number;
  y: number;
  state: AtomicState;
}

export default function ElementInfo({
  x,
  y,
  state,
}: ElementInfoProps) {
  const { element } = state;
  const lineH = 20;
  const boxW = 220;
  const boxH = 200;

  return (
    <g>
      {/* Background box */}
      <rect
        x={x}
        y={y}
        width={boxW}
        height={boxH}
        rx={10}
        fill="rgba(0,0,0,0.35)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />

      {/* Element symbol + number (large) */}
      <text
        x={x + boxW / 2}
        y={y + 38}
        fill={element.color}
        fontSize={28}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="monospace"
      >
        {element.symbol}
      </text>
      <text
        x={x + boxW / 2 - 22}
        y={y + 22}
        fill="rgba(255,255,255,0.5)"
        fontSize={12}
        textAnchor="end"
        fontFamily="monospace"
      >
        {element.z}
      </text>

      {/* Element name (Bangla) */}
      <text
        x={x + boxW / 2}
        y={y + 60}
        fill="rgba(255,255,255,0.8)"
        fontSize={14}
        textAnchor="middle"
        fontFamily="var(--font-hind-siliguri)"
      >
        {element.name.bn}
      </text>

      {/* English name */}
      <text
        x={x + boxW / 2}
        y={y + 78}
        fill="rgba(255,255,255,0.4)"
        fontSize={11}
        textAnchor="middle"
      >
        {element.name.en}
      </text>

      {/* Divider */}
      <line
        x1={x + 15} y1={y + 88}
        x2={x + boxW - 15} y2={y + 88}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />

      {/* Properties */}
      <text x={x + 15} y={y + 88 + lineH}
        fill="rgba(255,255,255,0.5)" fontSize={11}
        fontFamily="var(--font-hind-siliguri)">
        পারমাণবিক ভর:
      </text>
      <text x={x + boxW - 15} y={y + 88 + lineH}
        fill="rgba(255,255,255,0.7)" fontSize={11}
        textAnchor="end" fontFamily="monospace">
        {element.mass}
      </text>

      <text x={x + 15} y={y + 88 + lineH * 2}
        fill="rgba(255,255,255,0.5)" fontSize={11}
        fontFamily="var(--font-hind-siliguri)">
        প্রোটন:
      </text>
      <text x={x + boxW - 15} y={y + 88 + lineH * 2}
        fill="rgba(239,68,68,0.8)" fontSize={11}
        textAnchor="end" fontFamily="monospace">
        {element.z}
      </text>

      <text x={x + 15} y={y + 88 + lineH * 3}
        fill="rgba(255,255,255,0.5)" fontSize={11}
        fontFamily="var(--font-hind-siliguri)">
        নিউট্রন:
      </text>
      <text x={x + boxW - 15} y={y + 88 + lineH * 3}
        fill="rgba(156,163,175,0.8)" fontSize={11}
        textAnchor="end" fontFamily="monospace">
        {element.neutrons}
      </text>

      <text x={x + 15} y={y + 88 + lineH * 4}
        fill="rgba(255,255,255,0.5)" fontSize={11}
        fontFamily="var(--font-hind-siliguri)">
        ইলেকট্রন বিন্যাস:
      </text>
      <text x={x + boxW - 15} y={y + 88 + lineH * 4}
        fill="rgba(96,165,250,0.8)" fontSize={11}
        textAnchor="end" fontFamily="monospace">
        {state.configString}
      </text>

      <text x={x + 15} y={y + 88 + lineH * 5}
        fill="rgba(255,255,255,0.5)" fontSize={11}
        fontFamily="var(--font-hind-siliguri)">
        শ্রেণি:
      </text>
      <text x={x + boxW - 15} y={y + 88 + lineH * 5}
        fill={element.color} fontSize={11}
        textAnchor="end" fontFamily="var(--font-hind-siliguri)">
        {element.group}
      </text>
    </g>
  );
}
