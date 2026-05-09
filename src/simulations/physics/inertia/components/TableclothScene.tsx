'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
import { G } from '../physics';
import type { InertiaVars, LayerVisibility, PlaybackStatus } from '../types';

interface Props {
  values: InertiaVars;
  liveTime: number;
  duration: number;
  zoom: number;
  layers: LayerVisibility;
  playbackStatus: PlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onZoomChange: (z: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

/**
 * Tablecloth-trick scene: glass cup ☕ on a tablecloth. The user pulls the
 * cloth to the right at velocity `u`. Friction `μ` between cup and cloth
 * determines whether the cup stays (high `u`, low `μ`) or follows (low `u`,
 * high `μ`). Classic NCTB textbook demonstration of inertia.
 *
 *   - Cloth moves at velocity `u`
 *   - Friction force on cup: f = μ·m·g (limited)
 *   - Cup acceleration = min(μg, contact-required-accel)
 *   - If cloth slides out faster than cup can accelerate, cup stays
 */
export default function TableclothScene({
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

    // Indoor scene background — warm cream wall
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#FFF3D6');
    bgGrad.addColorStop(0.6, '#FFE4A8');
    bgGrad.addColorStop(1, '#E8C97A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Wall texture lines
    ctx.strokeStyle = 'rgba(180, 140, 70, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H * 0.6);
      ctx.stroke();
    }

    // Picture frame on wall
    ctx.fillStyle = '#92400E';
    ctx.fillRect(W * 0.1, H * 0.12, 80, 60);
    ctx.fillStyle = '#FCD34D';
    ctx.fillRect(W * 0.1 + 6, H * 0.12 + 6, 68, 48);

    // Table surface (perspective)
    const tableTopY = H * 0.55;
    const tableBottomY = H * 0.95;
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(W * 0.1, tableTopY);
    ctx.lineTo(W * 0.9, tableTopY);
    ctx.lineTo(W * 0.95, tableBottomY);
    ctx.lineTo(W * 0.05, tableBottomY);
    ctx.closePath();
    ctx.fill();
    // Table top edge
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, tableTopY);
    ctx.lineTo(W * 0.9, tableTopY);
    ctx.stroke();

    // ─── Tablecloth ──
    // Cloth slides right at velocity `u`. Position = u * t (in pixels)
    const clothPxPerMeter = 60 * zoom;
    const clothOffset = values.u * liveTime * clothPxPerMeter;

    const clothInitialLeft = W * 0.15;
    const clothInitialRight = W * 0.7;
    const clothLeft = clothInitialLeft + clothOffset;
    const clothRight = clothInitialRight + clothOffset;
    const clothTop = tableTopY - 6;
    const clothBottom = tableTopY + 30;

    // Cloth body
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(clothLeft, clothTop, clothRight - clothLeft, clothBottom - clothTop);
    // Cloth pattern stripes
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 1.5;
    for (let cx = clothLeft + 8; cx < clothRight; cx += 18) {
      ctx.beginPath();
      ctx.moveTo(cx, clothTop);
      ctx.lineTo(cx, clothBottom);
      ctx.stroke();
    }
    // Cloth fringe
    ctx.fillStyle = '#FCA5A5';
    ctx.fillRect(clothLeft - 4, clothTop, 4, clothBottom - clothTop);
    ctx.fillRect(clothRight, clothTop, 4, clothBottom - clothTop);

    // ─── CUP physics ──
    // Cup accelerates due to friction between cup and cloth.
    // Maximum friction acceleration: a_max = μ * g
    // Cup velocity = a_max * t (capped at cloth velocity)
    const cupMaxAccel = values.mu * G;
    const cupMaxVel = Math.min(cupMaxAccel * liveTime, values.u);
    const cupOffset = 0.5 * cupMaxAccel * liveTime * liveTime * clothPxPerMeter;
    // Cap cup offset so it doesn't exceed cloth offset
    const cappedCupOffset = Math.min(cupOffset, clothOffset);

    const cupInitialX = W * 0.35;
    const cupX = cupInitialX + cappedCupOffset;
    const cupBaseY = tableTopY + 6;

    // Cup shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cupX, cupBaseY, 30 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cup emoji
    ctx.font = `${64 * zoom}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('☕', cupX, cupBaseY);
    ctx.textBaseline = 'alphabetic';

    // ─── Hand pulling cloth (right side) ──
    const handX = clothRight + 30;
    const handY = clothTop;
    ctx.font = `${48 * zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✋', handX, handY);
    ctx.textBaseline = 'alphabetic';

    // ─── Velocity arrow on cloth ──
    if (layers.velocityArrow && values.u > 0.05 && liveTime > 0.05) {
      const arrLen = Math.min(120, values.u * 16);
      const arrY = clothTop - 18;
      const arrX1 = (clothLeft + clothRight) / 2;
      drawArrow(ctx, arrX1, arrY, arrX1 + arrLen, arrY, '#16A34A', 3.5);
      ctx.font = 'bold 11px ui-monospace, monospace';
      const lbl = `কাপড়: ${values.u.toFixed(1)} m/s`;
      const lblW = ctx.measureText(lbl).width;
      const lblX = arrX1 + arrLen / 2;
      const lblY = arrY - 14;
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.roundRect(lblX - lblW / 2 - 6, lblY - 9, lblW + 12, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, lblX, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    // ─── Inertia indicator: did the cup stay or follow? ──
    if (layers.inertiaIndicator && liveTime > 0.4) {
      const cupVelMS = Math.min(cupMaxAccel * liveTime, values.u);
      const stays = cupVelMS < values.u * 0.3 && values.u > 1;
      const lbl = stays
        ? '✓ গ্লাস থেকে গেছে — জড়তা প্রকাশ পেয়েছে'
        : cupVelMS > values.u * 0.5
          ? '✗ গ্লাস কাপড়ের সাথে গেছে — ঘর্ষণ বেশি / টান ধীর'
          : '⋯';
      if (lbl !== '⋯') {
        ctx.font = 'bold 13px sans-serif';
        const lblW = ctx.measureText(lbl).width;
        const lblY = H * 0.08;
        ctx.fillStyle = stays ? '#16A34A' : '#DC2626';
        ctx.beginPath();
        ctx.roundRect(W / 2 - lblW / 2 - 10, lblY - 12, lblW + 20, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, W / 2, lblY);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // Floating readout
    ctx.font = 'bold 12px ui-monospace, monospace';
    const cupV = Math.min(cupMaxAccel * liveTime, values.u);
    const readout = `t: ${liveTime.toFixed(2)}s   কাপড় v: ${values.u.toFixed(1)} m/s   গ্লাস v: ${cupV.toFixed(2)} m/s`;
    const readoutW = ctx.measureText(readout).width;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.9)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - readoutW / 2 - 8, H - 28, readoutW + 16, 22, 10);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(readout, W / 2, H - 17);
    ctx.textBaseline = 'alphabetic';
  }, [values, liveTime, duration, zoom, layers, resizeKey]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#FFE4A8' }}
    >
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
  const headLen = Math.min(11, len * 0.35);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(angle) * headLen * 0.6, y2 - Math.sin(angle) * headLen * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}
