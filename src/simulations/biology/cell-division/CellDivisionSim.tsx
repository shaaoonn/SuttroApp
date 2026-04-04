'use client';

import { useRef } from 'react';
import { useCellDivision } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useSimNarration, useSoundToggle } from '@/hooks/useSimNarration';
import { SIM_NARRATIONS } from '@/data/simNarrations';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import Cell from './components/Cell';
import PhaseTimeline from './components/PhaseTimeline';

// ─────────────────────────────────────────────
// কোষ বিভাজন — মাইটোসিস (Cell Division — Mitosis)
// NCTB Class 9, Chapter 2
// Interactive mitosis phases visualization
// ─────────────────────────────────────────────

export default function CellDivisionSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    variables, state, setVariable, resetAll,
    nextPhase, prevPhase, config,
  } = useCellDivision();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();
  const { soundEnabled, toggleSound } = useSoundToggle();
  useSimNarration({ template: SIM_NARRATIONS['cell-division'], values: variables, soundEnabled });

  const readouts = [
    {
      id: 'phase',
      label: { bn: 'বর্তমান ধাপ', en: 'Current Phase' },
      value: state.phaseIndex + 1,
      unit: `/ 6`,
      decimals: 0,
    },
    {
      id: 'chromosomes',
      label: { bn: 'ক্রোমোজোম (2n)', en: 'Chromosomes (2n)' },
      value: 4,
      unit: '',
      decimals: 0,
    },
  ];

  const cellCX = 400;
  const cellCY = 270;

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

          {/* Cell visualization */}
          <Cell
            cx={cellCX}
            cy={cellCY}
            radius={100}
            state={state}
          />

          {/* Phase name badge */}
          <g>
            <rect
              x={cellCX - 70} y={30}
              width={140} height={36}
              rx={18}
              fill={state.phase.color}
              opacity={0.2}
            />
            <rect
              x={cellCX - 70} y={30}
              width={140} height={36}
              rx={18}
              fill="none"
              stroke={state.phase.color}
              strokeWidth={1.5}
              opacity={0.5}
            />
            <text
              x={cellCX} y={53}
              fill={state.phase.color}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-hind-siliguri)"
            >
              {state.phase.name.bn}
            </text>
          </g>

          {/* English phase name */}
          <text
            x={cellCX} y={80}
            fill="rgba(255,255,255,0.3)"
            fontSize={11}
            textAnchor="middle"
          >
            {state.phase.name.en}
          </text>

          {/* Phase description box */}
          <g>
            <rect
              x={30} y={480}
              width={460} height={50}
              rx={8}
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={50} y={510}
              fill="rgba(255,255,255,0.6)"
              fontSize={12}
              fontFamily="var(--font-hind-siliguri)"
            >
              {state.phase.description}
            </text>
          </g>

          {/* Navigation buttons */}
          <g>
            {/* Previous */}
            <g
              style={{ cursor: state.phaseIndex > 0 ? 'pointer' : 'default' }}
              onClick={prevPhase}
              opacity={state.phaseIndex > 0 ? 0.8 : 0.2}
            >
              <rect x={cellCX - 170} y={cellCY - 18} width={36} height={36}
                rx={18} fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <text x={cellCX - 152} y={cellCY + 5}
                fill="rgba(255,255,255,0.6)" fontSize={18}
                textAnchor="middle" fontFamily="monospace">
                ‹
              </text>
            </g>

            {/* Next */}
            <g
              style={{ cursor: state.phaseIndex < 5 ? 'pointer' : 'default' }}
              onClick={nextPhase}
              opacity={state.phaseIndex < 5 ? 0.8 : 0.2}
            >
              <rect x={cellCX + 134} y={cellCY - 18} width={36} height={36}
                rx={18} fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <text x={cellCX + 152} y={cellCY + 5}
                fill="rgba(255,255,255,0.6)" fontSize={18}
                textAnchor="middle" fontFamily="monospace">
                ›
              </text>
            </g>
          </g>

          {/* Phase Timeline (bottom) */}
          <PhaseTimeline
            x={80}
            y={545}
            width={640}
            currentPhase={state.phaseIndex}
            onPhaseClick={(p) => setVariable('phase', p)}
          />

          {/* Legend */}
          <g>
            <rect x={570} y={460} width={200} height={80}
              rx={8} fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

            <text x={585} y={480} fill="rgba(255,255,255,0.5)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              চিহ্ন
            </text>

            <circle cx={585} cy={495} r={4} fill="rgba(5,150,105,0.5)" stroke="rgba(5,150,105,0.5)" strokeWidth={1} />
            <text x={596} y={499} fill="rgba(255,255,255,0.4)" fontSize={9}
              fontFamily="var(--font-hind-siliguri)">কোষ ঝিল্লি</text>

            <circle cx={585} cy={513} r={4} fill="rgba(99,102,241,0.4)" stroke="rgba(99,102,241,0.4)" strokeWidth={1} />
            <text x={596} y={517} fill="rgba(255,255,255,0.4)" fontSize={9}
              fontFamily="var(--font-hind-siliguri)">নিউক্লিয়াস</text>

            <line x1={580} y1={530} x2={590} y2={530}
              stroke="#60A5FA" strokeWidth={3} strokeLinecap="round" />
            <text x={596} y={534} fill="rgba(255,255,255,0.4)" fontSize={9}
              fontFamily="var(--font-hind-siliguri)">ক্রোমোজোম</text>
          </g>

          {/* Title watermark */}
          <text
            x={400} y={20}
            fill="rgba(255,255,255,0.06)"
            fontSize={16}
            textAnchor="middle"
            fontFamily="var(--font-hind-siliguri)"
          >
            কোষ বিভাজন — মাইটোসিস
          </text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
