'use client';

import { useRef } from 'react';
import { useLightRefraction } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import MediaBoundary from './components/MediaBoundary';
import RefractionRays from './components/RefractionRays';
import AngleDisplay from './components/AngleDisplay';

// ─────────────────────────────────────────────
// আলোর প্রতিসরণ (Light Refraction) Simulation
// NCTB Class 9, Chapter 10
// Snell's Law, Critical Angle, Total Internal Reflection
// ─────────────────────────────────────────────

export default function LightRefractionSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    variables, computed, setVariable, resetAll, swapMedia,
    config, geometry, n1, n2,
  } = useLightRefraction();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const readouts = [
    {
      id: 'incidence',
      label: { bn: 'আপতন কোণ (θ₁)', en: 'Incidence' },
      value: variables.incidenceAngle,
      unit: '°',
      decimals: 0,
    },
    ...(geometry.refractionAngle !== null && !geometry.isTIR
      ? [{
          id: 'refraction',
          label: { bn: 'প্রতিসরণ কোণ (θ₂)', en: 'Refraction' },
          value: geometry.refractionAngle,
          unit: '°',
          decimals: 1,
        }]
      : [{
          id: 'tir',
          label: { bn: 'অবস্থা', en: 'State' },
          value: 0,
          unit: 'TIR',
          decimals: 0,
        }]
    ),
    ...(geometry.criticalAngle !== null
      ? [{
          id: 'critical',
          label: { bn: 'ক্রান্তি কোণ (θc)', en: 'Critical Angle' },
          value: geometry.criticalAngle,
          unit: '°',
          decimals: 1,
        }]
      : []
    ),
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
        {/* Two media regions with boundary */}
        <MediaBoundary
          canvasWidth={config.canvasSize.width}
          canvasHeight={config.canvasSize.height}
          boundaryY={geometry.boundaryY}
          medium1Color={geometry.medium1Color}
          medium2Color={geometry.medium2Color}
          n1={n1}
          n2={n2}
          isDenseToRare={geometry.isDenseToRare}
          onSwap={swapMedia}
        />

        {/* Normal line + angle arcs */}
        <AngleDisplay
          centerX={geometry.centerX}
          boundaryY={geometry.boundaryY}
          normalTopY={geometry.normalTopY}
          normalBottomY={geometry.normalBottomY}
          incidenceAngle={geometry.incidenceAngle}
          refractionAngle={geometry.refractionAngle}
          criticalAngle={geometry.criticalAngle}
          isTIR={geometry.isTIR}
        />

        {/* Light rays */}
        <RefractionRays
          centerX={geometry.centerX}
          boundaryY={geometry.boundaryY}
          incidentStartX={geometry.incidentStartX}
          incidentStartY={geometry.incidentStartY}
          refractedEndX={geometry.refractedEndX}
          refractedEndY={geometry.refractedEndY}
          reflectedEndX={geometry.reflectedEndX}
          reflectedEndY={geometry.reflectedEndY}
          isTIR={geometry.isTIR}
          reflectionIntensity={geometry.reflectionIntensity}
        />
      </PanZoomContainer>
    </PlayerShell>
  );
}
