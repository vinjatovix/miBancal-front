import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  CUSTOM_GLYPHS,
  extractSvgInner,
  TWEMOJI_MAPPING
} from '../../scripts/iconPathExtraction';
import { ICON_GLYPHS } from '../../src/shared/components/Icon/iconPaths';

describe('extractSvgInner', () => {
  it('extracts inner tags from svg element string', () => {
    const sample =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path fill="#FF0000" d="M1 1"/></svg>';

    const inner = extractSvgInner(sample);

    expect(inner).toBe('<path fill="#FF0000" d="M1 1"/>');
  });

  it('throws when svg tags are not present', () => {
    const invalidSample = '<div>not an svg</div>';

    expect(() => extractSvgInner(invalidSample)).toThrow();
  });
});

describe('iconGlyphs catalog synchronisation', () => {
  it('contains all icon names declared in the twemoji mapping and custom glyphs', () => {
    const expectedNames = [
      ...Object.keys(TWEMOJI_MAPPING),
      ...Object.keys(CUSTOM_GLYPHS)
    ].sort();
    const glyphNames = Object.keys(ICON_GLYPHS).sort();

    expect(glyphNames).toEqual(expectedNames);
  });

  it.each(Object.keys(ICON_GLYPHS))(
    'provides a defined React element glyph for %s',
    (iconName) => {
      const glyph = ICON_GLYPHS[iconName as keyof typeof ICON_GLYPHS];

      expect(glyph).toBeDefined();
    }
  );

  it.each([
    ['dna', 'biotech'],
    ['skull', 'dangerous'],
    ['dining', 'restaurant'],
    ['tag', 'label'],
    ['cross_mark', 'close']
  ] as const)('provides alias %s equivalent to %s', (alias, base) => {
    const aliasGlyph = ICON_GLYPHS[alias];
    const baseGlyph = ICON_GLYPHS[base];

    expect(aliasGlyph).toEqual(baseGlyph);
  });

  it('provides the custom local_pharmacy glyph', () => {
    const customMarkup = CUSTOM_GLYPHS.local_pharmacy;
    const glyph = ICON_GLYPHS.local_pharmacy;

    expect(customMarkup).toBeDefined();
    expect(customMarkup).toContain('fill="#77B255"');
    expect(glyph).toBeDefined();
  });

  it('provides the custom info glyph with circular dot and centered stem', () => {
    const customMarkup = CUSTOM_GLYPHS.info;
    const glyph = ICON_GLYPHS.info;

    expect(customMarkup).toBeDefined();
    expect(customMarkup).toContain(
      'd="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2zm0 11a2 2 0 1 1 2-2 2 2 0 0 1-2 2zm1.5 14h-3v-11h3z"'
    );
    expect(isValidElement(glyph)).toBe(true);
    expect((glyph.props.children as ReactElement<{ d: string }>).props.d).toBe(
      'M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2zm0 11a2 2 0 1 1 2-2 2 2 0 0 1-2 2zm1.5 14h-3v-11h3z'
    );
  });
});
