'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
import { momentum } from '../physics';
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
 * p = mv scene — train (or any vehicle) at constant velocity. Camera follows.
 * Live readout shows m, v, p with side-by-side comparison helping students
 * intuit "high mass × low v" vs "low mass × high v".
 */
export default function MomentumScene({
  values,
  liveTime,
  zoom,
  layers,
  distanceUnit,
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
    const labelReserve = 38;
    const horizonY = H * 0.45;
    const railY = horizonY + 8;
    const railH = Math.max(80, H * 0.22);
    const railBottom = Math.min(railY + railH, H - labelReserve);

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#7CC2F0');
    skyGrad.addColorStop(0.5, '#A6D4ED');
    skyGrad.addColorStop(1, '#E1F0F8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY);

    // Sun
    ctx.fillStyle = '#FFD86E';
    ctx.beginPath();
    ctx.arc(W * 0.85, H * 0.18, 26, 0, Math.PI * 2);
    ctx.fill();

    drawCloud(ctx, W * 0.18, H * 0.10, 1.0);
    drawCloud(ctx, W * 0.5, H * 0.07, 0.85);
    drawCloud(ctx, W * 0.78, H * 0.16, 0.95);

    // Train motion
    const trainV = values.u; // momentum scenario: u is the constant velocity
    const trainS = trainV * liveTime;

    // Hills with parallax
    ctx.save();
    ctx.translate(-trainS * 4 * 0.15, 0);
    ctx.fillStyle = 'rgba(120, 165, 140, 0.45)';
    ctx.beginPath();
    ctx.moveTo(-W, horizonY);
    for (let x = -W; x <= W * 2; x += 100) {
      const wave = Math.sin(x * 0.013) * 35 + Math.sin(x * 0.007) * 20;
      ctx.lineTo(x, horizonY - 35 + wave);
    }
    ctx.lineTo(W * 2, horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Grass
    ctx.fillStyle = '#5A9A4A';
    ctx.fillRect(0, horizonY, W, H - horizonY);

    // Train track (rail) — two lines of metal + sleepers
    ctx.fillStyle = '#3F3F46';
    ctx.fillRect(0, railY, W, railH);
    // Sleepers
    ctx.fillStyle = '#78350F';
    const sleeperSpacing = 36;
    const offset = (-trainS * 8) % sleeperSpacing;
    for (let x = offset - sleeperSpacing; x < W; x += sleeperSpacing) {
      ctx.fillRect(x, railY + 4, 18, railH - 8);
    }
    // Rails (metal)
    ctx.fillStyle = '#71717A';
    ctx.fillRect(0, railY + 6, W, 4);
    ctx.fillRect(0, railBottom - 10, W, 4);

    // Distance markers
    if (layers.distanceMarkers) {
      const meterPx = 4 * zoom;
      const center = W * 0.5;
      const visibleHalf = (W / 2) / meterPx;
      const stepM = visibleHalf > 50 ? 25 : visibleHalf > 20 ? 10 : 5;
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const startM = Math.floor((trainS - visibleHalf) / stepM) * stepM;
      const endM = Math.ceil((trainS + visibleHalf) / stepM) * stepM;
      for (let m = startM; m <= endM; m += stepM) {
        const x = center + (m - trainS) * meterPx;
        if (x < -20 || x > W + 20) continue;
        const dispVal = distanceUnit === 'cm' ? m * 100 : m;
        const lbl = `${dispVal}${distanceUnit}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(lbl, x, railBottom + 22);
        ctx.fillText(lbl, x, railBottom + 22);
      }
    }

    // Train at center
    const trainX = W * 0.5;
    const trainY = (railY + railBottom) / 2;
    drawTrain(ctx, trainX, trainY, 90 * zoom);

    // Velocity arrow
    if (layers.velocityArrow && Math.abs(trainV) > 0.05) {
      const arrLen = Math.min(180, Math.abs(trainV) * 6);
      const dir = Math.sign(trainV) || 1;
      const ay = trainY - 50 * zoom;
      drawArrow(ctx, trainX, ay, trainX + arrLen * dir, ay, '#16A34A', 4);
      if (layers.values) {
        ctx.font = 'bold 13px ui-monospace, monospace';
        const lbl = `v = ${trainV.toFixed(1)} m/s`;
        const lblW = ctx.measureText(lbl).width;
        const lblX = trainX + (arrLen * dir) / 2;
        const lblY = ay - 16;
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.roundRect(lblX - lblW / 2 - 7, lblY - 10, lblW + 14, 20, 10);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, lblX, lblY);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // Floating big momentum readout
    const p = momentum(values.m, trainV);
    ctx.font = 'bold 22px ui-monospace, monospace';
    const mainLbl = `p = mv = ${values.m.toFixed(1)} × ${trainV.toFixed(1)} = ${p.toFixed(1)} kg·m/s`;
    const mainW = ctx.measureText(mainLbl).width;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.92)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - mainW / 2 - 14, 14, mainW + 28, 36, 14);
    ctx.fill();
    ctx.fillStyle = '#FCD34D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainLbl, W / 2, 32);
    ctx.textBaseline = 'alphabetic';

    // Mass label below train
    if (layers.values) {
      ctx.font = `bold ${12 * zoom}px sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.fillText(`m = ${values.m.toFixed(1)} kg`, trainX, trainY + 50 * zoom);
    }
  }, [values, liveTime, zoom, layers, distanceUnit, resizeKey]);

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

function drawTrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = `${scale}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚂', 0, 0);
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(-30, 0, 18, 0, Math.PI * 2);
  ctx.arc(-10, -8, 22, 0, Math.PI * 2);
  ctx.arc(15, -6, 24, 0, Math.PI * 2);
  ctx.arc(35, 2, 18, 0, Math.PI * 2);
  ctx.arc(0, 8, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
