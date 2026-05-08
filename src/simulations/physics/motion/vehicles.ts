// ─────────────────────────────────────────────
// Vehicle drawing primitives — pure Canvas 2D
// Each function draws at origin (0, 0) facing right.
// Caller controls position via translate/scale before calling.
// All vehicles drawn within a 120 × 60 unit box (centered at 0,0)
// ─────────────────────────────────────────────

import type { VehicleKey } from './types';

const COLORS = {
  body: '#E8A838',       // suttro accent — warm yellow
  bodyDark: '#C28528',
  cockpit: '#0B1D3A',
  wheel: '#1F2937',
  wheelInner: '#4B5563',
  highlight: 'rgba(255, 255, 255, 0.25)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  cngGreen: '#1B6B4A',
  cngYellow: '#FCD34D',
  bicycleFrame: '#DC2626',
  rocketSilver: '#D1D5DB',
  rocketRed: '#DC2626',
  ballRed: '#DC2626',
  ballWhite: '#FAFBF9',
};

// Helper: draw rotating wheel
function drawWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rotation: number
) {
  // Tire
  ctx.fillStyle = COLORS.wheel;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Rim
  ctx.fillStyle = COLORS.wheelInner;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  // Spokes (rotating)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = COLORS.wheel;
  ctx.lineWidth = Math.max(1.5, r * 0.15);
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // Hub
  ctx.fillStyle = COLORS.wheel;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

// ─── SEDAN ─────────────────────────────────────────────────
function drawSedan(ctx: CanvasRenderingContext2D, wheelRotation: number) {
  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 22, 55, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lower body
  ctx.fillStyle = COLORS.bodyDark;
  ctx.beginPath();
  ctx.roundRect(-50, 0, 100, 18, 4);
  ctx.fill();

  // Main body (cabin shape)
  ctx.fillStyle = COLORS.body;
  ctx.beginPath();
  ctx.moveTo(-50, 0);
  ctx.lineTo(-35, -8);
  ctx.lineTo(-15, -22);
  ctx.lineTo(20, -22);
  ctx.lineTo(38, -8);
  ctx.lineTo(50, 0);
  ctx.closePath();
  ctx.fill();

  // Cabin window
  ctx.fillStyle = COLORS.cockpit;
  ctx.beginPath();
  ctx.moveTo(-30, -7);
  ctx.lineTo(-13, -19);
  ctx.lineTo(18, -19);
  ctx.lineTo(35, -7);
  ctx.closePath();
  ctx.fill();

  // Window highlight
  ctx.fillStyle = COLORS.highlight;
  ctx.beginPath();
  ctx.moveTo(-26, -8);
  ctx.lineTo(-12, -17);
  ctx.lineTo(-2, -17);
  ctx.lineTo(-15, -9);
  ctx.closePath();
  ctx.fill();

  // Headlight
  ctx.fillStyle = COLORS.cngYellow;
  ctx.beginPath();
  ctx.arc(46, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  drawWheel(ctx, -28, 18, 11, wheelRotation);
  drawWheel(ctx, 28, 18, 11, wheelRotation);
}

// ─── MOTORCYCLE ────────────────────────────────────────────
function drawMotorcycle(ctx: CanvasRenderingContext2D, wheelRotation: number) {
  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 24, 45, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Frame
  ctx.strokeStyle = COLORS.body;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-22, 14);
  ctx.lineTo(-5, -8);
  ctx.lineTo(15, -8);
  ctx.lineTo(28, 14);
  ctx.stroke();

  // Seat
  ctx.fillStyle = COLORS.cockpit;
  ctx.beginPath();
  ctx.roundRect(-8, -14, 22, 8, 3);
  ctx.fill();

  // Tank
  ctx.fillStyle = COLORS.body;
  ctx.beginPath();
  ctx.roundRect(-2, -10, 18, 6, 2);
  ctx.fill();

  // Handlebar
  ctx.strokeStyle = COLORS.wheel;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, -8);
  ctx.lineTo(28, -16);
  ctx.stroke();

  // Headlight
  ctx.fillStyle = COLORS.cngYellow;
  ctx.beginPath();
  ctx.arc(30, -8, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  drawWheel(ctx, -22, 16, 11, wheelRotation);
  drawWheel(ctx, 28, 16, 11, wheelRotation);
}

// ─── CNG ───────────────────────────────────────────────────
function drawCNG(ctx: CanvasRenderingContext2D, wheelRotation: number) {
  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 24, 50, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body — green box with curved roof
  ctx.fillStyle = COLORS.cngGreen;
  ctx.beginPath();
  ctx.moveTo(-40, 18);
  ctx.lineTo(-40, -10);
  ctx.lineTo(-30, -22);
  ctx.lineTo(35, -22);
  ctx.lineTo(40, -10);
  ctx.lineTo(40, 18);
  ctx.closePath();
  ctx.fill();

  // Yellow strip
  ctx.fillStyle = COLORS.cngYellow;
  ctx.fillRect(-40, 0, 80, 4);

  // Window
  ctx.fillStyle = COLORS.cockpit;
  ctx.beginPath();
  ctx.roundRect(-30, -18, 60, 14, 2);
  ctx.fill();

  // Window highlight
  ctx.fillStyle = COLORS.highlight;
  ctx.beginPath();
  ctx.roundRect(-26, -16, 18, 6, 1);
  ctx.fill();

  // Front headlight
  ctx.fillStyle = COLORS.cngYellow;
  ctx.beginPath();
  ctx.arc(36, 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Wheels — CNG has 3 wheels (1 front, 2 back)
  drawWheel(ctx, -25, 18, 10, wheelRotation);
  drawWheel(ctx, 25, 18, 10, wheelRotation);
}

// ─── BICYCLE ───────────────────────────────────────────────
function drawBicycle(ctx: CanvasRenderingContext2D, wheelRotation: number) {
  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 26, 40, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Frame — diamond pattern
  ctx.strokeStyle = COLORS.bicycleFrame;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Bottom tube
  ctx.moveTo(-20, 12);
  ctx.lineTo(20, 12);
  // Down tube
  ctx.moveTo(0, -10);
  ctx.lineTo(20, 12);
  // Seat tube
  ctx.moveTo(-20, 12);
  ctx.lineTo(0, -10);
  // Top tube
  ctx.moveTo(0, -10);
  ctx.lineTo(-2, -18);
  // Handlebar stem
  ctx.moveTo(0, -10);
  ctx.lineTo(15, -18);
  ctx.stroke();

  // Handlebar
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(13, -19);
  ctx.lineTo(20, -19);
  ctx.stroke();

  // Seat
  ctx.fillStyle = COLORS.cockpit;
  ctx.beginPath();
  ctx.roundRect(-7, -22, 14, 4, 1.5);
  ctx.fill();

  // Wheels (smaller, more spokes for bicycle)
  drawWheel(ctx, -20, 14, 10, wheelRotation);
  drawWheel(ctx, 20, 14, 10, wheelRotation);
}

// ─── ROCKET ────────────────────────────────────────────────
function drawRocket(ctx: CanvasRenderingContext2D, wheelRotation: number) {
  // Rocket flies — no wheels, exhaust flame instead
  // (wheelRotation reused for flame flicker)
  const flameSize = 1 + Math.sin(wheelRotation * 5) * 0.15;

  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 24, 35, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Exhaust flame (back of rocket)
  ctx.fillStyle = COLORS.cngYellow;
  ctx.beginPath();
  ctx.moveTo(-35, -3);
  ctx.lineTo(-55 * flameSize, 0);
  ctx.lineTo(-35, 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-35, -1.5);
  ctx.lineTo(-45 * flameSize, 0);
  ctx.lineTo(-35, 1.5);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.fillStyle = COLORS.rocketSilver;
  ctx.beginPath();
  ctx.moveTo(-35, -8);
  ctx.lineTo(20, -8);
  ctx.lineTo(35, 0);
  ctx.lineTo(20, 8);
  ctx.lineTo(-35, 8);
  ctx.closePath();
  ctx.fill();

  // Red stripe
  ctx.fillStyle = COLORS.rocketRed;
  ctx.fillRect(-35, -2, 50, 4);

  // Window
  ctx.fillStyle = COLORS.cockpit;
  ctx.beginPath();
  ctx.arc(10, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.highlight;
  ctx.beginPath();
  ctx.arc(8, -1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Fins
  ctx.fillStyle = COLORS.rocketRed;
  ctx.beginPath();
  ctx.moveTo(-35, -8);
  ctx.lineTo(-42, -13);
  ctx.lineTo(-30, -8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-35, 8);
  ctx.lineTo(-42, 13);
  ctx.lineTo(-30, 8);
  ctx.closePath();
  ctx.fill();
}

// ─── BALL ──────────────────────────────────────────────────
function drawBall(ctx: CanvasRenderingContext2D, wheelRotation: number) {
  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 22, 18, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ball body
  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(wheelRotation);

  // Soccer-ball pattern
  ctx.fillStyle = COLORS.ballWhite;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Pentagons (simplified)
  ctx.fillStyle = COLORS.cockpit;
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 5);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(4, -6);
    ctx.lineTo(2, 0);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // Highlight
  ctx.fillStyle = COLORS.highlight;
  ctx.beginPath();
  ctx.arc(-6, -7, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Public API ────────────────────────────────────────────

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleKey,
  wheelRotation: number
) {
  switch (vehicle) {
    case 'sedan':
      drawSedan(ctx, wheelRotation);
      break;
    case 'motorcycle':
      drawMotorcycle(ctx, wheelRotation);
      break;
    case 'cng':
      drawCNG(ctx, wheelRotation);
      break;
    case 'bicycle':
      drawBicycle(ctx, wheelRotation);
      break;
    case 'rocket':
      drawRocket(ctx, wheelRotation);
      break;
    case 'ball':
      drawBall(ctx, wheelRotation);
      break;
  }
}

/**
 * Approximate "wheel radius" (in canvas units) — used to compute
 * wheel rotation rate from velocity. Matches rendered wheels above.
 */
export const WHEEL_RADIUS: Record<VehicleKey, number> = {
  sedan: 11,
  motorcycle: 11,
  cng: 10,
  bicycle: 10,
  rocket: 10, // for flame flicker
  ball: 18,
};

/** How wide vehicle is (for camera framing) */
export const VEHICLE_WIDTH: Record<VehicleKey, number> = {
  sedan: 100,
  motorcycle: 60,
  cng: 80,
  bicycle: 50,
  rocket: 70,
  ball: 36,
};
