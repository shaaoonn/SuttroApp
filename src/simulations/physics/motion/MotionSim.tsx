'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMotion } from './useMotion';
import EquationTabs from './components/EquationTabs';
import ErrorBanner from './components/ErrorBanner';
import FormulaDropdown from './components/FormulaDropdown';
import FreeFallScene from './components/FreeFallScene';
import KinematicGraph from './components/KinematicGraph';
import LayerToggles from './components/LayerToggles';
import ModeSwitch from './components/ModeSwitch';
import PlaybackBar from './components/PlaybackBar';
import ResultDisplay from './components/ResultDisplay';
import RoadScene from './components/RoadScene';
import StepDerivation from './components/StepDerivation';
import TutorialFAB from './components/TutorialFAB';
import { motionConfig } from './config';

// ─────────────────────────────────────────────
// গতি Sim main entry — top bar / scene / circle controls / formula+graphs
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

  // Track fullscreen state changes
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
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
          // Mobile: try to lock landscape
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
      // Release lock + exit
      if (screen.orientation && 'unlock' in screen.orientation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (screen.orientation as any).unlock?.();
      }
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="motion-sim relative w-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #DBEAFE 50%, #F0F9FF 100%)',
        color: '#1E293B',
      }}
    >
      {/* ═══ TOP BAR — Back / Title / ModeSwitch ═══ */}
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 lg:px-4 lg:py-2 flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        {/* Left — Back button */}
        <Link
          href="/simulations"
          className="rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"
          style={{
            width: '32px',
            height: '32px',
            color: '#475569',
            flexShrink: 0,
          }}
          title="ফেরত যাও"
          aria-label="Back to simulations"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        {/* Center — Subject · Chapter · Title */}
        <div className="flex flex-col items-center min-w-0 flex-1">
          <div
            className="text-[10px] font-medium leading-none truncate"
            style={{ color: '#94A3B8' }}
          >
            {SUBJECT_BN[motionConfig.subject]} · অধ্যায় {motionConfig.nctb.chapter}
          </div>
          <div
            className="font-bold leading-tight truncate text-sm lg:text-base"
            style={{ color: '#1E293B' }}
          >
            {motionConfig.title.bn}
          </div>
        </div>

        {/* Right — Mode switch */}
        <ModeSwitch mode={state.mode} onChange={actions.setMode} />
      </div>

      {/* ═══ Equation tabs ═══ */}
      <div className="px-2 py-1.5 lg:px-4 lg:py-2 flex-shrink-0">
        <EquationTabs current={state.equation} onChange={actions.setEquation} />
      </div>

      {/* ═══ Main: scene + below content ═══ */}
      <div className="flex flex-col gap-2 px-2 lg:px-4 pb-3 lg:pb-4">
        {/* Scene — 4:5 aspect on mobile, 16:9 on desktop */}
        <div
          className="rounded-xl lg:rounded-2xl overflow-hidden w-full mx-auto aspect-[4/5] lg:aspect-[16/9]"
          style={{
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            maxHeight: isFullscreen ? '85vh' : '720px',
            maxWidth: '1280px',
          }}
        >
          {isFreefall ? (
            <FreeFallScene
              values={state.values}
              vehicle={state.vehicle}
              liveTime={liveTime}
              liveS={liveS}
              liveV={liveV}
              duration={duration}
              layers={state.layers}
              zoom={state.zoom}
              mode={state.mode}
              unknown={state.unknown}
              activeVars={activeVars}
              onValueChange={actions.setValue}
              onVehicleChange={actions.setVehicle}
              playbackStatus={state.playback.status}
              onPlay={actions.play}
              onPause={actions.pause}
              onReset={actions.reset}
            />
          ) : (
            <RoadScene
              values={state.values}
              vehicle={state.vehicle}
              liveTime={liveTime}
              liveS={liveS}
              liveV={liveV}
              duration={duration}
              layers={state.layers}
              ghosts={state.ghosts}
              zoom={state.zoom}
              mode={state.mode}
              unknown={state.unknown}
              activeVars={activeVars}
              onValueChange={actions.setValue}
              onVehicleChange={actions.setVehicle}
              playbackStatus={state.playback.status}
              onPlay={actions.play}
              onPause={actions.pause}
              onReset={actions.reset}
            />
          )}
        </div>

        {/* Circle controls bar — speed/zoom/fullscreen/ghost */}
        <PlaybackBar
          speed={state.playback.speed}
          onSpeedChange={actions.setSpeed}
          zoom={state.zoom}
          onZoomChange={actions.setZoom}
          onSaveGhost={actions.saveGhost}
          ghostCount={state.ghosts.length}
          onClearGhosts={actions.clearGhosts}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* ═══ Below scene: formula + derivation + result + layers + graphs ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 mt-1">
          {/* Left column */}
          <div className="flex flex-col gap-2">
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
          </div>

          {/* Right column — graphs */}
          <div className="flex flex-col gap-2">
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
            {!state.layers.vGraph && !state.layers.sGraph && (
              <div
                className="rounded-lg p-3 text-xs italic flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px dashed #CBD5E1',
                  color: '#94A3B8',
                  minHeight: '80px',
                }}
              >
                লেয়ার থেকে graph চালু করো
              </div>
            )}
          </div>
        </div>
      </div>

      <TutorialFAB videoUrl={videoUrl} />
    </div>
  );
}
