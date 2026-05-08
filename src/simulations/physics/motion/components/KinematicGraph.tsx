'use client';

import { useEffect, useRef } from 'react';
import { positionAt, velocityAt } from '../physics';
import type { KinematicVars } from '../types';

interface Props {
  /** Which quantity to plot on Y axis */
  variant: 'velocity' | 'displacement';
  values: KinematicVars;
  duration: number;
  liveTime: number;
  /** For free fall, override u/a to 0/g */
  isFreefall?: boolean;
}

const G = 9.81;

export default function KinematicGraph({
  variant,
  values,
  duration,
  liveTime,
  isFreefall,
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

    const padL = 38;
    const padR = 8;
    const padT = 8;
    const padB = 22;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    // ─── Compute Y-range ──
    const u = isFreefall ? 0 : values.u;
    const a = isFreefall ? G : values.a;
    const f =
      variant === 'velocity'
        ? (t: number) => velocityAt(u, a, t)
        : (t: number) => positionAt(u, a, t);

    let yMin = 0,
      yMax = 1;
    const samples = 60;
    const ys: number[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = (duration * i) / samples;
      const y = f(t);
      ys.push(y);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
    if (yMin === yMax) {
      yMax = yMin + 1;
    }
    const yRange = yMax - yMin;

    // ─── Background ──
    ctx.fillStyle = '#050D1F';
    ctx.fillRect(0, 0, W, H);

    // ─── Grid ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    const yLines = 5;
    ctx.font = '9px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(250, 251, 249, 0.5)';
    ctx.textAlign = 'right';
    for (let i = 0; i <= yLines; i++) {
      const y = padT + (innerH * i) / yLines;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      const yVal = yMax - (yRange * i) / yLines;
      ctx.fillText(yVal.toFixed(1), padL - 4, y + 3);
    }

    // ─── X axis (time) ──
    const xLines = 5;
    ctx.textAlign = 'center';
    for (let i = 0; i <= xLines; i++) {
      const x = padL + (innerW * i) / xLines;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + innerH);
      ctx.stroke();
      const tVal = (duration * i) / xLines;
      ctx.fillText(`${tVal.toFixed(1)}s`, x, H - 6);
    }

    // ─── Zero line (if range crosses zero) ──
    if (yMin < 0 && yMax > 0) {
      const zeroY = padT + (yMax / yRange) * innerH;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, zeroY);
      ctx.lineTo(W - padR, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ─── Axis labels ──
    ctx.fillStyle = 'rgba(250, 251, 249, 0.55)';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(variant === 'velocity' ? 'v (m/s)' : 's (m)', padL + 2, padT + 9);
    ctx.textAlign = 'right';
    ctx.fillText('t (s)', W - padR - 2, H - 6);

    // ─── Plot the function ──
    const xPos = (t: number) => padL + (t / duration) * innerW;
    const yPos = (y: number) => padT + ((yMax - y) / yRange) * innerH;

    ctx.strokeStyle = variant === 'velocity' ? '#2A9D6E' : '#E8A838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = (duration * i) / samples;
      const y = f(t);
      const px = xPos(t);
      const py = yPos(y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // ─── Live time marker ──
    if (liveTime > 0 && liveTime <= duration) {
      const lx = xPos(liveTime);
      const ly = yPos(f(liveTime));
      // Vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, padT);
      ctx.lineTo(lx, padT + innerH);
      ctx.stroke();
      // Dot
      ctx.fillStyle = variant === 'velocity' ? '#2A9D6E' : '#E8A838';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FAFBF9';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [values, duration, liveTime, variant, isFreefall]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        background: '#050D1F',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: '120px',
        height: '140px',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
