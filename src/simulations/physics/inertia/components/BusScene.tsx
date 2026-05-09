'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
import {
  passengerLurch,
  vehiclePosAt,
  vehicleVelAt,
} from '../physics';
import type { InertiaVars, LayerVisibility, PlaybackStatus, ScenarioKey } from '../types';

interface Props {
  scenario: 'busBrake' | 'busStart';
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
 * Bus side-cutaway scene — passenger 🧍 inside, lurches forward (brake) or
 * backward (accelerate) due to inertia. Friction on shoes determines whether
 * lurch happens at all (textbook condition).
 */
export default function BusScene({
  scenario,
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

    // Layout
    const labelReserve = 38;
    const horizonY = H * 0.45;
    const roadTop = horizonY + 6;
    const roadHeight = Math.max(110, H * 0.32);
    const roadBottom = Math.min(roadTop + roadHeight, H - labelReserve);

    // ─── Day sky (FIXED) ──
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#7CC2F0');
    skyGrad.addColorStop(0.5, '#A6D4ED');
    skyGrad.addColorStop(1, '#E1F0F8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY);

    // Sun
    const sunX = W * 0.86;
    const sunY = H * 0.17;
    const sunR = 28;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.5);
    glow.addColorStop(0, 'rgba(255, 230, 150, 0.55)');
    glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sunX - sunR * 3.5, sunY - sunR * 3.5, sunR * 7, sunR * 7);
    ctx.fillStyle = '#FFD86E';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFEEA0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Clouds (FIXED)
    drawCloud(ctx, W * 0.14, H * 0.12, 1.0);
    drawCloud(ctx, W * 0.42, H * 0.08, 0.8);
    drawCloud(ctx, W * 0.66, H * 0.20, 0.95);

    // Buildings in background (parallax with bus motion)
    const busS = vehiclePosAt(values.u, values.a, liveTime);
    const bgParallax = -busS * 4;
    ctx.save();
    ctx.translate(bgParallax, 0);
    drawBuildings(ctx, W, horizonY);
    ctx.restore();

    // Grass strip above road
    const grassGrad = ctx.createLinearGradient(0, horizonY, 0, roadTop);
    grassGrad.addColorStop(0, '#7BB661');
    grassGrad.addColorStop(1, '#5A9A4A');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, horizonY, W, roadTop - horizonY);

    // Road
    const roadGrad = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
    roadGrad.addColorStop(0, '#3E444E');
    roadGrad.addColorStop(0.5, '#30353E');
    roadGrad.addColorStop(1, '#3E444E');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadTop, W, roadBottom - roadTop);

    // Yellow shoulders
    ctx.fillStyle = '#FFC93C';
    ctx.fillRect(0, roadTop, W, 4);
    ctx.fillRect(0, roadBottom - 4, W, 4);

    // Dashed center line — scrolls with bus motion
    const dashedY = (roadTop + roadBottom) / 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.setLineDash([28, 18]);
    ctx.lineDashOffset = -busS * 8;
    ctx.beginPath();
    ctx.moveTo(0, dashedY);
    ctx.lineTo(W, dashedY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Grass below road
    if (roadBottom < H) {
      const grassBottomGrad = ctx.createLinearGradient(0, roadBottom, 0, H);
      grassBottomGrad.addColorStop(0, '#5A9A4A');
      grassBottomGrad.addColorStop(1, '#477A3D');
      ctx.fillStyle = grassBottomGrad;
      ctx.fillRect(0, roadBottom, W, H - roadBottom);
    }

    // Distance markers (camera follows bus → markers scroll)
    if (layers.distanceMarkers) {
      const meterPx = 6 * zoom;
      const visibleHalf = (W / 2) / meterPx;
      const stepM = visibleHalf > 50 ? 10 : visibleHalf > 20 ? 5 : 2;
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const center = W / 2;
      const startM = Math.floor((busS - visibleHalf) / stepM) * stepM;
      const endM = Math.ceil((busS + visibleHalf) / stepM) * stepM;
      for (let m = startM; m <= endM; m += stepM) {
        const x = center + (m - busS) * meterPx;
        if (x < -20 || x > W + 20) continue;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, roadBottom);
        ctx.lineTo(x, roadBottom + 7);
        ctx.stroke();
        const lbl = `${m}m`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(lbl, x, roadBottom + 22);
        ctx.fillText(lbl, x, roadBottom + 22);
      }
    }

    // ─── BUS (cutaway side view) ──
    const busCenterX = W / 2;
    const busTopY = (roadTop + roadBottom) / 2 - 80 * zoom;
    const busW = 280 * zoom;
    const busH = 110 * zoom;
    drawBusCutaway(ctx, busCenterX - busW / 2, busTopY, busW, busH);

    // ─── PASSENGER inside the bus ──
    const lurchAmount = passengerLurch(values.u, values.a, values.mu, liveTime);
    // Convert meters to pixels (passenger relative motion in pixels)
    const lurchPx = lurchAmount * 60 * zoom;
    // Cap lurch within bus interior
    const maxLurchPx = busW * 0.30;
    const cappedLurch = Math.max(-maxLurchPx, Math.min(maxLurchPx, lurchPx));

    // Passenger position inside bus
    const passengerX = busCenterX + cappedLurch;
    const passengerY = busTopY + busH * 0.45;

    // Tilt passenger emoji (visual lurch)
    const tiltDeg = Math.max(-25, Math.min(25, lurchAmount * 8));
    ctx.save();
    ctx.translate(passengerX, passengerY);
    ctx.rotate((tiltDeg * Math.PI) / 180);
    ctx.font = `${56 * zoom}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧍', 0, 0);
    ctx.restore();

    // ─── Velocity arrow (above bus) ──
    const busV = vehicleVelAt(values.u, values.a, liveTime);
    if (layers.velocityArrow && Math.abs(busV) > 0.05) {
      const arrLen = Math.min(160, Math.abs(busV) * 8);
      const dir = Math.sign(busV) || 1;
      const arrY = busTopY - 24;
      drawArrow(ctx, busCenterX, arrY, busCenterX + arrLen * dir, arrY, '#16A34A', 4);
      ctx.font = 'bold 12px ui-monospace, monospace';
      const lbl = `v = ${busV.toFixed(1)} m/s`;
      const lblW = ctx.measureText(lbl).width;
      const lblX = busCenterX + (arrLen * dir) / 2;
      const lblY = arrY - 16;
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

    // ─── Force arrow (below bus, points opposite of bus velocity for brake) ──
    if (layers.forceArrow && Math.abs(values.a) > 0.05) {
      const arrLen = Math.min(120, Math.abs(values.a) * 12);
      const dir = Math.sign(values.a) || 1;
      const arrY = busTopY + busH + 38;
      drawArrow(ctx, busCenterX, arrY, busCenterX + arrLen * dir, arrY, '#EA580C', 4);
      ctx.font = 'bold 11px ui-monospace, monospace';
      const lbl = `a = ${values.a.toFixed(1)} m/s²`;
      const lblW = ctx.measureText(lbl).width;
      const lblX = busCenterX + (arrLen * dir) / 2;
      const lblY = arrY + 18;
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.roundRect(lblX - lblW / 2 - 6, lblY - 9, lblW + 12, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, lblX, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    // ─── Inertia indicator text (above passenger) ──
    if (layers.inertiaIndicator && Math.abs(cappedLurch) > 4) {
      ctx.font = 'bold 13px sans-serif';
      const dir = cappedLurch > 0 ? 'সামনে' : 'পেছনে';
      const lbl = `যাত্রী ${dir} ঝুঁকছে ⟶ জড়তা`;
      const lblW = ctx.measureText(lbl).width;
      const lblY = busTopY - 60;
      ctx.fillStyle = '#BE185D';
      ctx.beginPath();
      ctx.roundRect(passengerX - lblW / 2 - 8, lblY - 11, lblW + 16, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, passengerX, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    // ─── Floating readout ──
    ctx.font = 'bold 12px ui-monospace, monospace';
    const readout = `t: ${liveTime.toFixed(2)}s   ·   v: ${busV.toFixed(1)} m/s   ·   ঝুঁক: ${(cappedLurch / (60 * zoom)).toFixed(2)}m`;
    const readoutW = ctx.measureText(readout).width;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.9)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - readoutW / 2 - 8, 14, readoutW + 16, 24, 10);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(readout, W / 2, 26);
    ctx.textBaseline = 'alphabetic';
  }, [values, liveTime, duration, zoom, layers, scenario, resizeKey]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#7CC2F0' }}
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

// ─── Bus cutaway drawing ───────────────────────────────────
function drawBusCutaway(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Body
  ctx.fillStyle = '#FFC93C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [12, 12, 6, 6]);
  ctx.fill();
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cutaway interior — translucent darker rectangle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 22, w - 16, h - 36, 4);
  ctx.fill();

  // Windshield (front, right side)
  ctx.fillStyle = '#A6D4ED';
  ctx.beginPath();
  ctx.moveTo(x + w - 50, y + 6);
  ctx.lineTo(x + w - 6, y + 22);
  ctx.lineTo(x + w - 6, y + h - 22);
  ctx.lineTo(x + w - 50, y + h - 22);
  ctx.closePath();
  ctx.fill();

  // Wheels
  const wheelR = h * 0.18;
  const wheelY = y + h - 4;
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.arc(x + 32, wheelY, wheelR, 0, Math.PI * 2);
  ctx.arc(x + w - 50, wheelY, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6B7280';
  ctx.beginPath();
  ctx.arc(x + 32, wheelY, wheelR * 0.5, 0, Math.PI * 2);
  ctx.arc(x + w - 50, wheelY, wheelR * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Door line
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.35, y + 22);
  ctx.lineTo(x + w * 0.35, y + h - 22);
  ctx.moveTo(x + w * 0.45, y + 22);
  ctx.lineTo(x + w * 0.45, y + h - 22);
  ctx.stroke();

  // "BUS" text on side
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('বাস', x + w * 0.18, y + 16);
}

// ─── Helpers ────────────────────────────────────────────────
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

function drawBuildings(ctx: CanvasRenderingContext2D, W: number, horizonY: number) {
  ctx.fillStyle = 'rgba(140, 160, 180, 0.6)';
  for (let i = 0; i < 6; i++) {
    const bx = (i / 6) * W * 1.5 - W * 0.25;
    const bw = 50 + (i % 3) * 30;
    const bh = 30 + (i % 4) * 25;
    ctx.fillRect(bx, horizonY - bh, bw, bh);
    // Windows
    ctx.fillStyle = 'rgba(255, 230, 150, 0.7)';
    for (let r = 0; r < Math.floor(bh / 12); r++) {
      for (let c = 0; c < Math.floor(bw / 12); c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(bx + c * 12 + 3, horizonY - bh + r * 12 + 3, 6, 6);
        }
      }
    }
    ctx.fillStyle = 'rgba(140, 160, 180, 0.6)';
  }
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

void ('busBrake' as ScenarioKey); // type assertion to avoid unused warning
