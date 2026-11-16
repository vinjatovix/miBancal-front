import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

import { BACKGROUND_COLOR, createMaskableSvg } from './maskableSvg.ts';

const ROOT = process.cwd();
const FAVICON_PATH = join(ROOT, 'public/favicon.svg');
const ICONS_DIR = join(ROOT, 'public/icons');

export async function generatePwaIcons(): Promise<void> {
  mkdirSync(ICONS_DIR, { recursive: true });
  const svgBuffer = readFileSync(FAVICON_PATH);
  const sourceSvg = svgBuffer.toString('utf8');

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(ICONS_DIR, 'icon-192.png'));
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(ICONS_DIR, 'icon-512.png'));

  const maskableInner = await sharp(svgBuffer)
    .resize(358, 358)
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BACKGROUND_COLOR
    }
  })
    .composite([{ input: maskableInner, top: 77, left: 77 }])
    .png()
    .toFile(join(ICONS_DIR, 'icon-maskable-512.png'));

  const appleInner = await sharp(svgBuffer).resize(144, 144).png().toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: BACKGROUND_COLOR
    }
  })
    .composite([{ input: appleInner, top: 18, left: 18 }])
    .png()
    .toFile(join(ICONS_DIR, 'apple-touch-icon.png'));

  writeFileSync(
    join(ICONS_DIR, 'icon-maskable.svg'),
    createMaskableSvg(sourceSvg),
    'utf8'
  );
}

if (process.argv[1]?.endsWith('generatePwaIcons.ts')) {
  generatePwaIcons().catch((error: unknown) => {
    console.error('Failed to generate PWA icons:', error);
    process.exit(1);
  });
}
