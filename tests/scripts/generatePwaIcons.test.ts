import { describe, expect, it } from 'vitest';

import { createMaskableSvg } from '../../scripts/maskableSvg';

describe('createMaskableSvg', () => {
  it('wraps inner SVG content in a 512x512 maskable viewBox with background and scaled group', () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path fill="#FF0000" d="M1 1"/></svg>';

    const result = createMaskableSvg(source);

    expect(result).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n  <rect width="512" height="512" fill="#f3fbf6"/>\n  <g transform="translate(77, 77) scale(9.9444)">\n    <path fill="#FF0000" d="M1 1"/>\n  </g>\n</svg>\n`
    );
  });

  it('handles multiline inner SVG tags with attributes', () => {
    const source = `<svg viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="green" />
</svg>`;

    const result = createMaskableSvg(source);

    expect(result).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n  <rect width="512" height="512" fill="#f3fbf6"/>\n  <g transform="translate(77, 77) scale(9.9444)">\n    <circle cx="50" cy="50" r="40" fill="green" />\n  </g>\n</svg>\n`
    );
  });
});
