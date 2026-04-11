import sharp from 'sharp';
import { mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const SRC = './suttro_logo_png.png';
const PUBLIC = './public';
const ICONS_DIR = join(PUBLIC, 'icons');

// Ensure directories
mkdirSync(ICONS_DIR, { recursive: true });

// ═══════════════════════════════════════════
// All icon sizes needed
// ═══════════════════════════════════════════

const tasks = [
  // ── Website Favicons ──
  { out: join(PUBLIC, 'favicon-16x16.png'), size: 16 },
  { out: join(PUBLIC, 'favicon-32x32.png'), size: 32 },
  { out: join(PUBLIC, 'apple-touch-icon.png'), size: 180 },

  // ── PWA Icons (manifest.json) ──
  { out: join(ICONS_DIR, 'icon-72.png'), size: 72 },
  { out: join(ICONS_DIR, 'icon-96.png'), size: 96 },
  { out: join(ICONS_DIR, 'icon-128.png'), size: 128 },
  { out: join(ICONS_DIR, 'icon-144.png'), size: 144 },
  { out: join(ICONS_DIR, 'icon-152.png'), size: 152 },
  { out: join(ICONS_DIR, 'icon-192.png'), size: 192 },
  { out: join(ICONS_DIR, 'icon-384.png'), size: 384 },
  { out: join(ICONS_DIR, 'icon-512.png'), size: 512 },

  // ── PWA Maskable Icons (with padding for safe zone) ──
  { out: join(ICONS_DIR, 'icon-maskable-192.png'), size: 192, maskable: true },
  { out: join(ICONS_DIR, 'icon-maskable-512.png'), size: 512, maskable: true },

  // ── Android Icons ──
  { out: join(ICONS_DIR, 'android-48.png'), size: 48 },
  { out: join(ICONS_DIR, 'android-72.png'), size: 72 },
  { out: join(ICONS_DIR, 'android-96.png'), size: 96 },
  { out: join(ICONS_DIR, 'android-144.png'), size: 144 },
  { out: join(ICONS_DIR, 'android-192.png'), size: 192 },
  { out: join(ICONS_DIR, 'android-512.png'), size: 512 },

  // ── iOS Icons ──
  { out: join(ICONS_DIR, 'ios-40.png'), size: 40 },
  { out: join(ICONS_DIR, 'ios-58.png'), size: 58 },
  { out: join(ICONS_DIR, 'ios-60.png'), size: 60 },
  { out: join(ICONS_DIR, 'ios-80.png'), size: 80 },
  { out: join(ICONS_DIR, 'ios-87.png'), size: 87 },
  { out: join(ICONS_DIR, 'ios-120.png'), size: 120 },
  { out: join(ICONS_DIR, 'ios-152.png'), size: 152 },
  { out: join(ICONS_DIR, 'ios-167.png'), size: 167 },
  { out: join(ICONS_DIR, 'ios-180.png'), size: 180 },
  { out: join(ICONS_DIR, 'ios-1024.png'), size: 1024 },
];

// ── OG / Social Media Images ──
const socialTasks = [
  { out: join(PUBLIC, 'og-image.png'), width: 1200, height: 630 },
  { out: join(PUBLIC, 'twitter-image.png'), width: 1200, height: 600 },
];

async function generateIcon({ out, size, maskable }) {
  if (maskable) {
    // Maskable: logo at 80% with padding (safe zone = inner 80%)
    const logoSize = Math.round(size * 0.6);
    const logo = await sharp(SRC).resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 255 } },
    })
      .composite([{ input: logo, gravity: 'centre' }])
      .png()
      .toFile(out);
  } else {
    await sharp(SRC)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
  }
  console.log(`  ✅ ${out} (${size}×${size}${maskable ? ' maskable' : ''})`);
}

async function generateSocialImage({ out, width, height }) {
  // Dark background with centered logo
  const logoSize = Math.round(Math.min(width, height) * 0.45);
  const logo = await sharp(SRC).resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

  // Create background with brand color (#0B1D3A)
  await sharp({
    create: { width, height, channels: 4, background: { r: 11, g: 29, b: 58, alpha: 255 } },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(out);

  console.log(`  ✅ ${out} (${width}×${height})`);
}

async function generateFavicon() {
  // Generate ICO-compatible 32x32 PNG, then copy as favicon.ico
  // (Modern browsers accept PNG inside .ico)
  await sharp(SRC)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(PUBLIC, 'favicon.png'));

  // For the actual .ico in src/app (Next.js uses this)
  await sharp(SRC)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('./src/app/favicon.png');

  console.log('  ✅ favicon.png (32×32)');
}

async function main() {
  console.log('🎨 Generating icons from suttro_logo_png.png (1024×1024)...\n');

  console.log('📌 Favicons:');
  await generateFavicon();

  console.log('\n📌 PWA & Standard Icons:');
  for (const task of tasks) {
    await generateIcon(task);
  }

  console.log('\n📌 Social Media Images:');
  for (const task of socialTasks) {
    await generateSocialImage(task);
  }

  // Copy 1024 as source
  copyFileSync(SRC, join(ICONS_DIR, 'icon-1024.png'));
  console.log('  ✅ icons/icon-1024.png (original copy)');

  console.log(`\n✅ Done! ${tasks.length + socialTasks.length + 2} files generated.`);
}

main().catch(console.error);
