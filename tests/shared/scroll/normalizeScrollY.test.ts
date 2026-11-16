import { describe, expect, it } from 'vitest';

import { normalizeScrollY } from '../../../src/shared/scroll/normalizeScrollY';

describe('normalizeScrollY', () => {
  it.each([
    ['zero', 0, 0],
    ['positive integer', 450, 450],
    ['positive float', 12.5, 12.5]
  ])('returns the value for a valid scrollY (%s)', (_, input, expected) => {
    const result = normalizeScrollY(input);

    expect(result).toBe(expected);
  });

  it.each([
    ['negative number', -1],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['string', '450'],
    ['null', null],
    ['undefined', undefined],
    ['object', { scrollY: 10 }]
  ])('returns undefined for an invalid scrollY (%s)', (_, input) => {
    const result = normalizeScrollY(input);

    expect(result).toBeUndefined();
  });
});
