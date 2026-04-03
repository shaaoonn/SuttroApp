'use client';

import { useRef } from 'react';
import { useSimulation } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';

// ─────────────────────────────────────────────
// Template Simulation Player
// Copy this folder, rename, and customize.
//
// DO NOT modify: PlayerShell, BottomToolbar, PanZoomContainer
// DO customize: useSimulation hook, canvas content, config.ts
// ─────────────────────────────────────────────

export default function TemplateSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, computed, setVariable, resetAll, config } = useSimulation();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  // ⬇️ CONVERT computed values to ReadoutPanel entries
  // Example for Ohm's Law:
  // const readouts = [
  //   { id: 'current', label: { bn: 'কারেন্ট', en: 'Current' }, value: computed.current, unit: 'A', decimals: 2 },
  //   { id: 'power', label: { bn: 'পাওয়ার', en: 'Power' }, value: computed.power, unit: 'W', decimals: 2 },
  // ];
  const readouts = Object.entries(computed).map(([key, value]) => ({
    id: key,
    label: { bn: key, en: key },
    value,
    unit: '',
    decimals: 2,
  }));

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
        {/* ⬇️ ADD YOUR SIMULATION VISUAL ELEMENTS HERE */}
        {/* Example: circuit components, molecules, cells */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: config.canvasSize.width / 2 - 120,
            top: config.canvasSize.height / 2 - 20,
            width: 240,
            height: 40,
          }}
        >
          <span
            className="text-sm opacity-30"
            style={{ color: 'var(--player-text)' }}
          >
            সিমুলেশন এলিমেন্ট এখানে যোগ করো
          </span>
        </div>
      </PanZoomContainer>
    </PlayerShell>
  );
}
