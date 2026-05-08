'use client';

import { useEffect, useRef } from 'react';
import { positionAt, velocityAt } from '../physics';
import type { GhostRun, KinematicVars, LayerVisibility, VehicleKey } from '../types';
import { drawVehicle, VEHICLE_WIDTH, WHEEL_RADIUS } from '../vehicles';

interface Props {
  values: KinematicVars;
  vehicle: VehicleKey;
  liveTime: number;
  liveS: number;
  liveV: number;
  duration: number;
  layers: LayerVisibility;
  ghosts: GhostRun[];
}

// World scale: 1 meter = METER_PX canvas pixels
// Adjusts dynamically based on max distance to fit nicely.

export default function RoadScene({
  values,
  vehicle,
  liveTime,
  liveS,
  liveV,
  duration,
  layers,
  ghosts,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // We re-render on every animation frame OR when values change.
  // Drawing logic is in this effect.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize to container
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
    // Final s position (where vehicle ends up)
    const finalS = positionAt(values.u, values.a, duration);
    // Find peak distance over the whole motion (could be non-monotonic if a is opposite to u)
    // For NCTB cases this is usually monotonic, but be safe:
    let peakAbsS = Math.abs(finalS);
    if (values.a !== 0 && Math.sign(values.u) !== Math.sign(values.a)) {
      // turning point at t = -u/a
      const turnT = -values.u / values.a;
      if (turnT > 0 && turnT < duration) {
        peakAbsS = Math.max(peakAbsS, Math.abs(positionAt(values.u, values.a, turnT)));
      }
    }
    const safePeak = Math.max(20, peakAbsS); // minimum 20m view
    const usableWidth = W - 160; // padding for vehicle width
    const meterPx = usableWidth / (safePeak * 2.0);

    const groundY = H * 0.72;
    const skyEnd = groundY;

    // Camera centers vehicle position
    const vehicleScreenX = (s: number) => W / 2 + s * meterPx;

    // ─── Background sky gradient ──
    const skyGrad = ctx.createLinearGradient(0, 0, 0, skyEnd);
    skyGrad.addColorStop(0, '#1A2B42');
    skyGrad.addColorStop(0.6, '#0B1D3A');
    skyGrad.addColorStop(1, '#050D1F');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, skyEnd);

    // Stars / dot pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 73) % (skyEnd * 0.7);
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // ─── Ground ──
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, groundY, W, H - groundY);

    // ─── Road surface ──
    const roadHeight = H * 0.16;
    const roadTop = groundY + 4;
    const roadBottom = roadTop + roadHeight;
    ctx.fillStyle = '#2D3340';
    ctx.fillRect(0, roadTop, W, roadHeight);

    // Yellow shoulder lines (top + bottom)
    ctx.strokeStyle = '#E8A838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadTop + 1);
    ctx.lineTo(W, roadTop + 1);
    ctx.moveTo(0, roadBottom - 1);
    ctx.lineTo(W, roadBottom - 1);
    ctx.stroke();

    // ─── Distance markers ──
    if (layers.distanceMarkers) {
      // Determine marker spacing by scale
      let stepM = 5;
      if (meterPx < 4) stepM = 25;
      else if (meterPx < 8) stepM = 10;
      else if (meterPx < 20) stepM = 5;
      else stepM = 1;

      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';

      const startM = Math.floor(-safePeak / stepM) * stepM;
      const endM = Math.ceil(safePeak / stepM) * stepM;
      for (let m = startM; m <= endM; m += stepM) {
        const x = vehicleScreenX(m);
        if (x < -10 || x > W + 10) continue;
        // Tick on road
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, roadTop);
        ctx.lineTo(x, roadTop + 6);
        ctx.stroke();
        // Label below road
        ctx.fillStyle = 'rgba(250, 251, 249, 0.55)';
        ctx.fillText(`${m}m`, x, roadBottom + 14);
      }
    } else {
      // Just dashed center line for visual road feel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(0, (roadTop + roadBottom) / 2);
      ctx.lineTo(W, (roadTop + roadBottom) / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Always draw the start (origin) marker
    const x0 = vehicleScreenX(0);
    if (x0 >= 0 && x0 <= W) {
      ctx.strokeStyle = 'rgba(42, 157, 110, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, roadTop - 4);
      ctx.lineTo(x0, roadBottom + 4);
      ctx.stroke();
      ctx.fillStyle = '#2A9D6E';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('0', x0, roadTop - 8);
    }

    // ─── Ghost trails ──
    if (layers.ghostTrail && ghosts.length > 0) {
      ghosts.forEach((ghost) => {
        ctx.strokeStyle = ghost.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ghost.positions.forEach((p, i) => {
          const x = vehicleScreenX(p.s);
          const y = (roadTop + roadBottom) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    // ─── Vehicle ──
    const vY = (roadTop + roadBottom) / 2;
    const vX = vehicleScreenX(liveS);
    // Wheel rotation = circumference progress
    const wheelR = WHEEL_RADIUS[vehicle];
    const wheelRotation = (liveS * meterPx) / wheelR;

    // Direction: if velocity is negative, face left (flip)
    const facingLeft = liveV < -0.1;

    ctx.save();
    ctx.translate(vX, vY);
    if (facingLeft) ctx.scale(-1, 1);
    drawVehicle(ctx, vehicle, wheelRotation);
    ctx.restore();

    // ─── Velocity arrow ──
    if (layers.velocityArrow && Math.abs(liveV) > 0.05) {
      const arrowLen = Math.min(140, Math.abs(liveV) * 6);
      const dir = Math.sign(liveV);
      drawArrow(
        ctx,
        vX,
        vY - 28,
        vX + arrowLen * dir,
        vY - 28,
        '#2A9D6E',
        3
      );
      // Label
      ctx.fillStyle = '#2A9D6E';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`v = ${liveV.toFixed(1)} m/s`, vX + (arrowLen * dir) / 2, vY - 32);
    }

    // ─── Acceleration arrow ──
    if (layers.accelerationArrow && Math.abs(values.a) > 0.05) {
      const arrowLen = Math.min(80, Math.abs(values.a) * 8);
      const dir = Math.sign(values.a);
      drawArrow(
        ctx,
        vX,
        vY + 30,
        vX + arrowLen * dir,
        vY + 30,
        '#E8A838',
        3
      );
      ctx.fillStyle = '#E8A838';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`a = ${values.a.toFixed(1)} m/s²`, vX + (arrowLen * dir) / 2, vY + 44);
    }

    // ─── Time/velocity readout floating above vehicle ──
    ctx.fillStyle = 'rgba(11, 29, 58, 0.85)';
    const labelText = `t: ${liveTime.toFixed(1)}s · s: ${liveS.toFixed(1)}m`;
    ctx.font = 'bold 11px ui-monospace, monospace';
    const textW = ctx.measureText(labelText).width;
    const lblX = vX - textW / 2 - 6;
    const lblY = vY - 60;
    ctx.beginPath();
    ctx.roundRect(lblX, lblY, textW + 12, 18, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    ctx.fillStyle = '#FAFBF9';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, vX, lblY + 12);

    // ─── Frame border (subtle) ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  }, [values, vehicle, liveTime, liveS, liveV, duration, layers, ghosts]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl"
      style={{
        background: '#050D1F',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        minHeight: '180px',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── Arrow drawing helper ─────────────────────────────────
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

  // Shaft (stop short of head)
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(angle) * headLen * 0.6, y2 - Math.sin(angle) * headLen * 0.6);
  ctx.stroke();

  // Head
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
