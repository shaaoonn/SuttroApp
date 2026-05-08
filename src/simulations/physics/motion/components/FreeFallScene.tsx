'use client';

import { useEffect, useRef } from 'react';
import { G } from '../physics';
import type { KinematicVars, LayerVisibility, VehicleKey } from '../types';
import { drawVehicle, WHEEL_RADIUS } from '../vehicles';

interface Props {
  values: KinematicVars;
  vehicle: VehicleKey;
  liveTime: number;
  liveS: number;
  liveV: number;
  duration: number;
  layers: LayerVisibility;
}

/**
 * Vertical free-fall scene. Uses height (h) as the falling distance.
 * - Object starts at top, falls under gravity
 * - Tower/cliff drawn on left for height reference
 * - Velocity arrow points down (and grows)
 */
export default function FreeFallScene({
  values,
  vehicle,
  liveTime,
  liveS,
  liveV,
  duration,
  layers,
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

    // Total fall height — derived from duration*g*½
    const totalH = Math.max(1, 0.5 * G * duration * duration);
    const usableHeight = H - 80; // top + ground padding
    const meterPx = usableHeight / totalH;

    // ─── Sky gradient (blue → orange like at sunset, dramatic) ──
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#1A2B42');
    skyGrad.addColorStop(0.4, '#0B1D3A');
    skyGrad.addColorStop(1, '#1F2937');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 25; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 73) % (H * 0.5);
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Ground
    const groundY = H - 30;
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, groundY, W, 30);
    // Ground stripe
    ctx.strokeStyle = '#E8A838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 1);
    ctx.lineTo(W, groundY + 1);
    ctx.stroke();

    // ─── Tower / cliff on left ──
    const towerX = W * 0.18;
    const towerW = 36;
    const towerTop = 30;
    ctx.fillStyle = '#2D3340';
    ctx.fillRect(towerX, towerTop, towerW, groundY - towerTop);
    // Brick texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let y = towerTop + 14; y < groundY; y += 14) {
      ctx.beginPath();
      ctx.moveTo(towerX, y);
      ctx.lineTo(towerX + towerW, y);
      ctx.stroke();
    }
    // Top edge highlight
    ctx.fillStyle = '#3D4757';
    ctx.fillRect(towerX - 2, towerTop, towerW + 4, 4);

    // ─── Object position ──
    // y = top + s * meterPx where s = 0 at top, increases downward
    const objY = towerTop + 4 + liveS * meterPx;
    const objX = towerX + towerW + 60;

    // ─── Distance markers along the fall ──
    if (layers.distanceMarkers) {
      let stepM = 1;
      if (totalH > 50) stepM = 10;
      else if (totalH > 20) stepM = 5;
      else if (totalH > 10) stepM = 2;

      ctx.font = '9px ui-monospace, monospace';
      ctx.fillStyle = 'rgba(250, 251, 249, 0.5)';
      ctx.textAlign = 'right';

      for (let m = 0; m <= totalH; m += stepM) {
        const y = towerTop + 4 + m * meterPx;
        if (y > groundY) continue;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(towerX + towerW + 4, y);
        ctx.lineTo(towerX + towerW + 12, y);
        ctx.stroke();
        ctx.fillText(`${m}m`, towerX - 4, y + 3);
      }
    }

    // ─── Falling object ──
    ctx.save();
    ctx.translate(objX, objY);
    // For free fall, object orientation: rotate slightly with time for visual effect
    // (actual physics is straight down)
    const wheelR = WHEEL_RADIUS[vehicle];
    const rotation = (liveS * meterPx) / wheelR;
    drawVehicle(ctx, vehicle, rotation);
    ctx.restore();

    // ─── Velocity arrow (down) ──
    if (layers.velocityArrow && liveV > 0.05) {
      const arrLen = Math.min(80, liveV * 4);
      drawArrow(ctx, objX + 30, objY, objX + 30, objY + arrLen, '#2A9D6E', 3);
      ctx.fillStyle = '#2A9D6E';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${liveV.toFixed(1)} m/s`, objX + 38, objY + arrLen / 2 + 4);
    }

    // ─── Acceleration arrow (always down, constant g) ──
    if (layers.accelerationArrow) {
      drawArrow(ctx, objX - 35, objY, objX - 35, objY + 35, '#E8A838', 3);
      ctx.fillStyle = '#E8A838';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('g', objX - 42, objY + 22);
    }

    // ─── Time/height readout ──
    const labelText = `t: ${liveTime.toFixed(2)}s  |  h: ${liveS.toFixed(1)}m`;
    ctx.font = 'bold 11px ui-monospace, monospace';
    const textW = ctx.measureText(labelText).width;
    const lblX = W - textW - 20;
    const lblY = 12;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.85)';
    ctx.beginPath();
    ctx.roundRect(lblX, lblY, textW + 12, 18, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    ctx.fillStyle = '#FAFBF9';
    ctx.textAlign = 'left';
    ctx.fillText(labelText, lblX + 6, lblY + 12);

    // Frame border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  }, [values, vehicle, liveTime, liveS, liveV, duration, layers]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl"
      style={{
        background: '#050D1F',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        minHeight: '300px',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const angle = Math.atan2(dy, dx);
  const headLen = Math.min(10, len * 0.35);

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
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}
