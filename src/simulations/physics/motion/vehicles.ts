// ─────────────────────────────────────────────
// Vehicle drawing — uses platform emoji for realistic look
// 1.3× sizing per latest feedback. Direction-aware flipping so emojis
// (which face LEFT by default on Windows/Apple) appear to drive forward.
// ─────────────────────────────────────────────

import type { VehicleKey } from './types';

interface VehicleSpec {
  emoji: string;
  size: number;
  /** Direction the emoji's vehicle visually faces by default. */
  naturalFacing: 'left' | 'right' | 'symmetric';
}

// Sizes are 1.3× the previous values (~25-30% larger overall)
const VEHICLE_DATA: Record<VehicleKey, VehicleSpec> = {
  sedan:      { emoji: '🚗',  size: 125, naturalFacing: 'left' },
  motorcycle: { emoji: '🏍️', size: 114, naturalFacing: 'left' },
  cng:        { emoji: '🛺',  size: 120, naturalFacing: 'left' },
  bicycle:    { emoji: '🚲',  size: 109, naturalFacing: 'left' },
  rocket:     { emoji: '🚀',  size: 114, naturalFacing: 'right' },
  ball:       { emoji: '⚽',  size: 78,  naturalFacing: 'symmetric' },
};

/**
 * Draw a vehicle at the current Canvas origin (caller must `translate` first).
 *
 * @param vehicle      Which vehicle to draw
 * @param wheelRotation Used only for ball (rolls when in motion)
 * @param direction    +1 = moving forward (right), -1 = backward (left), 0 = stopped (defaults to +1)
 */
export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: VehicleKey,
  wheelRotation: number,
  direction: number = 1,
) {
  const spec = VEHICLE_DATA[vehicle];
  const dir = direction === 0 ? 1 : Math.sign(direction); // stopped → face forward
  const naturalSign = spec.naturalFacing === 'left' ? -1 :
                      spec.naturalFacing === 'right' ? 1 : 0;

  // Soft ground shadow under the emoji
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, spec.size * 0.40, spec.size * 0.38, spec.size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();

  // Flip horizontally if natural facing doesn't match direction of travel.
  // Symmetric (ball) never flips.
  if (spec.naturalFacing !== 'symmetric' && naturalSign !== dir) {
    ctx.scale(-1, 1);
  }

  ctx.font = `${spec.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (vehicle === 'ball') {
    ctx.rotate(wheelRotation);
  }

  ctx.fillText(spec.emoji, 0, 0);
  ctx.restore();
}

/** Approximate visual radius for wheel rotation (ball only) */
export const WHEEL_RADIUS: Record<VehicleKey, number> = {
  sedan: 62,
  motorcycle: 57,
  cng: 60,
  bicycle: 54,
  rocket: 57,
  ball: 39,
};

/** Vehicle width — for camera framing */
export const VEHICLE_WIDTH: Record<VehicleKey, number> = {
  sedan: 125,
  motorcycle: 114,
  cng: 120,
  bicycle: 109,
  rocket: 114,
  ball: 78,
};

/** Get the emoji char for VehiclePicker UI */
export function vehicleEmoji(vehicle: VehicleKey): string {
  return VEHICLE_DATA[vehicle].emoji;
}

/** Get the configured size (used by Scenes to compute Y offset for "on the line") */
export function vehicleSize(vehicle: VehicleKey): number {
  return VEHICLE_DATA[vehicle].size;
}
