/**
 * generate-icons.js
 * Generates PNG app icons for the সূত্র (Suttro) education platform.
 *
 * Design: solid green circle (#1B6B4A) on a transparent background.
 * The Bengali text "সূ" cannot be rendered without a font-rasterising library
 * (canvas / sharp), so these PNGs contain the circle only. The full branded
 * design lives in public/icons/icon.svg which includes the text.
 *
 * Uses only Node.js built-ins (zlib, fs, path) — no npm packages needed.
 *
 * Usage:  node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');

// Brand colour  #1B6B4A  →  RGB(27, 107, 74)
const BG_R = 27, BG_G = 107, BG_B = 74;

// ── PNG helpers ──────────────────────────────────────────────────────────

function crc32(buf) {
  // Standard CRC-32 used by PNG
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function buildPNG(size) {
  // 8-byte PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit-depth 8, colour-type 6 (RGBA)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 6;   // colour type RGBA
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace
  const ihdr = pngChunk('IHDR', ihdrData);

  // Build raw image data (filter-byte + RGBA per pixel, per row)
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Pre-compute pixel rows
  const rowLen = 1 + size * 4; // filter byte + RGBA
  const raw = Buffer.alloc(rowLen * size);

  for (let y = 0; y < size; y++) {
    const offset = y * rowLen;
    raw[offset] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const px = offset + 1 + x * 4;
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= r - 0.5) {
        // Fully inside circle
        raw[px] = BG_R;
        raw[px + 1] = BG_G;
        raw[px + 2] = BG_B;
        raw[px + 3] = 255;
      } else if (dist <= r + 0.5) {
        // Anti-aliased edge
        const alpha = Math.max(0, Math.min(1, r + 0.5 - dist));
        raw[px] = BG_R;
        raw[px + 1] = BG_G;
        raw[px + 2] = BG_B;
        raw[px + 3] = Math.round(alpha * 255);
      } else {
        // Outside — transparent
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idat = pngChunk('IDAT', compressed);

  const iend = pngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// ── Generate ─────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const size of SIZES) {
  const png = buildPNG(size);
  const filePath = path.join(OUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`  ✓  ${filePath}  (${png.length} bytes)`);
}

console.log(`\nDone — ${SIZES.length} icons written to ${OUT_DIR}`);
console.log('Note: These icons show the green circle. The full design with');
console.log('Bengali "সূ" text is in icon.svg (used as the primary icon).');
