'use client';

import { useRef } from 'react';
import { useOhmsLaw } from './useOhmsLaw';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import Battery from './components/Battery';
import Resistor from './components/Resistor';
import Bulb from './components/Bulb';
import Ammeter from './components/Ammeter';
import ElectronFlow from './components/ElectronFlow';

// ─────────────────────────────────────────────
// Ohm's Law Simulation — সূত্র Flagship
// NCTB Class 9, Chapter 11 (চল তড়িৎ)
//
// Circuit: Battery → Wire → Resistor → Bulb → Ammeter → Wire → Battery
// Variables: Voltage (V), Resistance (Ω)
// Computed: Current (A), Power (W)
// Visual: Bulb brightness, electron flow speed, ammeter needle
// ─────────────────────────────────────────────

// Circuit layout positions (centered in 900×600 canvas)
const LAYOUT = {
  battery: { x: 120, y: 200 },
  resistor: { x: 370, y: 120 },
  bulb: { x: 620, y: 195 },
  ammeter: { x: 370, y: 380 },
};

// Wire paths for electron flow animation
const WIRE_TOP: [number, number][] = [
  [160, 200], [160, 140], [370, 140], [430, 140], [650, 140], [650, 200],
];
const WIRE_BOTTOM: [number, number][] = [
  [650, 280], [650, 400], [410, 400], [330, 400], [160, 400], [160, 300],
];

export default function OhmsLawSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    variables,
    computed,
    setVariable,
    resetAll,
    config,
    bulbBrightness,
    electronSpeed,
  } = useOhmsLaw();

  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const readouts = [
    {
      id: 'current',
      label: { bn: 'কারেন্ট', en: 'Current' },
      value: computed.current,
      unit: 'A',
      decimals: 3,
    },
    {
      id: 'power',
      label: { bn: 'পাওয়ার', en: 'Power' },
      value: computed.power,
      unit: 'W',
      decimals: 2,
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
        {/* ── Wires (SVG lines connecting components) ── */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: config.canvasSize.width, height: config.canvasSize.height }}
        >
          <polyline
            points={WIRE_TOP.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="var(--canvas-wire)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.6}
          />
          <polyline
            points={WIRE_BOTTOM.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="var(--canvas-wire)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.6}
          />
        </svg>

        {/* ── Electron Flow ── */}
        <ElectronFlow path={WIRE_TOP} speed={electronSpeed} count={5} />
        <ElectronFlow path={WIRE_BOTTOM} speed={electronSpeed} count={5} />

        {/* ── Circuit Components ── */}
        <div className="absolute" style={{ left: LAYOUT.battery.x - 40, top: LAYOUT.battery.y - 50 }}>
          <Battery voltage={variables.voltage} />
        </div>
        <div className="absolute" style={{ left: LAYOUT.resistor.x - 60, top: LAYOUT.resistor.y - 30 }}>
          <Resistor resistance={variables.resistance} />
        </div>
        <div className="absolute" style={{ left: LAYOUT.bulb.x - 35, top: LAYOUT.bulb.y - 40 }}>
          <Bulb brightness={bulbBrightness} />
        </div>
        <div className="absolute" style={{ left: LAYOUT.ammeter.x - 40, top: LAYOUT.ammeter.y - 40 }}>
          <Ammeter current={computed.current} />
        </div>

        {/* ── Hint text ── */}
        <div
          className="absolute text-center"
          style={{ left: config.canvasSize.width / 2 - 140, top: config.canvasSize.height / 2 - 15, width: 280 }}
        >
          <p className="text-xs" style={{ color: 'var(--player-muted)' }}>
            ভোল্টেজ ও রোধ পরিবর্তন করো — দেখো কারেন্ট কীভাবে বদলায়!
          </p>
        </div>
      </PanZoomContainer>
    </PlayerShell>
  );
}
