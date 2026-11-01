import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  relativeLuminance
} from '../../../scripts/designSystem/contrastRatio';

describe('contrastRatio', () => {
  it('calculates the maximum 21.00 ratio for black and white with 3-digit hex', () => {
    const fg = '#000';
    const bg = '#fff';

    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBe(21);
  });

  it('calculates the maximum 21.00 ratio for black and white with 6-digit hex', () => {
    const fg = '#000000';
    const bg = '#ffffff';

    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBe(21);
  });

  it('calculates 4.48 ratio for #777 and #fff', () => {
    const fg = '#777';
    const bg = '#fff';

    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBe(4.48);
  });

  it('is symmetric regardless of argument order', () => {
    const ratioOrderA = contrastRatio('#000', '#fff');
    const ratioOrderB = contrastRatio('#fff', '#000');

    expect(ratioOrderA).toBe(ratioOrderB);
  });

  it('composes rgba foreground over an opaque background before calculating contrast', () => {
    const fg = 'rgba(0, 0, 0, 0.5)';
    const bg = '#ffffff';

    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBe(3.98);
  });

  it('composes semi-transparent background over an optional base background', () => {
    const fg = '#000000';
    const bg = 'rgba(255, 255, 255, 0.5)';
    const over = '#ffffff';

    const ratio = contrastRatio(fg, bg, over);

    expect(ratio).toBe(21);
  });

  it('rounds the ratio to 2 decimal places', () => {
    const fg = '#3a8657';
    const bg = '#ffffff';

    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBe(4.44);
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
