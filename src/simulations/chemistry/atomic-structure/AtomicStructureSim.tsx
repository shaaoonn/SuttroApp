'use client';

import { useRef } from 'react';
import { useAtomicStructure } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import Nucleus from './components/Nucleus';
import ElectronShells from './components/ElectronShells';
import ElementInfo from './components/ElementInfo';

// ─────────────────────────────────────────────
// পরমাণুর গঠন — বোর মডেল (Atomic Structure)
// NCTB Class 9, Chapter 3
// Interactive Bohr model with animated electrons
// ─────────────────────────────────────────────

const SHELL_NAMES = ['K', 'L', 'M', 'N'];

export default function AtomicStructureSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = useAtomicStructure();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const { element } = state;

  const readouts = [
    {
      id: 'z',
      label: { bn: 'পারমাণবিক সংখ্যা', en: 'Atomic Number' },
      value: element.z,
      unit: '',
      decimals: 0,
    },
    {
      id: 'mass',
      label: { bn: 'পারমাণবিক ভর', en: 'Atomic Mass' },
      value: element.mass,
      unit: 'u',
      decimals: 0,
    },
    {
      id: 'valence',
      label: { bn: 'যোজ্যতা ইলেকট্রন', en: 'Valence Electrons' },
      value: state.valenceElectrons,
      unit: '',
      decimals: 0,
    },
    {
      id: 'shells',
      label: { bn: 'শেল সংখ্যা', en: 'Shell Count' },
      value: element.shells.length,
      unit: '',
      decimals: 0,
    },
  ];

  // Center of atom in canvas
  const atomCX = 400;
  const atomCY = 300;

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

          {/* Electron shells (orbits + electrons) */}
          <ElectronShells
            cx={atomCX}
            cy={atomCY}
            shellRadii={state.shellRadii}
            shellElectrons={state.shellElectrons}
          />

          {/* Nucleus */}
          <Nucleus
            cx={atomCX}
            cy={atomCY}
            radius={state.nucleusRadius}
            protons={element.z}
            neutrons={element.neutrons}
            symbol={element.symbol}
          />

          {/* Element info panel */}
          <ElementInfo
            x={20}
            y={380}
            state={state}
          />

          {/* Electron configuration visual (top area) */}
          <g>
            <rect
              x={550} y={20}
              width={230} height={30 + element.shells.length * 26}
              rx={8}
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={665} y={40}
              fill="rgba(255,255,255,0.5)"
              fontSize={10}
              textAnchor="middle"
              fontFamily="var(--font-hind-siliguri)"
              fontWeight="bold"
            >
              ইলেকট্রন বিন্যাস
            </text>

            {element.shells.map((count, i) => {
              const rowY = 58 + i * 26;
              const maxForShell = i === 0 ? 2 : 8;
              const fillWidth = (count / maxForShell) * 140;

              return (
                <g key={i}>
                  <text
                    x={568} y={rowY + 4}
                    fill="rgba(255,255,255,0.5)"
                    fontSize={11}
                    fontFamily="monospace"
                  >
                    {SHELL_NAMES[i]}
                  </text>

                  {/* Background bar */}
                  <rect
                    x={590} y={rowY - 8}
                    width={140} height={16}
                    rx={4}
                    fill="rgba(255,255,255,0.05)"
                  />

                  {/* Fill bar */}
                  <rect
                    x={590} y={rowY - 8}
                    width={fillWidth} height={16}
                    rx={4}
                    fill={['rgba(96,165,250,0.4)', 'rgba(52,211,153,0.4)', 'rgba(251,191,36,0.4)', 'rgba(244,114,182,0.4)'][i]}
                  />

                  <text
                    x={740} y={rowY + 4}
                    fill="rgba(255,255,255,0.6)"
                    fontSize={11}
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {count}/{maxForShell}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Legend */}
          <g>
            <circle cx={570} cy={555} r={5} fill="rgba(239,68,68,0.8)" />
            <text x={582} y={559} fill="rgba(255,255,255,0.4)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)">প্রোটন (+)</text>

            <circle cx={660} cy={555} r={5} fill="rgba(156,163,175,0.7)" />
            <text x={672} y={559} fill="rgba(255,255,255,0.4)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)">নিউট্রন (0)</text>

            <circle cx={750} cy={555} r={4} fill="#60A5FA" />
            <text x={760} y={559} fill="rgba(255,255,255,0.4)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)">ইলেকট্রন (−)</text>
          </g>

          {/* Noble gas badge */}
          {state.isNobleGas && (
            <g>
              <rect
                x={atomCX - 55} y={atomCY + state.shellRadii[state.shellRadii.length - 1] + 20}
                width={110} height={26}
                rx={13}
                fill="rgba(251,191,36,0.15)"
                stroke="rgba(251,191,36,0.3)"
                strokeWidth={1}
              />
              <text
                x={atomCX} y={atomCY + state.shellRadii[state.shellRadii.length - 1] + 37}
                fill="rgba(251,191,36,0.8)"
                fontSize={11}
                textAnchor="middle"
                fontFamily="var(--font-hind-siliguri)"
                fontWeight="bold"
              >
                নিষ্ক্রিয় গ্যাস
              </text>
            </g>
          )}

          {/* Title watermark */}
          <text
            x={400} y={25}
            fill="rgba(255,255,255,0.06)"
            fontSize={16}
            textAnchor="middle"
            fontFamily="var(--font-hind-siliguri)"
          >
            পরমাণুর গঠন — বোর মডেল
          </text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
