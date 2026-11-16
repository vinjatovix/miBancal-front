import { describe, expect, it } from 'vitest';
import { formatLikesCount } from '../../../../../src/pages/plants/PlantCard/utils/formatLikesCount';

describe('formatLikesCount', () => {
  it.each([
    [0, '0'],
    [1, '1'],
    [42, '42'],
    [1000, '1.000'],
    [15420, '15.420'],
    [1000000, '1.000.000']
  ])('formats %i as %s using es-ES grouping', (count, expected) => {
    const input = count;

    const formatted = formatLikesCount(input);

    expect(formatted).toBe(expected);
  });
});
