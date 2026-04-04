'use client';

import { useRef } from 'react';
import { useAcidBase } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useSimNarration, useSoundToggle } from '@/hooks/useSimNarration';
import { SIM_NARRATIONS } from '@/data/simNarrations';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import Beaker from './components/Beaker';
import PHScale from './components/PHScale';
import LitmusIndicator from './components/LitmusIndicator';
import ConcentrationInfo from './components/ConcentrationInfo';

// ─────────────────────────────────────────────
// অ্যাসিড-ক্ষার ও pH স্কেল (Acid-Base & pH Scale)
// NCTB Class 9, Chapter 5
// pH calculation, neutralization, litmus test
// ─────────────────────────────────────────────

export default function AcidBaseSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = useAcidBase();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();
  const { soundEnabled, toggleSound } = useSoundToggle();
  useSimNarration({ template: SIM_NARRATIONS['acid-base'], values: variables, soundEnabled });

  const readouts = [
    {
      id: 'ph',
      label: { bn: 'pH মান', en: 'pH Value' },
      value: state.pH,
      unit: '',
      decimals: 1,
    },
    {
      id: 'poh',
      label: { bn: 'pOH মান', en: 'pOH Value' },
      value: state.pOH,
      unit: '',
      decimals: 1,
    },
    {
      id: 'volume',
      label: { bn: 'মোট আয়তন', en: 'Total Volume' },
      value: state.totalVolume,
      unit: 'mL',
      decimals: 0,
    },
    {
      id: 'nature',
      label: { bn: 'দ্রবণের প্রকৃতি', en: 'Solution Nature' },
      value: state.pH,
      unit: state.nature === 'acid' ? 'অ্যাসিডিক' : state.nature === 'base' ? 'ক্ষারীয়' : 'প্রশম',
      decimals: 1,
    },
  ];

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
          {/* Background gradient */}
          <defs>
            <linearGradient id="labBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(15,23,42,0.3)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.5)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#labBg)" />

          {/* Lab bench line */}
          <line
            x1={0} y1={480}
            x2={800} y2={480}
            stroke="rgba(200,220,255,0.15)"
            strokeWidth={2}
          />

          {/* Beaker */}
          <Beaker
            x={160}
            y={200}
            width={140}
            height={260}
            fillRatio={state.fillRatio}
            solutionColor={state.solutionColor}
            acidVolume={variables.acidVolume ?? 0}
            baseVolume={variables.baseVolume ?? 0}
            totalVolume={state.totalVolume}
            nature={state.nature}
          />

          {/* Acid bottle label (left) */}
          <g>
            <rect x={40} y={120} width={70} height={55} rx={6}
              fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth={1} />
            <text x={75} y={143} fill="rgba(239,68,68,0.7)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              HCl
            </text>
            <text x={75} y={160} fill="rgba(239,68,68,0.5)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              অ্যাসিড
            </text>
            {/* Pouring indicator */}
            {(variables.acidVolume ?? 0) > 0 && (
              <line x1={95} y1={175} x2={175} y2={220}
                stroke="rgba(239,68,68,0.3)" strokeWidth={2} strokeDasharray="4,4">
                <animate attributeName="stroke-dashoffset" values="0;-8" dur="0.6s" repeatCount="indefinite" />
              </line>
            )}
          </g>

          {/* Base bottle label (right) */}
          <g>
            <rect x={350} y={120} width={70} height={55} rx={6}
              fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
            <text x={385} y={143} fill="rgba(59,130,246,0.7)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              NaOH
            </text>
            <text x={385} y={160} fill="rgba(59,130,246,0.5)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              ক্ষার
            </text>
            {/* Pouring indicator */}
            {(variables.baseVolume ?? 0) > 0 && (
              <line x1={365} y1={175} x2={295} y2={220}
                stroke="rgba(59,130,246,0.3)" strokeWidth={2} strokeDasharray="4,4">
                <animate attributeName="stroke-dashoffset" values="0;-8" dur="0.6s" repeatCount="indefinite" />
              </line>
            )}
          </g>

          {/* pH Scale */}
          <PHScale
            x={560}
            y={60}
            height={400}
            currentPH={state.pH}
            showSubstances={true}
          />

          {/* Litmus indicator */}
          <LitmusIndicator
            x={395}
            y={330}
            nature={state.nature}
            solutionColor={state.solutionColor}
            hasLiquid={state.totalVolume > 0}
          />

          {/* Concentration info box */}
          <ConcentrationInfo
            x={30}
            y={500}
            state={state}
          />

          {/* Neutralization equation when both are present */}
          {(variables.acidVolume ?? 0) > 0 && (variables.baseVolume ?? 0) > 0 && (
            <g>
              <rect
                x={260} y={505}
                width={270} height={34}
                rx={6}
                fill="rgba(34,197,94,0.1)"
                stroke="rgba(34,197,94,0.2)"
                strokeWidth={1}
              />
              <text
                x={395} y={527}
                fill="rgba(34,197,94,0.7)"
                fontSize={12}
                textAnchor="middle"
                fontFamily="monospace"
              >
                HCl + NaOH → NaCl + H₂O
              </text>
            </g>
          )}

          {/* Title watermark */}
          <text
            x={400} y={30}
            fill="rgba(255,255,255,0.08)"
            fontSize={18}
            textAnchor="middle"
            fontFamily="var(--font-hind-siliguri)"
          >
            অ্যাসিড-ক্ষার ও pH স্কেল
          </text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
