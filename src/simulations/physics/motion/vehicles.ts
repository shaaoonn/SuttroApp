// ─────────────────────────────────────────────
// Vehicle drawing — uses platform emoji for realistic look
// (Apple, Google, Microsoft emojis are detailed renderings)
// Caller controls position via translate before calling.
// ─────────────────────────────────────────────

import type { VehicleKey } from './types';

// Default size (in CSS pixels) for the emoji
const DEFAULT_SIZE = 90;

// Per-vehicle emoji + size adjustment
const VEHICLE_DATA: Record<VehicleKey, { emoji: string; size: number; faceLeft?: boolean }> = {
  sedan:      { emoji: '🚗',  size: 96 },
  motorcycle: { emoji: '🏍️', size: 88 },
  cng:        { emoji: '🛺',  size: 92 },
  bicycle:    { emoji: '🚲',  size: 84 },
  rocket:     { emoji: '🚀',  size: 88 },
  ball:       { emoji: '⚽',  size: 60 },
};

/**
 * Draw a vehicle (or projectile) at the current Canvas origin (0, 0).
 * The caller must `ctx.translate(x, y)` first.
 *
 * @param wheelRotation  Used only for ball (rolls). Other emojis don't rotate.
 */
export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleKey,
  wheelRotation: number,
) {
  const { emoji, size } = VEHICLE_DATA[vehicle];

  // Soft ground shadow under the emoji
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.42, size * 0.38, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Ball: rolls (rotates with motion)
  if (vehicle === 'ball') {
    ctx.rotate(wheelRotation);
  }

  // Emoji rendering — small Y-offset so emoji sits ON the road
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

/** Approximate visual radius for wheel rotation calculation (ball only) */
export const WHEEL_RADIUS: Record<VehicleKey, number> = {
  sedan: 48,
  motorcycle: 44,
  cng: 46,
  bicycle: 42,
  rocket: 44,
  ball: 30,
};

/** Vehicle width (for camera framing) */
export const VEHICLE_WIDTH: Record<VehicleKey, number> = {
  sedan: 96,
  motorcycle: 88,
  cng: 92,
  bicycle: 84,
  rocket: 88,
  ball: 60,
};

/** Get the emoji char for VehiclePicker UI */
export function vehicleEmoji(vehicle: VehicleKey): string {
  return VEHICLE_DATA[vehicle].emoji;
}

/** Default size used by drawVehicle (for callers that need to know) */
export { DEFAULT_SIZE };
