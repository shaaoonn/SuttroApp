'use client';

import { useRef } from 'react';
import { useSimulation } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useFullscreen } from '@/hooks/useFullscreen';

// ─────────────────────────────────────────────
// Template Simulation Player
// Copy this folder, rename, and customize.
// DO NOT modify: player shell, toolbar, pan/zoom, mode toggle.
// DO customize: useSimulation hook, canvas content, config.ts.
// ─────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  physics: 'bg-physics',
  chemistry: 'bg-chemistry',
  biology: 'bg-biology',
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
};

export default function TemplateSim() {
  const playerRef = useRef<HTMLDivElement>(null);
  const { variables, computed, setVariable, resetAll, config } = useSimulation();
  const panZoom = usePanZoom(config.defaultZoom);
  const { effectiveMode, cursor, setMouseMode, setHandMode } = useInteractionMode();
  const { isFullscreen, toggleFullscreen } = useFullscreen(playerRef);

  const zoomPercent = Math.round(panZoom.zoom * 100);

  return (
    <div
      ref={playerRef}
      className="suttro-player flex flex-col select-none"
      style={{ cursor }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'var(--player-topbar)', borderBottom: '1px solid var(--player-border)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className={`${SUBJECT_COLORS[config.subject]} px-2 py-0.5 rounded text-xs text-white font-medium`}
          >
            {SUBJECT_LABELS[config.subject]} · অধ্যায় {config.nctb.chapter}
          </span>
          <span className="text-sm" style={{ color: 'var(--player-text)' }}>
            {config.title.bn}
          </span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'var(--player-muted)' }}
          title={isFullscreen ? 'ফুলস্ক্রিন থেকে বের হও' : 'ফুলস্ক্রিন'}
        >
          ⛶
        </button>
      </div>

      {/* ── Canvas Area ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Layer 1+2: Dot grid + Simulation objects (transform layer) */}
        <div
          className="sim-canvas absolute inset-0"
          style={{
            ...panZoom.transformStyle,
            backgroundSize: `${20 * panZoom.zoom}px ${20 * panZoom.zoom}px`,
          }}
          {...(effectiveMode === 'hand' ? panZoom.handlers : {})}
        >
          {/* ⬇️ ADD YOUR SIMULATION VISUAL ELEMENTS HERE */}
          {/* Example: circuit components, molecules, cells, etc. */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: config.canvasSize.width / 2 - 100,
              top: config.canvasSize.height / 2 - 30,
              width: 200,
              height: 60,
            }}
          >
            <span className="text-sm opacity-30" style={{ color: 'var(--player-text)' }}>
              সিমুলেশন এলিমেন্ট এখানে যোগ করো
            </span>
          </div>
        </div>

        {/* Layer 3: Fixed UI Overlay */}
        <div className="fixed-overlay">
          {/* Control Panel (top-right) */}
          {config.variables.length > 0 && (
            <div className="control-panel top-3 right-3 w-64 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--player-muted)' }}>
                  নিয়ন্ত্রণ
                </span>
                <button
                  onClick={resetAll}
                  className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--player-muted)' }}
                >
                  রিসেট
                </button>
              </div>
              {config.variables.map((v) => (
                <div key={v.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--player-text)' }}>{v.label.bn}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--canvas-label)' }}>
                      {variables[v.id]?.toFixed(v.step < 1 ? 1 : 0)} {v.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={v.min}
                    max={v.max}
                    step={v.step}
                    value={variables[v.id] ?? v.default}
                    onChange={(e) => setVariable(v.id, parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--suttro-primary)' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Readout Panel (bottom-left) */}
          {Object.keys(computed).length > 0 && (
            <div className="readout-panel bottom-14 left-3 p-4 min-w-[180px]">
              <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--player-muted)' }}>
                পরিমাপ
              </span>
              {Object.entries(computed).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm mb-1 last:mb-0">
                  <span style={{ color: 'var(--player-text)' }}>{key}</span>
                  <span className="font-mono" style={{ color: 'var(--canvas-label)' }}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Formula Display */}
          {config.formulas.length > 0 && (
            <div className="readout-panel top-3 left-3 p-3">
              {config.formulas.map((f, i) => (
                <div key={i} className="font-mono text-sm" style={{ color: 'var(--canvas-label)' }}>
                  {f.expression}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0 text-xs"
        style={{ background: 'var(--player-bottombar)', borderTop: '1px solid var(--player-border)' }}
      >
        {/* Brand */}
        <span className="hidden sm:inline" style={{ color: 'var(--player-muted)' }}>
          সূত্র | suttro.app
        </span>

        <div className="flex items-center gap-1 ml-auto">
          {/* Zoom controls */}
          <span className="font-mono px-2" style={{ color: 'var(--player-text)' }}>
            {zoomPercent}%
          </span>
          <button
            onClick={panZoom.zoomOut}
            className="p-2 rounded hover:bg-white/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            style={{ color: 'var(--player-text)' }}
            title="জুম আউট (Ctrl + −)"
          >
            −
          </button>
          <button
            onClick={panZoom.zoomIn}
            className="p-2 rounded hover:bg-white/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            style={{ color: 'var(--player-text)' }}
            title="জুম ইন (Ctrl + +)"
          >
            +
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--player-border)' }} />

          {/* Fit to screen */}
          <button
            onClick={panZoom.fitToScreen}
            className="p-2 rounded hover:bg-white/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            style={{ color: 'var(--player-text)' }}
            title="স্ক্রিনে ফিট করো (Ctrl + 0)"
          >
            ⤢
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--player-border)' }} />

          {/* Mode toggle */}
          <button
            onClick={setHandMode}
            className={`p-2 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
              effectiveMode === 'hand' ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            style={{ color: effectiveMode === 'hand' ? 'var(--player-text)' : 'var(--player-muted)' }}
            title="হ্যান্ড মোড — ক্যানভাস প্যান/জুম (Spacebar)"
          >
            ✋
          </button>
          <button
            onClick={setMouseMode}
            className={`p-2 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
              effectiveMode === 'mouse' ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            style={{ color: effectiveMode === 'mouse' ? 'var(--player-text)' : 'var(--player-muted)' }}
            title="মাউস মোড — অবজেক্ট ইন্টারেকশন (Esc)"
          >
            🖱️
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--player-border)' }} />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-white/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            style={{ color: 'var(--player-text)' }}
            title="ফুলস্ক্রিন (F)"
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}
