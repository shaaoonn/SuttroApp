'use client';

import { useEffect, useRef, useState } from 'react';
import ModeSwitch from '@/simulations/physics/motion/components/ModeSwitch';
import TutorialFAB from '@/simulations/physics/motion/components/TutorialFAB';
import BusScene from './components/BusScene';
import InertiaLayerToggles from './components/InertiaLayerToggles';
import InertiaResultPanel from './components/InertiaResultPanel';
import InertiaSliders from './components/InertiaSliders';
import PresetButtons from './components/PresetButtons';
import ScenarioQuestion from './components/ScenarioQuestion';
import ScenarioTabs from './components/ScenarioTabs';
import SpaceScene from './components/SpaceScene';
import TableclothScene from './components/TableclothScene';
import { inertiaConfig } from './config';
import { useInertia } from './useInertia';

// ─────────────────────────────────────────────
// জড়তা Sim — entry. Mirrors Motion sim's layout:
//   - Top bar: title (1.5×) + mode switch
//   - Scenario tabs (4 scenarios with different visuals)
//   - Main: scene LEFT (flex-1) + side panel RIGHT (360px)
//   - Embedded sliders + control pill inside canvas
//   - Fullscreen branch: scene 4/5 + side rail 1/5
// ─────────────────────────────────────────────

const SUBJECT_BN: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export interface InertiaSimProps {
  videoUrl?: string;
}

export default function InertiaSim({ videoUrl }: InertiaSimProps = {}) {
  const { state, derived, actions } = useInertia();
  const { duration, liveTime } = derived;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      if (!isFs) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
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

  // Scene element selection
  const sceneCommonProps = {
    values: state.values,
    liveTime,
    duration,
    zoom: state.zoom,
    layers: state.layers,
    playbackStatus: state.playback.status,
    onPlay: actions.play,
    onPause: actions.pause,
    onReset: actions.reset,
    onZoomChange: actions.setZoom,
    onToggleFullscreen: toggleFullscreen,
    isFullscreen,
  };

  let sceneNode: React.ReactNode;
  if (state.scenario === 'busBrake' || state.scenario === 'busStart') {
    sceneNode = <BusScene scenario={state.scenario} {...sceneCommonProps} />;
  } else if (state.scenario === 'tablecloth') {
    sceneNode = <TableclothScene {...sceneCommonProps} />;
  } else {
    sceneNode = <SpaceScene {...sceneCommonProps} />;
  }

  // Sliders overlay (inside canvas via portal-style absolute positioning)
  const slidersOverlay = (
    <InertiaSliders
      scenario={state.scenario}
      values={state.values}
      onChange={actions.setValue}
    />
  );

  // ─── FULLSCREEN MODE ───
  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="inertia-sim relative w-full h-full flex flex-row"
        style={{ background: '#000' }}
      >
        {/* Scene 4/5 */}
        <div className="flex flex-col flex-[4] min-w-0 relative">
          {sceneNode}
          {slidersOverlay}
        </div>
        {/* Right rail 1/5 */}
        <div
          className="flex flex-col flex-[1] min-w-[180px] max-w-[280px] h-full overflow-y-auto p-2 gap-2"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            zoom: typeof window !== 'undefined' && window.innerWidth < 900 ? 0.8 : 1,
          }}
        >
          <ScenarioQuestion scenario={state.scenario} values={state.values} />
          <PresetButtons scenario={state.scenario} onApply={actions.setValues} />
          <InertiaResultPanel scenario={state.scenario} values={state.values} liveTime={liveTime} />
          <InertiaLayerToggles layers={state.layers} onToggle={actions.toggleLayer} />
        </div>
        <TutorialFAB videoUrl={videoUrl} />
      </div>
    );
  }

  // ─── NORMAL MODE ───
  return (
    <div
      ref={containerRef}
      className="inertia-sim relative w-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #DBEAFE 50%, #F0F9FF 100%)',
        color: '#1E293B',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 lg:px-5 lg:py-2.5 flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-3 min-w-0 flex-1">
          <div
            className="text-[10px] font-medium leading-none truncate lg:hidden"
            style={{ color: '#94A3B8' }}
          >
            {SUBJECT_BN[inertiaConfig.subject]} · অধ্যায় {inertiaConfig.nctb.chapter}
          </div>
          <div
            className="font-bold leading-tight truncate text-xl lg:hidden"
            style={{ color: '#1E293B' }}
          >
            {inertiaConfig.title.bn}
          </div>
          <div className="hidden lg:flex items-baseline gap-3 truncate">
            <span className="text-3xl font-bold tracking-tight" style={{ color: '#1E293B' }}>
              {inertiaConfig.title.bn}
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              {SUBJECT_BN[inertiaConfig.subject]} · NCTB অধ্যায় {inertiaConfig.nctb.chapter} · ১ম সূত্র
            </span>
          </div>
        </div>
        <ModeSwitch mode={state.mode} onChange={actions.setMode} />
      </div>

      {/* Scenario tabs */}
      <div className="px-3 py-2 lg:px-5 lg:py-2 flex-shrink-0">
        <ScenarioTabs current={state.scenario} onChange={actions.setScenario} />
      </div>

      {/* Main: scene LEFT + side panel RIGHT */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 px-3 lg:px-5 pb-3 lg:pb-4">
        {/* Scene */}
        <div className="flex flex-col gap-2 lg:flex-1 lg:min-w-0">
          <div
            className="rounded-xl lg:rounded-2xl overflow-hidden w-full mx-auto aspect-[4/5] lg:aspect-[16/9] relative"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.85)',
              maxHeight: '720px',
            }}
          >
            {sceneNode}
            {slidersOverlay}
          </div>
        </div>

        {/* Right side panel */}
        <div className="flex flex-col gap-2 lg:w-[360px] flex-shrink-0 lg:overflow-y-auto lg:max-h-[calc(100vh-180px)] lg:pr-1">
          <ScenarioQuestion scenario={state.scenario} values={state.values} />
          <PresetButtons scenario={state.scenario} onApply={actions.setValues} />
          <InertiaResultPanel scenario={state.scenario} values={state.values} liveTime={liveTime} />

          <div>
            <div
              className="text-[10px] mb-1 font-semibold"
              style={{ color: '#94A3B8' }}
            >
              লেয়ার
            </div>
            <InertiaLayerToggles layers={state.layers} onToggle={actions.toggleLayer} />
          </div>

          {/* Related formulas card */}
          <div
            className="rounded-xl p-3"
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
            }}
          >
            <div className="text-xs font-bold mb-2" style={{ color: '#166534' }}>
              📚 সম্পর্কিত সূত্র (অনুসন্ধান)
            </div>
            <div className="space-y-1.5 font-mono text-xs" style={{ color: '#15803D' }}>
              {inertiaConfig.formulas.map((f, i) => (
                <div key={i}>
                  <div className="font-bold">{f.expression}</div>
                  <div className="text-[10px] font-sans" style={{ color: '#475569' }}>
                    {f.description.bn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TutorialFAB videoUrl={videoUrl} />
    </div>
  );
}
