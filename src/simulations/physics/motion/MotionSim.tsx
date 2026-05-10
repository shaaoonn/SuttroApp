'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotion } from './useMotion';
import EquationTabs from './components/EquationTabs';
import ErrorBanner from './components/ErrorBanner';
import FormulaDropdown from './components/FormulaDropdown';
import FreeFallScene from './components/FreeFallScene';
import FullscreenSidePanel from './components/FullscreenSidePanel';
import KinematicGraph from './components/KinematicGraph';
import LayerToggles from './components/LayerToggles';
import ModeSwitch from './components/ModeSwitch';
import ResultDisplay from './components/ResultDisplay';
import RoadScene from './components/RoadScene';
import SimSettings from './components/SimSettings';
import StepDerivation from './components/StepDerivation';
import TutorialFAB from './components/TutorialFAB';
import { motionConfig } from './config';

// ─────────────────────────────────────────────
// গতি Sim — main entry.
// Desktop: scene LEFT (flex-1) + side panel RIGHT (380px).
// Mobile: stacked, scene first.
// Fullscreen: scene only — controls move into scene overlay.
// ─────────────────────────────────────────────

const SUBJECT_BN: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export interface MotionSimProps {
  videoUrl?: string;
}

export default function MotionSim({ videoUrl }: MotionSimProps = {}) {
  const { state, derived, actions } = useMotion();
  const { equationDef, variant, duration, liveTime, liveS, liveV } = derived;

  const isFreefall = state.equation === 'freefall';
  const activeVars = equationDef.vars;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      // On exit: bring the sim back into view (browser sometimes restores
      // scroll position to where the user was BEFORE entering fullscreen,
      // leaving the sim off-screen below).
      if (!isFs) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 80);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
        .then(() => {
          const isMobile =
            typeof navigator !== 'undefined' &&
            /Mobi|Android|iPhone/i.test(navigator.userAgent);
          if (isMobile && screen.orientation && 'lock' in screen.orientation) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (screen.orientation as any).lock?.('landscape').catch(() => {});
          }
        })
        .catch(() => {});
    } else {
      if (screen.orientation && 'unlock' in screen.orientation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (screen.orientation as any).unlock?.();
      }
      document.exitFullscreen().catch(() => {});
    }
  };

  // Common scene-wrapper props (used in both fullscreen + normal mode)
  const sceneCommonProps = {
    values: state.values,
    vehicle: state.vehicle,
    liveTime,
    liveS,
    liveV,
    duration,
    layers: state.layers,
    zoom: state.zoom,
    mode: state.mode,
    unknown: state.unknown,
    activeVars,
    onValueChange: actions.setValue,
    onVehicleChange: actions.setVehicle,
    playbackStatus: state.playback.status,
    onPlay: actions.play,
    onPause: actions.pause,
    onReset: actions.reset,
    onZoomChange: actions.setZoom,
    onToggleFullscreen: toggleFullscreen,
    distanceUnit: state.distanceUnit,
    textScale: state.textScale,
    isFullscreen,
    // Ghost compare controls — now part of the floating overlay pill
    ghostCount: state.ghosts.length,
    onSaveGhost: actions.saveGhost,
    onClearGhosts: actions.clearGhosts,
  };

  const sceneNode = isFreefall ? (
    <FreeFallScene {...sceneCommonProps} />
  ) : (
    <RoadScene {...sceneCommonProps} ghosts={state.ghosts} />
  );

  // Variant of sceneNode that suppresses the in-canvas Play/Reset overlay —
  // used in fullscreen where we render an external bar below the canvas instead.
  const sceneNodeNoOverlay = isFreefall ? (
    <FreeFallScene {...sceneCommonProps} hideOverlayControls />
  ) : (
    <RoadScene
      {...sceneCommonProps}
      ghosts={state.ghosts}
      hideOverlayControls
    />
  );

  // ─── FULLSCREEN MODE — scene 4/5 + side rail 1/5 ───
  // The floating overlay pill (now bottom-right of scene) hosts ALL
  // playback controls including fullscreen-exit, so no separate bar.
  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="motion-sim relative w-full h-full flex flex-row"
        style={{ background: '#000' }}
      >
        {/* Scene column — overlay controls are inside the scene component */}
        <div className="flex flex-col flex-[4] min-w-0 relative">
          {sceneNode}
        </div>

        {/* Right rail (1/5, compact) */}
        <div
          className="flex flex-col flex-[1] min-w-[180px] max-w-[280px] h-full"
          style={{ background: 'rgba(255, 255, 255, 0.96)', zoom: state.textScale }}
        >
          <FullscreenSidePanel
            mode={state.mode}
            equation={state.equation}
            variantIndex={state.variantIndex}
            onVariantChange={actions.setVariant}
            values={state.values}
            unknown={state.unknown}
            lastResult={state.lastResult}
            error={state.error}
            liveTime={liveTime}
            liveV={liveV}
            liveS={liveS}
            duration={duration}
            layers={state.layers}
            onToggleLayer={actions.toggleLayer}
            isFreefall={isFreefall}
            distanceUnit={state.distanceUnit}
          />
        </div>

        <TutorialFAB videoUrl={videoUrl} />
      </div>
    );
  }

  // ─── NORMAL MODE — top bar + tabs + scene/right grid + below content ───
  return (
    <div
      ref={containerRef}
      className="motion-sim relative w-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #DBEAFE 50%, #F0F9FF 100%)',
        color: '#1E293B',
      }}
    >
      {/* ═══ TOP BAR ═══ */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 lg:px-5 lg:py-2.5 flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-2 min-w-0 flex-1">
          {/* Mobile: stacked. Title 1.5× bigger per latest feedback. */}
          <div
            className="text-[10px] font-medium leading-none truncate lg:hidden"
            style={{ color: '#94A3B8' }}
          >
            {SUBJECT_BN[motionConfig.subject]} · অধ্যায় {motionConfig.nctb.chapter}
          </div>
          <div
            className="font-bold leading-tight truncate text-xl lg:hidden"
            style={{ color: '#1E293B' }}
          >
            {motionConfig.title.bn}
          </div>
          {/* Desktop: single line, larger. Title 1.5× bigger. */}
          <div className="hidden lg:flex items-baseline gap-3 truncate">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ color: '#1E293B' }}
            >
              {motionConfig.title.bn}
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              {SUBJECT_BN[motionConfig.subject]} · NCTB অধ্যায় {motionConfig.nctb.chapter}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SimSettings
            textScale={state.textScale}
            onTextScaleChange={actions.setTextScale}
            distanceUnit={state.distanceUnit}
            onDistanceUnitChange={actions.setDistanceUnit}
          />
          <ModeSwitch mode={state.mode} onChange={actions.setMode} />
        </div>
      </div>

      {/* ═══ Equation tabs ═══ */}
      <div className="px-3 py-2 lg:px-5 lg:py-2 flex-shrink-0">
        <EquationTabs current={state.equation} onChange={actions.setEquation} />
      </div>

      {/* ═══ Main: scene LEFT + side panel RIGHT (desktop) / stacked (mobile) ═══ */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 px-3 lg:px-5 pb-3 lg:pb-4">
        {/* SCENE column */}
        <div className="flex flex-col gap-2 lg:flex-1 lg:min-w-0">
          <div
            className="rounded-xl lg:rounded-2xl overflow-hidden w-full mx-auto aspect-[4/5] lg:aspect-[16/9]"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.85)',
              maxHeight: '720px',
            }}
          >
            {sceneNode}
          </div>

          {/* All controls (Play/Reset/Zoom/Fullscreen/Ghost) are now floating
              at bottom-right of the canvas via SceneOverlayControls.
              Speed control removed entirely — animation always plays at 1× real time. */}
        </div>

        {/* RIGHT side panel — formulas, derivation, result, layers, graphs.
            CSS zoom = textScale lets teachers scale ALL right-panel content
            at once (formulas, sliders, results, graphs) for projector use. */}
        <div
          className="flex flex-col gap-2 lg:w-[360px] flex-shrink-0 lg:overflow-y-auto lg:max-h-[calc(100vh-160px)] lg:pr-1"
          style={{ zoom: state.textScale }}
        >
          {state.mode === 'solver' && (
            <FormulaDropdown
              equation={equationDef}
              variantIndex={state.variantIndex}
              onChange={actions.setVariant}
            />
          )}
          {state.mode === 'solver' && <StepDerivation variant={variant} />}

          <ResultDisplay
            liveTime={liveTime}
            liveV={liveV}
            liveS={liveS}
            unknown={state.unknown}
            values={state.values}
            lastResult={state.lastResult}
            error={state.error}
            mode={state.mode}
            distanceUnit={state.distanceUnit}
          />
          <ErrorBanner error={state.error} />

          <div>
            <div
              className="text-[10px] mb-1 font-semibold"
              style={{ color: '#94A3B8' }}
            >
              লেয়ার
            </div>
            <LayerToggles
              layers={state.layers}
              onToggle={actions.toggleLayer}
              isFreefall={isFreefall}
            />
          </div>

          {(state.layers.vGraph || state.layers.sGraph) && (
            <div className="grid grid-cols-1 gap-2">
              {state.layers.vGraph && (
                <KinematicGraph
                  variant="velocity"
                  values={state.values}
                  duration={duration}
                  liveTime={liveTime}
                  isFreefall={isFreefall}
                />
              )}
              {state.layers.sGraph && (
                <KinematicGraph
                  variant="displacement"
                  values={state.values}
                  duration={duration}
                  liveTime={liveTime}
                  isFreefall={isFreefall}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <TutorialFAB videoUrl={videoUrl} />
    </div>
  );
}
