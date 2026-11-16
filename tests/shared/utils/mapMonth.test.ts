import { describe, expect, it } from 'vitest';
import { mapMonth } from '../../../src/shared/utils/mapMonth';

describe('mapMonth', () => {
  it.each([
    [1, 1],
    [6, 6],
    [12, 12]
  ])('keeps month %i as %i in the north', (displayMonth, expected) => {
    expect(mapMonth(displayMonth, 'north')).toBe(expected);
  });

  it.each([
    [1, 7],
    [6, 12],
    [7, 1],
    [12, 6]
  ])('shifts month %i to %i in the south', (displayMonth, expected) => {
    expect(mapMonth(displayMonth, 'south')).toBe(expected);
  });
});
