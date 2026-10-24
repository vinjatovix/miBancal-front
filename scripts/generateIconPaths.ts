import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  extractSvgInner,
  TWEMOJI_ALIASES,
  TWEMOJI_PRIMARY_MAPPING,
  CUSTOM_GLYPHS
} from './iconPathExtraction.ts';

const ROOT = process.cwd();
const TWEMOJI_DIR = join(ROOT, 'node_modules/@twemoji/svg');
const OUTPUT_FILE = join(ROOT, 'src/shared/components/Icon/iconPaths.tsx');

export function generateIconGlyphsContent(): string {
  const sortedNames = Object.keys(TWEMOJI_PRIMARY_MAPPING).sort();
  const declarations = sortedNames.map((name) => {
    const hex = TWEMOJI_PRIMARY_MAPPING[name];
    const filePath = join(TWEMOJI_DIR, `${hex}.svg`);
    if (!existsSync(filePath)) {
      throw new Error(
        `SVG file for ${name} (${hex}.svg) not found in ${TWEMOJI_DIR}`
      );
    }
    const inner = extractSvgInner(readFileSync(filePath, 'utf8'));
    return `const ${name}Glyph = (\n  <>\n    ${inner}\n  </>\n);`;
  });

  const customDeclarations = Object.entries(CUSTOM_GLYPHS).map(
    ([name, inner]) => `const ${name}Glyph = (\n  <>\n    ${inner}\n  </>\n);`
  );

  const primaryEntries = sortedNames.map((name) => `  ${name}: ${name}Glyph`);
  const aliasEntries = Object.entries(TWEMOJI_ALIASES).map(
    ([alias, target]) => `  ${alias}: ${target}Glyph`
  );
  const customEntries = Object.keys(CUSTOM_GLYPHS).map(
    (name) => `  ${name}: ${name}Glyph`
  );
  const allEntries = [
    ...primaryEntries,
    ...aliasEntries,
    ...customEntries
  ].sort();

  return `${[...declarations, ...customDeclarations].join('\n\n')}\n\nexport const ICON_GLYPHS = {\n${allEntries.join(',\n')}\n} as const;\n\nexport type IconName = keyof typeof ICON_GLYPHS;\n`;
}

export function writeIconGlyphsFile(): void {
  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, generateIconGlyphsContent(), 'utf8');
}

if (process.argv[1]?.endsWith('generateIconPaths.ts')) {
  writeIconGlyphsFile();
}
