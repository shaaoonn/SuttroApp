'use client';

import { useEffect, useRef, useState } from 'react';
import SceneOverlayControls from '@/simulations/physics/motion/components/SceneOverlayControls';
import { PLANET_GRAVITY, PLANET_NAMES, weight } from '../physics';
import type { ForceVars, LayerVisibility, PlanetKey, PlaybackStatus } from '../types';

interface Props {
  values: ForceVars;
  planet: PlanetKey;
  onPlanetChange: (p: PlanetKey) => void;
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

const PLANETS: PlanetKey[] = ['moon', 'mars', 'earth', 'jupiter'];

/**
 * Weight scene: 🧍 standing on selectable planet 🌙🔴🌍🪐. Planet selector
 * top-left. Big spring-scale visual showing weight = mg in N.
 */
export default function WeightScene({
  values,
  planet,
  onPlanetChange,
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

    // Background depends on planet
    const bg = planetBackground(planet);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, bg.skyTop);
    bgGrad.addColorStop(0.5, bg.skyMid);
    bgGrad.addColorStop(1, bg.ground);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars on Moon/Mars/Jupiter (no Earth atmosphere)
    if (planet !== 'earth') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 60; i++) {
        const x = (i * 137.5) % W;
        const y = (i * 73) % (H * 0.55);
        ctx.beginPath();
        ctx.arc(x, y, ((i % 3) + 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Earth-specific clouds
    if (planet === 'earth') {
      drawCloud(ctx, W * 0.2, H * 0.15, 1.0);
      drawCloud(ctx, W * 0.7, H * 0.10, 0.85);
    }

    // Ground
    const groundY = H * 0.7;
    ctx.fillStyle = bg.ground;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = bg.groundDark;
    ctx.fillRect(0, groundY, W, 4);

    // Planet image (big circle in distance) for visual context
    const pX = W * 0.85;
    const pY = H * 0.22;
    drawPlanet(ctx, planet, pX, pY, 50);

    // Person on ground
    const personX = W * 0.4;
    const personY = groundY - 5;
    ctx.font = `${100 * zoom}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('🧍', personX, personY);
    ctx.textBaseline = 'alphabetic';

    // Weight arrow (gravity, pointing down)
    if (layers.forceArrow) {
      const W_force = weight(values.m, PLANET_GRAVITY[planet]);
      const arrLen = Math.min(160, W_force * 0.15);
      const ax = personX;
      const ay = personY - 60 * zoom;
      drawArrow(ctx, ax, ay, ax, ay + arrLen, '#DC2626', 5);
      if (layers.values) {
        ctx.font = 'bold 14px ui-monospace, monospace';
        const lbl = `W = ${W_force.toFixed(1)} N`;
        const lblW = ctx.measureText(lbl).width;
        const lblX = ax + 70;
        const lblY = ay + arrLen / 2;
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.roundRect(lblX - lblW / 2 - 8, lblY - 12, lblW + 16, 24, 12);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, lblX, lblY);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // Big formula readout
    const W_force = weight(values.m, PLANET_GRAVITY[planet]);
    const planetMeta = PLANET_NAMES[planet];
    ctx.font = 'bold 18px ui-monospace, monospace';
    const mainLbl = `${planetMeta.emoji} ${planetMeta.bn}: W = mg = ${values.m.toFixed(1)} × ${PLANET_GRAVITY[planet].toFixed(2)} = ${W_force.toFixed(1)} N`;
    const mainW = ctx.measureText(mainLbl).width;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.92)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - mainW / 2 - 12, 14, mainW + 24, 30, 12);
    ctx.fill();
    ctx.fillStyle = '#FCD34D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainLbl, W / 2, 29);
    ctx.textBaseline = 'alphabetic';

    // Mass label below person
    if (layers.values) {
      ctx.font = `bold 12px sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.fillText(`m = ${values.m.toFixed(1)} kg`, personX, personY + 16);
    }
  }, [values, planet, zoom, layers, resizeKey]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: '#1E1B4B' }}>
      <canvas ref={canvasRef} />
      {/* Planet selector overlay (top-left) */}
      <div
        className="absolute top-2 left-2 z-10 flex flex-col rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
          padding: '6px',
          gap: '4px',
        }}
      >
        {PLANETS.map((p) => {
          const meta = PLANET_NAMES[p];
          const active = p === planet;
          return (
            <button
              key={p}
              onClick={() => onPlanetChange(p)}
              className="rounded-lg flex items-center gap-1.5 px-2 py-1 transition-all"
              style={{
                background: active ? '#3B82F6' : 'transparent',
                color: active ? '#FFFFFF' : '#1E293B',
                border: active ? '1px solid #3B82F6' : '1px solid transparent',
                fontSize: '11px',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
              }}
              title={meta.bn}
              aria-pressed={active}
            >
              <span style={{ fontSize: '16px' }}>{meta.emoji}</span>
              <span>{meta.bn}</span>
              <span style={{ fontSize: '9px', opacity: 0.7, fontFamily: 'monospace' }}>
                {PLANET_GRAVITY[p].toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
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

function planetBackground(p: PlanetKey): { skyTop: string; skyMid: string; ground: string; groundDark: string } {
  switch (p) {
    case 'moon':
      return { skyTop: '#0B0B2D', skyMid: '#1E1B4B', ground: '#9CA3AF', groundDark: '#6B7280' };
    case 'mars':
      return { skyTop: '#7C2D12', skyMid: '#C2410C', ground: '#9A3412', groundDark: '#7C2D12' };
    case 'jupiter':
      return { skyTop: '#451A03', skyMid: '#78350F', ground: '#D97706', groundDark: '#92400E' };
    case 'earth':
    default:
      return { skyTop: '#7CC2F0', skyMid: '#A6D4ED', ground: '#7BB661', groundDark: '#5A9A4A' };
  }
}

function drawPlanet(ctx: CanvasRenderingContext2D, planet: PlanetKey, x: number, y: number, r: number) {
  const colors: Record<PlanetKey, string[]> = {
    moon: ['#E5E7EB', '#9CA3AF', '#4B5563'],
    mars: ['#F87171', '#DC2626', '#7C2D12'],
    earth: ['#60A5FA', '#3B82F6', '#1E40AF'],
    jupiter: ['#FBBF24', '#D97706', '#78350F'],
  };
  const [c1, c2, c3] = colors[planet];
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  grad.addColorStop(0, c1);
  grad.addColorStop(0.6, c2);
  grad.addColorStop(1, c3);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Jupiter has bands
  if (planet === 'jupiter') {
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.55)';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(x, y + i * 8, r * 0.95, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Mars has darker patches
  if (planet === 'mars') {
    ctx.fillStyle = 'rgba(124, 45, 18, 0.6)';
    ctx.beginPath();
    ctx.arc(x - 12, y - 5, 8, 0, Math.PI * 2);
    ctx.arc(x + 10, y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Moon has craters
  if (planet === 'moon') {
    ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
    [{ x: -10, y: -8, r: 5 }, { x: 8, y: 4, r: 4 }, { x: -4, y: 12, r: 3 }].forEach(
      (c) => {
        ctx.beginPath();
        ctx.arc(x + c.x, y + c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      },
    );
  }
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
  const headLen = Math.min(15, len * 0.35);
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
