'use client';

import { useEffect, useRef } from 'react';
import { positionAt, velocityAt } from '../physics';
import type { KinematicVars } from '../types';

interface Props {
  variant: 'velocity' | 'displacement';
  values: KinematicVars;
  duration: number;
  liveTime: number;
  isFreefall?: boolean;
  /** Compact mode for fullscreen side rail — shorter height + smaller text */
  compact?: boolean;
}

const G = 9.81;

export default function KinematicGraph({
  variant,
  values,
  duration,
  liveTime,
  isFreefall,
  compact = false,
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
    const padL = compact ? 28 : 36;
    const padR = compact ? 6 : 8;
    const padT = compact ? 12 : 16;
    const padB = compact ? 16 : 22;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const u = isFreefall ? 0 : values.u;
    const a = isFreefall ? G : values.a;
    const f = variant === 'velocity'
      ? (t: number) => velocityAt(u, a, t)
      : (t: number) => positionAt(u, a, t);

    let yMin = 0, yMax = 1;
    const samples = 60;
    for (let i = 0; i <= samples; i++) {
      const t = (duration * i) / samples;
      const y = f(t);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
    if (yMin === yMax) yMax = yMin + 1;
    const yRange = yMax - yMin;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // Grid
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    const yLines = compact ? 3 : 4;
    ctx.font = compact ? '8px ui-monospace, monospace' : '9px ui-monospace, monospace';
    ctx.fillStyle = '#94A3B8';
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

    const xLines = compact ? 3 : 4;
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

    // Zero line
    if (yMin < 0 && yMax > 0) {
      const zeroY = padT + (yMax / yRange) * innerH;
      ctx.strokeStyle = '#CBD5E1';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, zeroY);
      ctx.lineTo(W - padR, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Title (top-left)
    ctx.fillStyle = '#475569';
    ctx.font = compact ? 'bold 9px ui-monospace, monospace' : 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(variant === 'velocity' ? 'v (m/s)' : 's (m)', padL + 2, padT - 4);
    ctx.textAlign = 'right';
    ctx.fillText('t (s)', W - padR - 2, H - 4);

    // Plot
    const xPos = (t: number) => padL + (t / duration) * innerW;
    const yPos = (y: number) => padT + ((yMax - y) / yRange) * innerH;

    const plotColor = variant === 'velocity' ? '#16A34A' : '#F59E0B';

    // Filled area below curve
    ctx.fillStyle = plotColor + '15';
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(Math.max(yMin, 0)));
    for (let i = 0; i <= samples; i++) {
      const t = (duration * i) / samples;
      ctx.lineTo(xPos(t), yPos(f(t)));
    }
    ctx.lineTo(xPos(duration), yPos(Math.max(yMin, 0)));
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = plotColor;
    ctx.lineWidth = 2.5;
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

    // Live marker
    if (liveTime > 0 && liveTime <= duration) {
      const lx = xPos(liveTime);
      const ly = yPos(f(liveTime));
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, padT);
      ctx.lineTo(lx, padT + innerH);
      ctx.stroke();
      ctx.fillStyle = plotColor;
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [values, duration, liveTime, variant, isFreefall, compact]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        minHeight: compact ? '70px' : '100px',
        height: compact ? '80px' : '120px',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
