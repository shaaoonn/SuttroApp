'use client';

import { useEffect, useRef, useState } from 'react';
import { G } from '../physics';
import type {
  KinematicVars,
  LayerVisibility,
  Mode,
  PlaybackSpeed,
  PlaybackStatus,
  VariableKey,
  VehicleKey,
} from '../types';
import { drawVehicle, vehicleSize, WHEEL_RADIUS } from '../vehicles';
import VehiclePickerOverlay from './VehiclePickerOverlay';
import SceneOverlayControls from './SceneOverlayControls';
import EmbeddedSliders from './EmbeddedSliders';

interface Props {
  values: KinematicVars;
  vehicle: VehicleKey;
  liveTime: number;
  liveS: number;
  liveV: number;
  duration: number;
  layers: LayerVisibility;
  zoom: number;
  mode: Mode;
  unknown: VariableKey | null;
  activeVars: VariableKey[];
  onValueChange: (key: VariableKey, value: number) => void;
  onVehicleChange: (v: VehicleKey) => void;
  playbackStatus: PlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  extendedControls?: boolean;
  speed?: PlaybackSpeed;
  onSpeedChange?: (s: PlaybackSpeed) => void;
  onZoomChange?: (z: number) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  hideOverlayControls?: boolean;
}

export default function FreeFallScene(props: Props) {
  const {
    values, vehicle, liveTime, liveS, liveV, duration, layers, zoom,
    mode, unknown, activeVars, onValueChange, onVehicleChange,
    playbackStatus, onPlay, onPause, onReset,
    extendedControls, speed, onSpeedChange, onZoomChange,
    onToggleFullscreen, isFullscreen, hideOverlayControls,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-draw when container size changes (fullscreen toggle, rotation, etc.)
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

    const totalH = Math.max(1, 0.5 * G * duration * duration);
    const usableHeight = H - 130;
    const meterPx = usableHeight / totalH;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#7CC2F0');
    skyGrad.addColorStop(0.7, '#A6D4ED');
    skyGrad.addColorStop(1, '#7BB661');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const sunX = W * 0.85;
    const sunY = H * 0.14;
    const sunR = 28;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3);
    glow.addColorStop(0, 'rgba(255, 230, 150, 0.55)');
    glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sunX - sunR * 3, sunY - sunR * 3, sunR * 6, sunR * 6);
    ctx.fillStyle = '#FFD86E';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    drawCloud(ctx, W * 0.18, H * 0.14, 0.85);
    drawCloud(ctx, W * 0.62, H * 0.22, 0.95);

    // Ground
    const groundY = H - 50;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, '#5A9A4A');
    groundGrad.addColorStop(1, '#477A3D');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = '#3A6630';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Tower
    const towerX = W * 0.20;
    const towerW = 50;
    const towerTop = 30;
    const towerGrad = ctx.createLinearGradient(towerX, 0, towerX + towerW, 0);
    towerGrad.addColorStop(0, '#8B7355');
    towerGrad.addColorStop(0.5, '#A08770');
    towerGrad.addColorStop(1, '#6B5840');
    ctx.fillStyle = towerGrad;
    ctx.fillRect(towerX, towerTop, towerW, groundY - towerTop);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    for (let y = towerTop + 18; y < groundY; y += 18) {
      ctx.beginPath();
      ctx.moveTo(towerX, y);
      ctx.lineTo(towerX + towerW, y);
      ctx.stroke();
      const offset = ((y - towerTop) / 18) % 2 === 0 ? 0 : towerW / 2;
      ctx.beginPath();
      ctx.moveTo(towerX + offset, y);
      ctx.lineTo(towerX + offset, y + 18);
      ctx.moveTo(towerX + offset + towerW / 2, y);
      ctx.lineTo(towerX + offset + towerW / 2, y + 18);
      ctx.stroke();
    }

    ctx.fillStyle = '#6B5840';
    ctx.fillRect(towerX - 4, towerTop - 6, towerW + 8, 6);
    for (let i = 0; i < 4; i++) {
      const x = towerX - 4 + i * ((towerW + 8) / 4);
      ctx.fillRect(x, towerTop - 12, (towerW + 8) / 8, 6);
    }

    // Falling object
    const baseSize = vehicleSize(vehicle);
    const vSize = baseSize * zoom;
    const objX = towerX + towerW + 90;
    const objY = towerTop + 12 + liveS * meterPx;

    if (layers.distanceMarkers) {
      let stepM = 1;
      if (totalH > 50) stepM = 10;
      else if (totalH > 20) stepM = 5;
      else if (totalH > 10) stepM = 2;

      const fs = Math.round(12 * zoom);
      ctx.font = `bold ${fs}px ui-monospace, monospace`;
      ctx.textAlign = 'right';
      for (let m = 0; m <= totalH; m += stepM) {
        const y = towerTop + 12 + m * meterPx;
        if (y > groundY) continue;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(towerX + towerW + 6, y);
        ctx.lineTo(towerX + towerW + 16, y);
        ctx.stroke();
        ctx.fillStyle = '#0B1D3A';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3;
        const lbl = `${m}m`;
        ctx.strokeText(lbl, towerX - 6, y + 3);
        ctx.fillText(lbl, towerX - 6, y + 3);
      }
    }

    // Object
    ctx.save();
    ctx.translate(objX, objY);
    ctx.scale(zoom, zoom);
    const wheelR = WHEEL_RADIUS[vehicle];
    const rotation = (liveS * meterPx) / wheelR;
    drawVehicle(ctx, vehicle, rotation, 1);
    ctx.restore();

    if (layers.velocityArrow && liveV > 0.05) {
      const arrLen = Math.min(110, liveV * 4);
      drawArrow(ctx, objX + vSize * 0.55, objY, objX + vSize * 0.55, objY + arrLen, '#16A34A', 4);
      const fs = Math.round(12 * zoom);
      ctx.font = `bold ${fs}px ui-monospace, monospace`;
      const lbl = `v = ${liveV.toFixed(1)} m/s`;
      const lblW = ctx.measureText(lbl).width;
      const lblX = objX + vSize * 0.55 + 10;
      const lblY = objY + arrLen / 2;
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.roundRect(lblX, lblY - fs * 0.85, lblW + 14, fs * 1.7, fs);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, lblX + 7, lblY);
      ctx.textBaseline = 'alphabetic';
    }

    if (layers.accelerationArrow) {
      drawArrow(ctx, objX - vSize * 0.55, objY, objX - vSize * 0.55, objY + 45, '#EA580C', 4);
      const fs = Math.round(12 * zoom);
      ctx.font = `bold ${fs}px ui-monospace, monospace`;
      ctx.fillStyle = '#EA580C';
      ctx.textAlign = 'right';
      ctx.fillText('g', objX - vSize * 0.55 - 6, objY + 27);
    }

    // Readout
    const fs = Math.round(13 * zoom);
    ctx.font = `bold ${fs}px ui-monospace, monospace`;
    const labelText = `t: ${liveTime.toFixed(2)}s   ·   h: ${liveS.toFixed(1)}m`;
    ctx.textAlign = 'left';
    const textW = ctx.measureText(labelText).width;
    const lblX = W - textW - 32;
    const lblY = 18;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.92)';
    ctx.beginPath();
    ctx.roundRect(lblX, lblY, textW + 20, fs * 2, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, lblX + 10, lblY + fs);
    ctx.textBaseline = 'alphabetic';
  }, [values, vehicle, liveTime, liveS, liveV, duration, layers, zoom, resizeKey]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#7CC2F0' }}
    >
      <canvas ref={canvasRef} />
      <VehiclePickerOverlay current={vehicle} onChange={onVehicleChange} />
      <EmbeddedSliders
        values={values}
        mode={mode}
        unknown={unknown}
        activeVars={activeVars}
        onChange={onValueChange}
      />
      {!hideOverlayControls && (
        <SceneOverlayControls
          status={playbackStatus}
          onPlay={onPlay}
          onPause={onPause}
          onReset={onReset}
          extended={extendedControls}
          speed={speed}
          onSpeedChange={onSpeedChange}
          zoom={zoom}
          onZoomChange={onZoomChange}
          onToggleFullscreen={onToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}
    </div>
  );
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(-25, 0, 16, 0, Math.PI * 2);
  ctx.arc(-8, -7, 19, 0, Math.PI * 2);
  ctx.arc(13, -5, 21, 0, Math.PI * 2);
  ctx.arc(30, 2, 16, 0, Math.PI * 2);
  ctx.arc(0, 7, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width: number
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
