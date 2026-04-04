'use client';

import { useRef } from 'react';
import { useCircleGeometry } from './useSimulation';
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
// বৃত্তের ক্ষেত্রফল ও পরিধি
// NCTB Class 9, Chapter 7
// Interactive circle with area/circumference
// ─────────────────────────────────────────────

export default function CircleGeometrySim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = useCircleGeometry();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();
  const { soundEnabled, toggleSound } = useSoundToggle();
  useSimNarration({ template: SIM_NARRATIONS['circle-geometry'], values: variables, soundEnabled });

  const cx = 320;
  const cy = 300;
  const r = state.pixelRadius;

  const readouts = [
    {
      id: 'area',
      label: { bn: 'ক্ষেত্রফল (πr²)', en: 'Area' },
      value: state.area,
      unit: 'sq',
      decimals: 2,
    },
    {
      id: 'circumference',
      label: { bn: 'পরিধি (2πr)', en: 'Circumference' },
      value: state.circumference,
      unit: '',
      decimals: 2,
    },
    {
      id: 'diameter',
      label: { bn: 'ব্যাস (2r)', en: 'Diameter' },
      value: state.diameter,
      unit: '',
      decimals: 1,
    },
  ];

  // Sectors to visualize area (π grid squares)
  const sectorCount = 12;

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

          {/* Grid */}
          <g opacity={0.08}>
            {Array.from({ length: 33 }, (_, i) => (
              <line key={`v-${i}`}
                x1={i * state.scale + cx - 16 * state.scale}
                y1={cy - 16 * state.scale}
                x2={i * state.scale + cx - 16 * state.scale}
                y2={cy + 16 * state.scale}
                stroke="white" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 33 }, (_, i) => (
              <line key={`h-${i}`}
                x1={cx - 16 * state.scale}
                y1={i * state.scale + cy - 16 * state.scale}
                x2={cx + 16 * state.scale}
                y2={i * state.scale + cy - 16 * state.scale}
                stroke="white" strokeWidth={0.5} />
            ))}
          </g>

          {/* Area fill (sectors) */}
          <circle cx={cx} cy={cy} r={r}
            fill="rgba(59,130,246,0.08)" />

          {/* Sector lines for visualization */}
          {Array.from({ length: sectorCount }, (_, i) => {
            const angle = (i / sectorCount) * Math.PI * 2;
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + r * Math.cos(angle)}
                y2={cy + r * Math.sin(angle)}
                stroke="rgba(59,130,246,0.15)"
                strokeWidth={0.5} />
            );
          })}

          {/* Circle (circumference) */}
          <circle cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(34,197,94,0.7)"
            strokeWidth={3}>
            <animate
              attributeName="stroke-dasharray"
              values={`0,${2 * Math.PI * r};${2 * Math.PI * r},0`}
              dur="3s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>

          {/* Center point */}
          <circle cx={cx} cy={cy} r={4}
            fill="rgba(239,68,68,0.8)"
            stroke="white" strokeWidth={1} />
          <text x={cx - 12} y={cy + 18}
            fill="rgba(239,68,68,0.6)" fontSize={11}
            fontFamily="monospace">O</text>

          {/* Radius line */}
          <line x1={cx} y1={cy} x2={cx + r} y2={cy}
            stroke="rgba(239,68,68,0.7)"
            strokeWidth={2} />
          <text x={cx + r / 2} y={cy - 10}
            fill="rgba(239,68,68,0.9)" fontSize={14}
            textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            r = {state.radius}
          </text>

          {/* Diameter line (dashed) */}
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
            stroke="rgba(251,191,36,0.4)"
            strokeWidth={1.5}
            strokeDasharray="6,4" />

          {/* Circumference label (along the circle) */}
          <text x={cx} y={cy - r - 12}
            fill="rgba(34,197,94,0.8)" fontSize={13}
            textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            পরিধি = 2πr = {state.circumference.toFixed(2)}
          </text>

          {/* Area label (inside circle) */}
          <text x={cx} y={cy + r / 3}
            fill="rgba(59,130,246,0.6)" fontSize={12}
            textAnchor="middle" fontFamily="monospace">
            ক্ষেত্রফল = πr²
          </text>
          <text x={cx} y={cy + r / 3 + 20}
            fill="rgba(59,130,246,0.8)" fontSize={14}
            textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            = {state.area.toFixed(2)}
          </text>

          {/* Calculation breakdown (right panel) */}
          <g>
            <rect x={560} y={120} width={210} height={260} rx={10}
              fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

            <text x={665} y={150}
              fill="rgba(255,255,255,0.6)" fontSize={12}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              হিসাব
            </text>

            {/* Radius */}
            <text x={580} y={180} fill="rgba(239,68,68,0.7)" fontSize={12} fontFamily="monospace">
              r = {state.radius}
            </text>

            {/* Diameter */}
            <text x={580} y={205} fill="rgba(251,191,36,0.7)" fontSize={12} fontFamily="monospace">
              d = 2r = 2 × {state.radius} = {state.diameter}
            </text>

            {/* Circumference */}
            <text x={580} y={240} fill="rgba(34,197,94,0.6)" fontSize={11}
              fontFamily="var(--font-hind-siliguri)">পরিধি:</text>
            <text x={580} y={258} fill="rgba(34,197,94,0.7)" fontSize={12} fontFamily="monospace">
              2πr = 2 × 3.14 × {state.radius}
            </text>
            <text x={580} y={276} fill="rgba(34,197,94,0.9)" fontSize={14} fontFamily="monospace" fontWeight="bold">
              = {state.circumference.toFixed(2)}
            </text>

            {/* Area */}
            <text x={580} y={306} fill="rgba(59,130,246,0.6)" fontSize={11}
              fontFamily="var(--font-hind-siliguri)">ক্ষেত্রফল:</text>
            <text x={580} y={324} fill="rgba(59,130,246,0.7)" fontSize={12} fontFamily="monospace">
              πr² = 3.14 × {state.radius}²
            </text>
            <text x={580} y={342} fill="rgba(59,130,246,0.7)" fontSize={12} fontFamily="monospace">
              = 3.14 × {state.radius * state.radius}
            </text>
            <text x={580} y={362} fill="rgba(59,130,246,0.9)" fontSize={14} fontFamily="monospace" fontWeight="bold">
              = {state.area.toFixed(2)}
            </text>
          </g>

          {/* Title watermark */}
          <text x={400} y={25}
            fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
            বৃত্তের ক্ষেত্রফল ও পরিধি
          </text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
