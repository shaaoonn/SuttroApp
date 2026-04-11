import sharp from 'sharp';
import { mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const WHITE_BG = join(ROOT, 'suttro_logo_white_bg.png');
const TRANSPARENT = join(ROOT, 'suttro_logo_without_bg.png');

const PUBLIC = join(ROOT, 'public');
const ICONS_DIR = join(PUBLIC, 'icons');

// ── Ensure dirs exist
mkdirSync(ICONS_DIR, { recursive: true });

// ── Helper: resize with padding to make square
async function resizeSquare(src, dest, size, bg = { r: 255, g: 255, b: 255, alpha: 1 }) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: bg })
    .png()
    .toFile(dest);
  console.log(`  ✓ ${dest.split(/[\\/]/).pop()} (${size}x${size})`);
}

// ── Helper: resize to exact dimensions (non-square, e.g., OG image)
async function resizeRect(src, dest, w, h, bg = { r: 255, g: 255, b: 255, alpha: 1 }) {
  await sharp(src)
    .resize(w, h, { fit: 'contain', background: bg })
    .png()
    .toFile(dest);
  console.log(`  ✓ ${dest.split(/[\\/]/).pop()} (${w}x${h})`);
}

async function main() {
  console.log('🎨 Generating all icons from new logo...\n');

  // ── 1. Favicons (white background)
  console.log('── Favicons:');
  await resizeSquare(WHITE_BG, join(PUBLIC, 'favicon.png'), 32);
  await resizeSquare(WHITE_BG, join(PUBLIC, 'favicon-16x16.png'), 16);
  await resizeSquare(WHITE_BG, join(PUBLIC, 'favicon-32x32.png'), 32);
  await resizeSquare(WHITE_BG, join(PUBLIC, 'apple-touch-icon.png'), 180);

  // ── 2. PWA Icons (white background for app icon)
  console.log('\n── PWA Icons:');
  const pwaSizes = [72, 96, 128, 144, 152, 192, 384, 512, 1024];
  for (const s of pwaSizes) {
    await resizeSquare(WHITE_BG, join(ICONS_DIR, `icon-${s}.png`), s);
  }

  // ── 3. Maskable Icons (with extra padding, white bg)
  console.log('\n── Maskable Icons:');
  for (const s of [192, 512]) {
    // Maskable needs ~10% safe area padding
    const innerSize = Math.round(s * 0.8);
    const img = await sharp(WHITE_BG)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({
        top: Math.round((s - innerSize) / 2),
        bottom: Math.round((s - innerSize) / 2),
        left: Math.round((s - innerSize) / 2),
        right: Math.round((s - innerSize) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .resize(s, s) // ensure exact size
      .png()
      .toFile(join(ICONS_DIR, `icon-maskable-${s}.png`));
    console.log(`  ✓ icon-maskable-${s}.png (${s}x${s})`);
  }

  // ── 4. Standard icon.png
  console.log('\n── Standard Icon:');
  await resizeSquare(WHITE_BG, join(ICONS_DIR, 'icon.png'), 512);

  // ── 5. Android icons
  console.log('\n── Android Icons:');
  const androidSizes = [48, 72, 96, 144, 192, 512];
  for (const s of androidSizes) {
    await resizeSquare(WHITE_BG, join(ICONS_DIR, `android-${s}.png`), s);
  }

  // ── 6. iOS icons
  console.log('\n── iOS Icons:');
  const iosSizes = [40, 58, 60, 80, 87, 120, 152, 167, 180, 1024];
  for (const s of iosSizes) {
    await resizeSquare(WHITE_BG, join(ICONS_DIR, `ios-${s}.png`), s);
  }

  // ── 7. OG Image (1200x630, white bg with logo centered)
  console.log('\n── Social Images:');
  await resizeRect(WHITE_BG, join(PUBLIC, 'og-image.png'), 1200, 630);
  await resizeRect(WHITE_BG, join(PUBLIC, 'twitter-image.png'), 1200, 600);

  // ── 8. Navbar logo (transparent, for use in components)
  console.log('\n── Navbar Logo (transparent):');
  await resizeSquare(TRANSPARENT, join(PUBLIC, 'logo.png'), 512, { r: 0, g: 0, b: 0, alpha: 0 });
  await resizeSquare(TRANSPARENT, join(PUBLIC, 'logo-small.png'), 128, { r: 0, g: 0, b: 0, alpha: 0 });

  // ── 9. Admin panel logo
  console.log('\n── Admin Logo:');
  const adminPublic = join(ROOT, 'admin', 'public');
  mkdirSync(adminPublic, { recursive: true });
  await resizeSquare(WHITE_BG, join(adminPublic, 'favicon.png'), 32);
  await resizeSquare(WHITE_BG, join(adminPublic, 'favicon-32x32.png'), 32);
  await resizeSquare(WHITE_BG, join(adminPublic, 'apple-touch-icon.png'), 180);
  await resizeSquare(TRANSPARENT, join(adminPublic, 'logo.png'), 256, { r: 0, g: 0, b: 0, alpha: 0 });

  // ── 10. Android native app icons
  console.log('\n── Android Native Icons:');
  const androidDir = join(ROOT, 'android', 'app', 'src', 'main', 'res');
  const densities = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const { dir, size } of densities) {
    const d = join(androidDir, dir);
    mkdirSync(d, { recursive: true });
    await resizeSquare(WHITE_BG, join(d, 'ic_launcher.png'), size);
    await resizeSquare(WHITE_BG, join(d, 'ic_launcher_round.png'), size);
    await resizeSquare(TRANSPARENT, join(d, 'ic_launcher_foreground.png'), size, { r: 0, g: 0, b: 0, alpha: 0 });
  }

  // ── 11. Android splash screens
  console.log('\n── Android Splash Screens:');
  const splashVariants = [
    { dir: 'drawable', w: 480, h: 800 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  ];

  for (const { dir, w, h } of splashVariants) {
    const d = join(androidDir, dir);
    mkdirSync(d, { recursive: true });
    await resizeRect(WHITE_BG, join(d, 'splash.png'), w, h);
  }

  console.log('\n✅ All icons generated successfully!');
}

main().catch(console.error);
