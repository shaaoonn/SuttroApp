import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SRC = './suttro_logo_png.png';
const RES = './android/app/src/main/res';

// Splash screen sizes for different densities
// The splash drawable is the background of the launch activity
const splashConfigs = [
  // drawable - default splash (used for the splash drawable)
  { dir: 'drawable', width: 480, height: 800, logoSize: 200 },
  // Port variants for portrait splash
  { dir: 'drawable-port-hdpi', width: 480, height: 800, logoSize: 200 },
  { dir: 'drawable-port-mdpi', width: 320, height: 480, logoSize: 140 },
  { dir: 'drawable-port-xhdpi', width: 720, height: 1280, logoSize: 300 },
  { dir: 'drawable-port-xxhdpi', width: 960, height: 1600, logoSize: 400 },
  { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920, logoSize: 500 },
  // Land variants for landscape splash
  { dir: 'drawable-land-hdpi', width: 800, height: 480, logoSize: 200 },
  { dir: 'drawable-land-mdpi', width: 480, height: 320, logoSize: 140 },
  { dir: 'drawable-land-xhdpi', width: 1280, height: 720, logoSize: 300 },
  { dir: 'drawable-land-xxhdpi', width: 1600, height: 960, logoSize: 400 },
  { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280, logoSize: 500 },
];

async function generateSplash({ dir, width, height, logoSize }) {
  const outDir = join(RES, dir);
  mkdirSync(outDir, { recursive: true });

  const logo = await sharp(SRC)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Background color #FFFFFF (white)
  await sharp({
    create: {
      width, height, channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 }
    }
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(join(outDir, 'splash.png'));

  console.log(`  done ${dir}/splash.png (${width}x${height})`);
}

async function main() {
  console.log('Generating splash screens...\n');
  for (const config of splashConfigs) {
    await generateSplash(config);
  }
  console.log(`\nDone! ${splashConfigs.length} splash screens generated.`);
}

main().catch(console.error);
