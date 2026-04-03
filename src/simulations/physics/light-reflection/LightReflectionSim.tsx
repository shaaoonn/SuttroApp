'use client';

import { useRef } from 'react';
import { useLightReflection } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import Mirror from './components/Mirror';
import LightRay from './components/LightRay';
import NormalLine from './components/NormalLine';
import AngleArcs from './components/AngleArcs';

// ─────────────────────────────────────────────
// আলোর প্রতিফলন (Light Reflection) Simulation
// NCTB Class 9, Chapter 10
// θᵢ = θᵣ — angle of incidence = angle of reflection
// ─────────────────────────────────────────────

export default function LightReflectionSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, computed, setVariable, resetAll, config, geometry } = useLightReflection();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const readouts = [
    {
      id: 'incidenceAngle',
      label: { bn: 'আপতন কোণ (θᵢ)', en: 'Angle of Incidence' },
      value: variables.incidenceAngle,
      unit: '°',
      decimals: 0,
    },
    {
      id: 'reflectionAngle',
      label: { bn: 'প্রতিফলন কোণ (θᵣ)', en: 'Angle of Reflection' },
      value: computed.reflectionAngle,
      unit: '°',
      decimals: 0,
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
        {/* Mirror surface */}
        <Mirror
          startX={geometry.mirrorStartX}
          startY={geometry.mirrorStartY}
          endX={geometry.mirrorEndX}
          endY={geometry.mirrorEndY}
        />

        {/* Normal line (perpendicular to mirror) */}
        <NormalLine
          centerX={geometry.mirrorCenterX}
          topY={geometry.normalTopY}
          bottomY={geometry.normalBottomY}
          mirrorY={geometry.mirrorCenterY}
        />

        {/* Angle arcs with labels */}
        <AngleArcs
          centerX={geometry.mirrorCenterX}
          centerY={geometry.mirrorCenterY}
          incidenceAngle={geometry.incidenceAngle}
          reflectionAngle={geometry.reflectionAngle}
        />

        {/* Light rays (incident + reflected) */}
        <LightRay
          incidentStartX={geometry.incidentStartX}
          incidentStartY={geometry.incidentStartY}
          mirrorCenterX={geometry.mirrorCenterX}
          mirrorCenterY={geometry.mirrorCenterY}
          reflectedEndX={geometry.reflectedEndX}
          reflectedEndY={geometry.reflectedEndY}
        />
      </PanZoomContainer>
    </PlayerShell>
  );
}
