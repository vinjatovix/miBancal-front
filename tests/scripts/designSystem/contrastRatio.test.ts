import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  relativeLuminance
} from '../../../scripts/designSystem/contrastRatio';

describe('contrastRatio', () => {
  it.each([
    ['#000', '#fff', 21],
    ['#000000', '#ffffff', 21],
    ['#777', '#fff', 4.48],
    ['rgba(0, 0, 0, 0.5)', '#ffffff', 3.98],
    ['#3a8657', '#ffffff', 4.44]
  ])('calculates %.2f ratio for %s and %s', (fg, bg, expected) => {
    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBe(expected);
  });

  it('is symmetric regardless of argument order', () => {
    const ratioOrderA = contrastRatio('#000', '#fff');
    const ratioOrderB = contrastRatio('#fff', '#000');

    expect(ratioOrderA).toBe(ratioOrderB);
  });

  it('composes semi-transparent background over an optional base background', () => {
    const fg = '#000000';
    const bg = 'rgba(255, 255, 255, 0.5)';
    const over = '#ffffff';

    const ratio = contrastRatio(fg, bg, over);

    expect(ratio).toBe(21);
  });
});

describe('relativeLuminance', () => {
  it('returns 0 for pure black', () => {
    const lum = relativeLuminance('#000000');

    expect(lum).toBe(0);
  });

  it('returns 1 for pure white', () => {
    const lum = relativeLuminance('#ffffff');

    expect(lum).toBe(1);
  });
});
