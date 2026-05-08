'use client';

import { useEffect, useRef } from 'react';
import { positionAt } from '../physics';
import type { GhostRun, KinematicVars, LayerVisibility, VehicleKey } from '../types';
import { drawVehicle, vehicleSize, WHEEL_RADIUS } from '../vehicles';
import VehiclePickerOverlay from './VehiclePickerOverlay';

interface Props {
  values: KinematicVars;
  vehicle: VehicleKey;
  liveTime: number;
  liveS: number;
  liveV: number;
  duration: number;
  layers: LayerVisibility;
  ghosts: GhostRun[];
  onVehicleChange: (v: VehicleKey) => void;
}

export default function RoadScene({
  values,
  vehicle,
  liveTime,
  liveS,
  liveV,
  duration,
  layers,
  ghosts,
  onVehicleChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // ─── Compute world-to-screen scale ──
    const finalS = positionAt(values.u, values.a, duration);
    let peakAbsS = Math.abs(finalS);
    if (values.a !== 0 && Math.sign(values.u) !== Math.sign(values.a)) {
      const turnT = -values.u / values.a;
      if (turnT > 0 && turnT < duration) {
        peakAbsS = Math.max(peakAbsS, Math.abs(positionAt(values.u, values.a, turnT)));
      }
    }
    const safePeak = Math.max(20, peakAbsS);
    const usableWidth = W - 220;
    const meterPx = usableWidth / (safePeak * 2.0);

    // Layout zones — bigger road to fit larger vehicles
    const horizonY = H * 0.55;
    const roadTop = horizonY + 6;
    const roadHeight = Math.max(160, H * 0.34);
    const roadBottom = roadTop + roadHeight;
    const dashedLineY = (roadTop + roadBottom) / 2;

    const vehicleScreenX = (s: number) => W / 2 + s * meterPx;

    // ─── Day sky gradient ──
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#7CC2F0');
    skyGrad.addColorStop(0.5, '#A6D4ED');
    skyGrad.addColorStop(1, '#E1F0F8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY);

    // ─── Sun (top right) with glow ──
    const sunX = W * 0.86;
    const sunY = H * 0.16;
    const sunR = 32;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.5);
    glow.addColorStop(0, 'rgba(255, 230, 150, 0.55)');
    glow.addColorStop(0.5, 'rgba(255, 200, 100, 0.18)');
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

    // ─── Clouds ──
    drawCloud(ctx, W * 0.14, H * 0.12, 1.05);
    drawCloud(ctx, W * 0.42, H * 0.08, 0.85);
    drawCloud(ctx, W * 0.66, H * 0.20, 1.0);
    drawCloud(ctx, W * 0.30, H * 0.30, 0.7);

    // ─── Distant hills ──
    ctx.fillStyle = 'rgba(120, 165, 140, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.bezierCurveTo(W * 0.15, horizonY - 50, W * 0.3, horizonY - 30, W * 0.45, horizonY - 40);
    ctx.bezierCurveTo(W * 0.6, horizonY - 50, W * 0.8, horizonY - 25, W, horizonY - 35);
    ctx.lineTo(W, horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(95, 145, 120, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.bezierCurveTo(W * 0.2, horizonY - 25, W * 0.5, horizonY - 15, W * 0.75, horizonY - 22);
    ctx.bezierCurveTo(W * 0.9, horizonY - 28, W * 0.95, horizonY - 18, W, horizonY - 20);
    ctx.lineTo(W, horizonY);
    ctx.closePath();
    ctx.fill();

    // ─── Grass strip above road ──
    const grassTopGrad = ctx.createLinearGradient(0, horizonY, 0, roadTop);
    grassTopGrad.addColorStop(0, '#7BB661');
    grassTopGrad.addColorStop(1, '#5A9A4A');
    ctx.fillStyle = grassTopGrad;
    ctx.fillRect(0, horizonY, W, roadTop - horizonY);

    // ─── Road surface ──
    const roadGrad = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
    roadGrad.addColorStop(0, '#3E444E');
    roadGrad.addColorStop(0.5, '#30353E');
    roadGrad.addColorStop(1, '#3E444E');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadTop, W, roadHeight);

    // Yellow shoulder stripes
    ctx.fillStyle = '#FFC93C';
    ctx.fillRect(0, roadTop, W, 4);
    ctx.fillRect(0, roadBottom - 4, W, 4);

    // ─── Dashed white center line (PROMINENT) ──
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.setLineDash([34, 22]);
    ctx.beginPath();
    ctx.moveTo(0, dashedLineY);
    ctx.lineTo(W, dashedLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // ─── Grass below road ──
    if (roadBottom < H) {
      const grassBottomGrad = ctx.createLinearGradient(0, roadBottom, 0, H);
      grassBottomGrad.addColorStop(0, '#5A9A4A');
      grassBottomGrad.addColorStop(1, '#477A3D');
      ctx.fillStyle = grassBottomGrad;
      ctx.fillRect(0, roadBottom, W, H - roadBottom);
    }

    // ─── Distance markers below road ──
    if (layers.distanceMarkers) {
      let stepM = 5;
      if (meterPx < 4) stepM = 25;
      else if (meterPx < 8) stepM = 10;
      else if (meterPx < 20) stepM = 5;
      else stepM = 1;

      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.textAlign = 'center';

      const startM = Math.floor(-safePeak / stepM) * stepM;
      const endM = Math.ceil(safePeak / stepM) * stepM;
      for (let m = startM; m <= endM; m += stepM) {
        const x = vehicleScreenX(m);
        if (x < -20 || x > W + 20) continue;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, roadBottom);
        ctx.lineTo(x, roadBottom + 8);
        ctx.stroke();
        const lbl = `${m}m`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.strokeText(lbl, x, roadBottom + 24);
        ctx.fillText(lbl, x, roadBottom + 24);
      }
    }

    // Origin (0m) emphasized
    const x0 = vehicleScreenX(0);
    if (x0 >= 0 && x0 <= W) {
      ctx.strokeStyle = 'rgba(22, 163, 74, 1)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, roadTop - 8);
      ctx.lineTo(x0, roadBottom + 8);
      ctx.stroke();
    }

    // ─── Ghost trails ──
    if (layers.ghostTrail && ghosts.length > 0) {
      ghosts.forEach((ghost) => {
        ctx.strokeStyle = ghost.color;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ghost.positions.forEach((p, i) => {
          const x = vehicleScreenX(p.s);
          if (i === 0) ctx.moveTo(x, dashedLineY);
          else ctx.lineTo(x, dashedLineY);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    // ─── Vehicle (centered visually on dashed line) ──
    const vSize = vehicleSize(vehicle);
    // emoji visual content sits in lower 60% of bounding box; offset upward so
    // the visual center lands ON the dashed line
    const vY = dashedLineY - vSize * 0.13;
    const vX = vehicleScreenX(liveS);
    const wheelR = WHEEL_RADIUS[vehicle];
    const wheelRotation = (liveS * meterPx) / wheelR;

    // Direction: live velocity OR if stopped, look at sign(a) for hint OR default forward
    let direction = Math.sign(liveV);
    if (direction === 0) direction = Math.sign(values.a) || 1;

    ctx.save();
    ctx.translate(vX, vY);
    drawVehicle(ctx, vehicle, wheelRotation, direction);
    ctx.restore();

    // ─── Velocity arrow (above vehicle) ──
    if (layers.velocityArrow && Math.abs(liveV) > 0.05) {
      const arrowLen = Math.min(180, Math.abs(liveV) * 8);
      const dir = Math.sign(liveV);
      const arrY = vY - vSize * 0.55;
      drawArrow(ctx, vX, arrY, vX + arrowLen * dir, arrY, '#16A34A', 4);
      ctx.font = 'bold 13px ui-monospace, monospace';
      const label = `v = ${liveV.toFixed(1)} m/s`;
      const labelW = ctx.measureText(label).width;
      const labelX = vX + (arrowLen * dir) / 2;
      const labelY = arrY - 18;
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.roundRect(labelX - labelW / 2 - 8, labelY - 11, labelW + 16, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);
      ctx.textBaseline = 'alphabetic';
    }

    // ─── Acceleration arrow (below vehicle) ──
    if (layers.accelerationArrow && Math.abs(values.a) > 0.05) {
      const arrowLen = Math.min(120, Math.abs(values.a) * 12);
      const dir = Math.sign(values.a);
      const arrY = vY + vSize * 0.55;
      drawArrow(ctx, vX, arrY, vX + arrowLen * dir, arrY, '#EA580C', 4);
      ctx.font = 'bold 12px ui-monospace, monospace';
      const label = `a = ${values.a.toFixed(1)} m/s²`;
      const labelW = ctx.measureText(label).width;
      const labelX = vX + (arrowLen * dir) / 2;
      const labelY = arrY + 20;
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.roundRect(labelX - labelW / 2 - 7, labelY - 11, labelW + 14, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);
      ctx.textBaseline = 'alphabetic';
    }

    // ─── Floating readout above vehicle ──
    ctx.font = 'bold 13px ui-monospace, monospace';
    const labelText = `t: ${liveTime.toFixed(2)}s   ·   s: ${liveS.toFixed(1)}m`;
    ctx.textAlign = 'center';
    const textW = ctx.measureText(labelText).width;
    const lblPad = 12;
    const lblX = vX - textW / 2 - lblPad;
    const lblY = vY - vSize * 0.95;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.92)';
    ctx.beginPath();
    ctx.roundRect(lblX, lblY, textW + lblPad * 2, 26, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, vX, lblY + 13);
    ctx.textBaseline = 'alphabetic';
  }, [values, vehicle, liveTime, liveS, liveV, duration, layers, ghosts]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#7CC2F0', minHeight: '320px' }}
    >
      <canvas ref={canvasRef} />
      {/* Floating vehicle picker overlay (top-left of scene) */}
      <VehiclePickerOverlay current={vehicle} onChange={onVehicleChange} />
    </div>
  );
}

// ─── Cloud helper ──
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
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(-12, -10, 12, 0, Math.PI * 2);
  ctx.arc(8, -8, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Arrow helper ──
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width: number
) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const angle = Math.atan2(dy, dx);
  const headLen = Math.min(15, len * 0.4);

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
