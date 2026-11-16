import { describe, it, expect } from 'vitest';
import { orderSeasons } from '../../../src/shared/utils/orderSeasons';

describe('orderSeasons', () => {
  it.each([
    [
      ['summer', 'spring'],
      ['spring', 'summer']
    ],
    [
      ['spring', 'spring', 'autumn'],
      ['spring', 'autumn']
    ],
    [
      ['spring', 'monsoon'],
      ['spring', 'monsoon']
    ],
    [
      ['monsoon', 'winter', 'dry', 'spring'],
      ['spring', 'winter', 'monsoon', 'dry']
    ],
    [[], []],
    [undefined, []]
  ])('orders %j as %j', (seasons, expected) => {
    expect(orderSeasons(seasons)).toEqual(expected);
  });
});
