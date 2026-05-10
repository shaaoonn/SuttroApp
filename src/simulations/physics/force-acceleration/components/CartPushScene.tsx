'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
import {
  accelerationFrom,
  netForce,
  positionAt,
  velocityAt,
} from '../physics';
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
 * F = ma scene: push-cart on road. PhET-inspired (Forces and Motion: Basics
 * Motion tab). Multi-pusher illustration + cart with mass; net force arrow
 * (after subtracting friction) drives kinematic animation.
 */
export default function CartPushScene({
  values,
  liveTime,
  duration,
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

    // Layout
    const labelReserve = 38;
    const horizonY = H * 0.45;
    const roadTop = horizonY + 6;
    const roadHeight = Math.max(110, H * 0.32);
    const roadBottom = Math.min(roadTop + roadHeight, H - labelReserve);

    // Day sky
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

    drawCloud(ctx, W * 0.14, H * 0.12, 1.0);
    drawCloud(ctx, W * 0.42, H * 0.08, 0.85);
    drawCloud(ctx, W * 0.68, H * 0.20, 1.0);

    // Compute physics
    const a = accelerationFrom(values.F, values.m, values.mu, values.g);
    const fNet = netForce(values.F, values.m, values.mu, values.g);
    const cartS = positionAt(values.u, a, liveTime);
    const cartV = velocityAt(values.u, a, liveTime);

    // Hills (parallax)
    const hillParallax = -cartS * 8 * 0.12;
    ctx.save();
    ctx.translate(hillParallax, 0);
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

    // Grass above road
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
    ctx.fillStyle = '#FFC93C';
    ctx.fillRect(0, roadTop, W, 4);
    ctx.fillRect(0, roadBottom - 4, W, 4);

    // Dashed center line (scrolls with motion)
    const dashedY = (roadTop + roadBottom) / 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.setLineDash([28, 18]);
    ctx.lineDashOffset = -cartS * 8;
    ctx.beginPath();
    ctx.moveTo(0, dashedY);
    ctx.lineTo(W, dashedY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    if (roadBottom < H) {
      ctx.fillStyle = '#5A9A4A';
      ctx.fillRect(0, roadBottom, W, H - roadBottom);
    }

    // Distance markers (camera follows cart)
    if (layers.distanceMarkers) {
      const meterPx = 6 * zoom;
      const center = W * 0.55;
      const visibleHalf = (W / 2) / meterPx;
      const stepM = visibleHalf > 50 ? 10 : visibleHalf > 20 ? 5 : 2;
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const startM = Math.floor((cartS - visibleHalf) / stepM) * stepM;
      const endM = Math.ceil((cartS + visibleHalf) / stepM) * stepM;
      for (let m = startM; m <= endM; m += stepM) {
        const x = center + (m - cartS) * meterPx;
        if (x < -20 || x > W + 20) continue;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, roadBottom);
        ctx.lineTo(x, roadBottom + 7);
        ctx.stroke();
        const dispVal = distanceUnit === 'cm' ? m * 100 : m;
        const lbl = `${dispVal}${distanceUnit}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(lbl, x, roadBottom + 22);
        ctx.fillText(lbl, x, roadBottom + 22);
      }
    }

    // ─── Pushers (left of cart) — multiple kid emojis stacked behind ──
    const cartCenterX = W * 0.55;
    const cartY = (roadTop + roadBottom) / 2 - 20 * zoom;
    const cartW = 100 * zoom;
    const cartH = 60 * zoom;
    const pushers = Math.max(0, Math.min(5, values.pushers));

    // Draw pushers stacked
    for (let i = 0; i < pushers; i++) {
      const px = cartCenterX - cartW / 2 - 30 * zoom - i * 22 * zoom;
      const py = cartY + cartH * 0.5;
      ctx.font = `${44 * zoom}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Slight tilt forward when pushing
      ctx.save();
      ctx.translate(px, py);
      if (Math.abs(fNet) > 0.1) ctx.rotate((10 * Math.PI) / 180);
      ctx.fillText('🧒', 0, 0);
      ctx.restore();
    }

    // ─── Cart (wooden box on wheels) ──
    drawCart(ctx, cartCenterX, cartY, cartW, cartH);

    // Mass label on cart
    if (layers.values) {
      ctx.font = `bold ${13 * zoom}px sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.fillText(`${values.m.toFixed(1)} kg`, cartCenterX, cartY + cartH / 2 - 6);
    }

    // ─── Applied force arrow ──
    if (layers.forceArrow && Math.abs(values.F) > 0.5) {
      const arrLen = Math.min(220, Math.abs(values.F) * 0.6);
      const dir = Math.sign(values.F) || 1;
      const ay = cartY - 32;
      drawArrow(ctx, cartCenterX, ay, cartCenterX + arrLen * dir, ay, '#EA580C', 4);
      if (layers.values) {
        ctx.font = 'bold 12px ui-monospace, monospace';
        const lbl = `F = ${values.F.toFixed(0)} N`;
        const lblW = ctx.measureText(lbl).width;
        const lblX = cartCenterX + (arrLen * dir) / 2;
        const lblY = ay - 16;
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
    }

    // ─── Friction force (red, opposite direction) ──
    if (layers.netForceArrow && values.mu > 0.001 && Math.abs(values.F) > 0.5) {
      const friction = values.mu * values.m * values.g;
      const arrLen = Math.min(180, friction * 0.6);
      const dir = -Math.sign(values.F);
      const ay = cartY + cartH + 32;
      drawArrow(ctx, cartCenterX, ay, cartCenterX + arrLen * dir, ay, '#DC2626', 3.5);
      if (layers.values) {
        ctx.font = 'bold 11px ui-monospace, monospace';
        const lbl = `f = μmg = ${friction.toFixed(1)} N`;
        const lblW = ctx.measureText(lbl).width;
        const lblX = cartCenterX + (arrLen * dir) / 2;
        const lblY = ay + 16;
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.roundRect(lblX - lblW / 2 - 6, lblY - 8, lblW + 12, 16, 8);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, lblX, lblY);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // ─── Velocity arrow (above cart) ──
    if (layers.velocityArrow && Math.abs(cartV) > 0.05) {
      const arrLen = Math.min(150, Math.abs(cartV) * 8);
      const dir = Math.sign(cartV) || 1;
      const ay = cartY - 70;
      drawArrow(ctx, cartCenterX, ay, cartCenterX + arrLen * dir, ay, '#16A34A', 3.5);
      if (layers.values) {
        ctx.font = 'bold 11px ui-monospace, monospace';
        const lbl = `v = ${cartV.toFixed(1)} m/s`;
        const lblW = ctx.measureText(lbl).width;
        const lblX = cartCenterX + (arrLen * dir) / 2;
        const lblY = ay - 14;
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.roundRect(lblX - lblW / 2 - 6, lblY - 8, lblW + 12, 16, 8);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, lblX, lblY);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // ─── Floating readout ──
    if (layers.speedometer) {
      ctx.font = 'bold 12px ui-monospace, monospace';
      const dispS = distanceUnit === 'cm' ? cartS * 100 : cartS;
      const readout = `t: ${liveTime.toFixed(2)}s   ·   a: ${a.toFixed(2)} m/s²   ·   v: ${cartV.toFixed(1)} m/s   ·   s: ${dispS.toFixed(1)}${distanceUnit}`;
      const readoutW = ctx.measureText(readout).width;
      ctx.fillStyle = 'rgba(11, 29, 58, 0.92)';
      ctx.beginPath();
      ctx.roundRect(W / 2 - readoutW / 2 - 8, 14, readoutW + 16, 24, 10);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(readout, W / 2, 26);
      ctx.textBaseline = 'alphabetic';
    }
  }, [values, liveTime, duration, zoom, layers, distanceUnit, resizeKey]);

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

// ─── Cart drawing — wooden box on green wheels (PhET-inspired) ──
function drawCart(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + h / 2 + 6, w * 0.45, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Skateboard / cart deck
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy + h / 2 - 8, w, 8, 2);
  ctx.fill();

  // Wooden box on top
  const boxX = cx - w * 0.4;
  const boxY = cy - h / 2;
  const boxW = w * 0.8;
  const boxH = h - 12;
  const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
  boxGrad.addColorStop(0, '#D2A77B');
  boxGrad.addColorStop(0.5, '#B8814B');
  boxGrad.addColorStop(1, '#8B5A2B');
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 4);
  ctx.fill();
  ctx.strokeStyle = '#5C3917';
  ctx.lineWidth = 2;
  ctx.stroke();

  // X pattern on box (PhET style)
  ctx.strokeStyle = '#5C3917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxX + 6, boxY + 6);
  ctx.lineTo(boxX + boxW - 6, boxY + boxH - 6);
  ctx.moveTo(boxX + boxW - 6, boxY + 6);
  ctx.lineTo(boxX + 6, boxY + boxH - 6);
  ctx.stroke();

  // Wheels (green like PhET)
  const wheelR = h * 0.18;
  const wheelY = cy + h / 2 + 2;
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(cx - w * 0.32, wheelY, wheelR, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.32, wheelY, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.arc(cx - w * 0.32, wheelY, wheelR * 0.45, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.32, wheelY, wheelR * 0.45, 0, Math.PI * 2);
  ctx.fill();
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
