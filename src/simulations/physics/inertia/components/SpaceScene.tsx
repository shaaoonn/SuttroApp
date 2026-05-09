'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
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
 * Free-object-in-space scene: F_net = 0 → object continues at constant velocity.
 * Pure conceptual demonstration of Newton's 1st law.
 * NCTB textbook: "মহাশূন্যে কোনো বল না থাকলে বস্তু একই বেগে চলতে থাকে।"
 */
export default function SpaceScene({
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

    // Deep space background
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
    bgGrad.addColorStop(0, '#1E1B4B');
    bgGrad.addColorStop(0.6, '#0B0B2D');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars (deterministic positions)
    for (let i = 0; i < 80; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 73) % H;
      const r = (i % 4) * 0.4 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 5) * 0.15})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant nebula glow
    const neb = ctx.createRadialGradient(W * 0.8, H * 0.3, 0, W * 0.8, H * 0.3, 200);
    neb.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    neb.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(W * 0.5, 0, W * 0.5, H * 0.5);

    const neb2 = ctx.createRadialGradient(W * 0.15, H * 0.7, 0, W * 0.15, H * 0.7, 180);
    neb2.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    neb2.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, H * 0.5, W * 0.4, H * 0.5);

    // Camera-follow object — ball moves at constant velocity u (since F_net=0)
    // Object center stays at viewport center; stars scroll
    const objVel = values.u; // m/s
    const pxPerMeter = 30 * zoom;
    const totalOffset = objVel * liveTime * pxPerMeter;

    // Star parallax — slow scroll opposite to motion
    if (layers.distanceMarkers) {
      ctx.save();
      ctx.translate(-totalOffset * 0.3, 0);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let i = 0; i < 30; i++) {
        const x = ((i * 211) % (W * 2));
        const y = (i * 89) % H;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Ball at fixed center
    const objX = W / 2;
    const objY = H / 2;
    const ballR = 36 * zoom;

    // Ball glow
    const ballGlow = ctx.createRadialGradient(objX, objY, 0, objX, objY, ballR * 2);
    ballGlow.addColorStop(0, 'rgba(255, 230, 100, 0.4)');
    ballGlow.addColorStop(1, 'rgba(255, 230, 100, 0)');
    ctx.fillStyle = ballGlow;
    ctx.fillRect(objX - ballR * 2, objY - ballR * 2, ballR * 4, ballR * 4);

    // Ball emoji
    ctx.font = `${ballR * 2}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', objX, objY);

    // Velocity arrow
    if (layers.velocityArrow && Math.abs(values.u) > 0.05) {
      const arrLen = Math.min(180, Math.abs(values.u) * 12);
      const dir = Math.sign(values.u) || 1;
      const arrY = objY - ballR - 30;
      drawArrow(ctx, objX, arrY, objX + arrLen * dir, arrY, '#34D399', 4);
      ctx.font = 'bold 13px ui-monospace, monospace';
      const lbl = `v = ${values.u.toFixed(1)} m/s (constant)`;
      const lblW = ctx.measureText(lbl).width;
      const lblX = objX + (arrLen * dir) / 2;
      const lblY = arrY - 18;
      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.roundRect(lblX - lblW / 2 - 8, lblY - 11, lblW + 16, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#0B1D3A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, lblX, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    // F_net = 0 indicator
    if (layers.forceArrow) {
      const lblY = objY + ballR + 32;
      ctx.font = 'bold 14px sans-serif';
      const lbl = 'F_net = 0  (কোনো বল নাই)';
      const lblW = ctx.measureText(lbl).width;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
      ctx.beginPath();
      ctx.roundRect(objX - lblW / 2 - 10, lblY - 12, lblW + 20, 24, 12);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, objX, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    // Inertia indicator
    if (layers.inertiaIndicator && liveTime > 0.5) {
      ctx.font = 'bold 13px sans-serif';
      const lbl = '✓ বল না থাকলেও বস্তু একই বেগে চলছে — নিউটনের ১ম সূত্র';
      const lblW = ctx.measureText(lbl).width;
      const lblY = H * 0.1;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.beginPath();
      ctx.roundRect(W / 2 - lblW / 2 - 12, lblY - 12, lblW + 24, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, W / 2, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    // Floating readout
    ctx.font = 'bold 12px ui-monospace, monospace';
    const distance = values.u * liveTime;
    const readout = `t: ${liveTime.toFixed(2)}s   ·   v: ${values.u.toFixed(1)} m/s   ·   দূরত্ব: ${distance.toFixed(1)} m`;
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
      style={{ background: '#000000' }}
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
  const headLen = Math.min(13, len * 0.4);
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
