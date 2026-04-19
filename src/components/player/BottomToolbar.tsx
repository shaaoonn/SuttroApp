'use client';

import type { InteractionMode } from '@/hooks/useInteractionMode';

// ─────────────────────────────────────────────
// BottomToolbar - Zoom, fit, mode toggle, fullscreen
// Layout: [সূত্র | suttro.app] ··· [100%] [-] [+] | [⤢ Fit] | [✋] [🖱️] | [⛶]
// ─────────────────────────────────────────────

export interface PanZoomControls {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
}

interface BottomToolbarProps {
  panZoom?: PanZoomControls;
  interactionMode?: {
    effectiveMode: InteractionMode;
    setMouseMode: () => void;
    setHandMode: () => void;
  };
  onToggleFullscreen: () => void;
}

function ToolbarDivider() {
  return (
    <div
      className="w-px h-5 mx-1"
      style={{ background: 'var(--player-border)' }}
    />
  );
}

function ToolbarButton({
  onClick,
  title,
  active = false,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded suttro-transition min-w-[36px] min-h-[36px] flex items-center justify-center ${
        active ? 'bg-white/15' : 'hover:bg-white/10'
      }`}
      style={{
        color: active ? 'var(--player-text)' : 'var(--player-muted)',
      }}
      title={title}
    >
      {children}
    </button>
  );
}

export default function BottomToolbar({
  panZoom,
  interactionMode,
  onToggleFullscreen,
}: BottomToolbarProps) {
  const zoomPercent = panZoom ? Math.round(panZoom.zoom * 100) : 100;

  return (
    <div
      className="flex items-center justify-between px-4 py-2 shrink-0 text-xs"
      style={{
        background: 'var(--player-bottombar)',
        borderTop: '1px solid var(--player-border)',
      }}
    >
      {/* Brand watermark */}
      <span
        className="hidden sm:inline"
        style={{ color: 'var(--player-muted)' }}
      >
        সূত্র | suttro.app
      </span>

      <div className="flex items-center gap-1 ml-auto">
        {/* Zoom controls */}
        {panZoom && (
          <>
            <span
              className="font-mono px-2"
              style={{ color: 'var(--player-text)' }}
            >
              {zoomPercent}%
            </span>
            <ToolbarButton
              onClick={panZoom.zoomOut}
              title="জুম আউট (Ctrl + −)"
            >
              −
            </ToolbarButton>
            <ToolbarButton
              onClick={panZoom.zoomIn}
              title="জুম ইন (Ctrl + +)"
            >
              +
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton
              onClick={panZoom.fitToScreen}
              title="স্ক্রিনে ফিট করো (Ctrl + 0)"
            >
              ⤢
            </ToolbarButton>
          </>
        )}

        {/* Mode toggle */}
        {interactionMode && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              onClick={interactionMode.setHandMode}
              active={interactionMode.effectiveMode === 'hand'}
              title="হ্যান্ড মোড - ক্যানভাস প্যান/জুম (Spacebar)"
            >
              ✋
            </ToolbarButton>
            <ToolbarButton
              onClick={interactionMode.setMouseMode}
              active={interactionMode.effectiveMode === 'mouse'}
              title="মাউস মোড - অবজেক্ট ইন্টারেকশন (Esc)"
            >
              🖱️
            </ToolbarButton>
          </>
        )}

        <ToolbarDivider />

        {/* Fullscreen */}
        <ToolbarButton
          onClick={onToggleFullscreen}
          title="ফুলস্ক্রিন (F)"
        >
          ⛶
        </ToolbarButton>
      </div>
    </div>
  );
}
