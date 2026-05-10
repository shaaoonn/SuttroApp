'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
import { forceFromImpulse, impulse } from '../physics';
import type { ForceVars, LayerVisibility, PlaybackStatus } from '../types';

interface Props {
  values: ForceVars;
  liveTime: number;
  duration: number;
  zoom: number;
  layers: LayerVisibility;
  distanceUnit: 'm' | 'cm';
  playbackStatus: PlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onZoomChange: (z: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

/**
 * Impulse scene: cricket bat 🏏 hits ball ⚽. Ball comes in at u, bounces back
 * at v in interaction time t. Visualizes 3 phases: incoming → contact → outgoing.
 * Live formula breakdown of F = (mv − mu) / t.
 */
export default function ImpulseScene({
  values,
  liveTime,
  duration,
  zoom,
  layers,
  playbackStatus,
  onPlay,
  onPause,
  onReset,
  onZoomChange,
  onToggleFullscreen,
  isFullscreen,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => setResizeKey((k) => k + 1));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.clientWidth;
    const cssH = container.clientHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = cssW;
    const H = cssH;

    // Cricket pitch background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#7CC2F0');
    bgGrad.addColorStop(0.55, '#A6D4ED');
    bgGrad.addColorStop(0.7, '#9CA3AF');
    bgGrad.addColorStop(1, '#7BB661');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Pitch (brown strip)
    const pitchY = H * 0.7;
    ctx.fillStyle = '#A0825A';
    ctx.fillRect(0, pitchY, W, 36);
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, pitchY);
      ctx.lineTo(x, pitchY + 36);
      ctx.stroke();
    }

    // Phases:
    // 0 < t < tInteractionStart: ball flying toward bat at velocity u
    // tInteractionStart < t < tInteractionEnd: contact (very short)
    // After: ball flying away at velocity v
    const totalDur = duration;
    const interactionDur = values.t;
    const beforeDur = (totalDur - interactionDur) * 0.5;
    const tInteractionStart = beforeDur;
    const tInteractionEnd = beforeDur + interactionDur;

    // Bat position (fixed at right side)
    const batX = W * 0.7;
    const batY = H * 0.5;

    // Bat
    ctx.font = `${72 * zoom}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏏', batX, batY);

    // Ball position based on phase
    let ballX: number;
    let ballV: number; // current velocity for arrow
    let phaseLabel: string;
    let phaseColor: string;
    if (liveTime < tInteractionStart) {
      // approaching at u
      const fraction = liveTime / Math.max(0.0001, tInteractionStart);
      ballX = W * 0.05 + (batX - W * 0.05 - 36) * fraction;
      ballV = values.u;
      phaseLabel = 'phase ১: ball আসছে';
      phaseColor = '#3B82F6';
    } else if (liveTime <= tInteractionEnd) {
      // contact
      ballX = batX - 30;
      ballV = 0; // momentarily during interaction
      phaseLabel = 'phase ২: bat-এর সাথে contact (Δt → ০)';
      phaseColor = '#EA580C';
    } else {
      // bouncing back at v
      const tFromContact = liveTime - tInteractionEnd;
      const remaining = Math.max(0.0001, totalDur - tInteractionEnd);
      const fraction = tFromContact / remaining;
      ballX = (batX - 30) + (values.v * 8 * tFromContact); // visualize rebound
      ballV = values.v;
      phaseLabel = 'phase ৩: ball ফিরে যাচ্ছে';
      phaseColor = '#16A34A';
    }
    ballX = Math.max(20, Math.min(W - 20, ballX));

    // Ball
    const ballSize = 38 * zoom;
    ctx.font = `${ballSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.fillText('⚽', ballX, batY + 20);

    // Velocity arrow on ball
    if (layers.velocityArrow && Math.abs(ballV) > 0.5) {
      const arrLen = Math.min(120, Math.abs(ballV) * 2.2);
      const dir = Math.sign(ballV) || 1;
      const ay = batY + 20 - 28;
      drawArrow(ctx, ballX, ay, ballX + arrLen * dir, ay, phaseColor, 3);
      if (layers.values) {
        ctx.font = 'bold 11px ui-monospace, monospace';
        const lbl = `${ballV.toFixed(1)} m/s`;
        const lblW = ctx.measureText(lbl).width;
        const lblX = ballX + (arrLen * dir) / 2;
        const lblY = ay - 14;
        ctx.fillStyle = phaseColor;
        ctx.beginPath();
        ctx.roundRect(lblX - lblW / 2 - 5, lblY - 8, lblW + 10, 16, 8);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, lblX, lblY);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // Phase label
    ctx.font = 'bold 14px sans-serif';
    const phLblW = ctx.measureText(phaseLabel).width;
    ctx.fillStyle = phaseColor;
    ctx.beginPath();
    ctx.roundRect(W / 2 - phLblW / 2 - 10, 14, phLblW + 20, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phaseLabel, W / 2, 27);
    ctx.textBaseline = 'alphabetic';

    // Big formula breakdown (always visible)
    const F = forceFromImpulse(values.m, values.u, values.v, values.t);
    const J = impulse(values.m, values.u, values.v);
    ctx.font = 'bold 14px ui-monospace, monospace';
    const lines = [
      `J = m(v − u) = ${values.m.toFixed(2)} × (${values.v.toFixed(1)} − ${values.u.toFixed(1)}) = ${J.toFixed(2)} kg·m/s`,
      `F = J / Δt = ${J.toFixed(2)} / ${values.t.toFixed(3)} = ${F.toFixed(1)} N`,
    ];
    const boxY = H - 70;
    const boxH = 58;
    const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 24;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.92)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - maxW / 2, boxY, maxW, boxH, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, boxY + 18 + i * 22);
    });
    ctx.textBaseline = 'alphabetic';
  }, [values, liveTime, duration, zoom, layers, resizeKey]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: '#7CC2F0' }}>
      <canvas ref={canvasRef} />
      <SceneOverlayControls
        status={playbackStatus}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={isFullscreen}
        ghostCount={0}
        onSaveGhost={() => {}}
        onClearGhosts={() => {}}
      />
    </div>
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width: number,
) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const angle = Math.atan2(dy, dx);
  const headLen = Math.min(11, len * 0.4);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(angle) * headLen * 0.7, y2 - Math.sin(angle) * headLen * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}
