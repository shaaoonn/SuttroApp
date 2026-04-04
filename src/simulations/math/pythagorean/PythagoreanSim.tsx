'use client';

import { useRef } from 'react';
import { usePythagorean } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useSimNarration, useSoundToggle } from '@/hooks/useSimNarration';
import { SIM_NARRATIONS } from '@/data/simNarrations';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';

// ─────────────────────────────────────────────
// পিথাগোরাসের উপপাদ্য (Pythagorean Theorem)
// NCTB Class 9, Chapter 7
// a² + b² = c² with visual area proof
// ─────────────────────────────────────────────

export default function PythagoreanSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = usePythagorean();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();
  const { soundEnabled, toggleSound } = useSoundToggle();
  useSimNarration({ template: SIM_NARRATIONS['pythagorean'], values: variables, soundEnabled });

  const { triangle: t, scale } = state;

  const readouts = [
    {
      id: 'c',
      label: { bn: 'অতিভুজ (c)', en: 'Hypotenuse (c)' },
      value: state.c,
      unit: '',
      decimals: 2,
    },
    {
      id: 'aSquared',
      label: { bn: 'a²', en: 'a²' },
      value: state.aSquared,
      unit: '',
      decimals: 1,
    },
    {
      id: 'bSquared',
      label: { bn: 'b²', en: 'b²' },
      value: state.bSquared,
      unit: '',
      decimals: 1,
    },
    {
      id: 'cSquared',
      label: { bn: 'c² = a² + b²', en: 'c² = a² + b²' },
      value: state.cSquared,
      unit: '',
      decimals: 1,
    },
  ];

  // Square sizes for visual proof
  const sqA = state.a * scale;
  const sqB = state.b * scale;
  const sqC = state.c * scale;

  // Hypotenuse angle
  const hypAngle = Math.atan2(t.cy - t.ay, t.cx - t.ax);
  const hypAngleDeg = Math.atan2(t.by - t.cy, t.bx - t.cx) * (180 / Math.PI);

  return (
    <PlayerShell
      topBar={{
        subject: config.subject,
        chapter: config.nctb.chapter,
        title: config.title.bn,
      }}
      panZoom={{
        zoom: panZoom.zoom,
        zoomIn: panZoom.zoomIn,
        zoomOut: panZoom.zoomOut,
        fitToScreen: panZoom.fitToScreen,
      }}
      interactionMode={{
        effectiveMode: interaction.effectiveMode,
        setMouseMode: interaction.setMouseMode,
        setHandMode: interaction.setHandMode,
      }}
      sound={{ enabled: soundEnabled, toggle: toggleSound }}
      cursor={interaction.cursor}
      overlay={
        <>
          <ControlPanel
            variables={config.variables}
            values={variables}
            onChange={setVariable}
            onReset={resetAll}
          />
          <ReadoutPanel entries={readouts} />
          <FormulaDisplay formulas={config.formulas} />
        </>
      }
    >
      <PanZoomContainer
        ref={viewportRef}
        panZoom={panZoom}
        mode={interaction.effectiveMode}
        canvasSize={config.canvasSize}
      >
        <svg
          className="absolute"
          style={{ left: 0, top: 0 }}
          width={config.canvasSize.width}
          height={config.canvasSize.height}
          viewBox={`0 0 ${config.canvasSize.width} ${config.canvasSize.height}`}
        >
          {/* Background */}
          <rect width="100%" height="100%" fill="rgba(15,23,42,0.3)" />

          {/* Square on side a (bottom, along base) */}
          <rect
            x={t.ax}
            y={t.ay}
            width={sqA}
            height={sqA}
            fill="rgba(239,68,68,0.12)"
            stroke="rgba(239,68,68,0.4)"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <text
            x={t.ax + sqA / 2}
            y={t.ay + sqA / 2 + 5}
            fill="rgba(239,68,68,0.7)"
            fontSize={14}
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="bold"
          >
            a² = {state.aSquared}
          </text>

          {/* Square on side b (left, along height) */}
          <rect
            x={t.ax - sqB}
            y={t.cy}
            width={sqB}
            height={sqB}
            fill="rgba(59,130,246,0.12)"
            stroke="rgba(59,130,246,0.4)"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <text
            x={t.ax - sqB / 2}
            y={t.cy + sqB / 2 + 5}
            fill="rgba(59,130,246,0.7)"
            fontSize={14}
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="bold"
          >
            b² = {state.bSquared}
          </text>

          {/* Square on hypotenuse c (rotated) */}
          <g transform={`rotate(${hypAngleDeg}, ${t.cx}, ${t.cy})`}>
            <rect
              x={t.cx}
              y={t.cy - sqC}
              width={sqC}
              height={sqC}
              fill="rgba(34,197,94,0.1)"
              stroke="rgba(34,197,94,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
            <text
              x={t.cx + sqC / 2}
              y={t.cy - sqC / 2 + 5}
              fill="rgba(34,197,94,0.7)"
              fontSize={14}
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="bold"
              transform={`rotate(${-hypAngleDeg}, ${t.cx + sqC / 2}, ${t.cy - sqC / 2 + 5})`}
            >
              c² = {state.cSquared.toFixed(1)}
            </text>
          </g>

          {/* Triangle */}
          <polygon
            points={`${t.ax},${t.ay} ${t.bx},${t.by} ${t.cx},${t.cy}`}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Right angle marker */}
          <polyline
            points={`${t.ax + 15},${t.ay} ${t.ax + 15},${t.ay - 15} ${t.ax},${t.ay - 15}`}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1.5}
          />

          {/* Side labels */}
          {/* Side a (base) */}
          <text
            x={(t.ax + t.bx) / 2}
            y={t.ay - 10}
            fill="rgba(239,68,68,0.9)"
            fontSize={16}
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="bold"
          >
            a = {state.a}
          </text>

          {/* Side b (height) */}
          <text
            x={t.ax - 15}
            y={(t.ay + t.cy) / 2 + 5}
            fill="rgba(59,130,246,0.9)"
            fontSize={16}
            textAnchor="end"
            fontFamily="monospace"
            fontWeight="bold"
          >
            b = {state.b}
          </text>

          {/* Hypotenuse c */}
          <text
            x={(t.bx + t.cx) / 2 + 15}
            y={(t.by + t.cy) / 2}
            fill="rgba(34,197,94,0.9)"
            fontSize={16}
            fontFamily="monospace"
            fontWeight="bold"
          >
            c = {state.c.toFixed(2)}
          </text>

          {/* Equation display */}
          <g>
            <rect x={510} y={380} width={260} height={100} rx={10}
              fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

            <text x={640} y={410}
              fill="rgba(255,255,255,0.7)" fontSize={14}
              textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              <tspan fill="rgba(239,68,68,0.8)">{state.a}²</tspan>
              <tspan fill="rgba(255,255,255,0.5)"> + </tspan>
              <tspan fill="rgba(59,130,246,0.8)">{state.b}²</tspan>
              <tspan fill="rgba(255,255,255,0.5)"> = </tspan>
              <tspan fill="rgba(34,197,94,0.8)">{state.c.toFixed(2)}²</tspan>
            </text>

            <text x={640} y={438}
              fill="rgba(255,255,255,0.5)" fontSize={14}
              textAnchor="middle" fontFamily="monospace">
              <tspan fill="rgba(239,68,68,0.7)">{state.aSquared}</tspan>
              <tspan fill="rgba(255,255,255,0.4)"> + </tspan>
              <tspan fill="rgba(59,130,246,0.7)">{state.bSquared}</tspan>
              <tspan fill="rgba(255,255,255,0.4)"> = </tspan>
              <tspan fill="rgba(34,197,94,0.7)">{state.cSquared.toFixed(1)}</tspan>
            </text>

            {/* Pythagorean triple badge */}
            {state.isTriple && (
              <text x={640} y={465}
                fill="rgba(251,191,36,0.7)" fontSize={11}
                textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
                পিথাগোরিয়ান ত্রয়ী (3, 4, 5)
              </text>
            )}
          </g>

          {/* Angle labels */}
          <text
            x={t.bx - 5}
            y={t.by - 8}
            fill="rgba(255,255,255,0.4)"
            fontSize={11}
            textAnchor="end"
            fontFamily="monospace"
          >
            {state.angleB.toFixed(1)}°
          </text>
          <text
            x={t.cx + 12}
            y={t.cy + 18}
            fill="rgba(255,255,255,0.4)"
            fontSize={11}
            fontFamily="monospace"
          >
            {state.angleA.toFixed(1)}°
          </text>
          <text
            x={t.ax + 20}
            y={t.ay - 3}
            fill="rgba(255,255,255,0.4)"
            fontSize={11}
            fontFamily="monospace"
          >
            90°
          </text>

          {/* Title watermark */}
          <text
            x={400} y={25}
            fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
            পিথাগোরাসের উপপাদ্য
          </text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
