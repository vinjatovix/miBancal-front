import { describe, expect, it } from 'vitest';

import {
  resolveCropAtPoint,
  resolveTouchSelection,
  type TouchSelectionCandidate
} from '../../../../../src/components/beds/layout/utils/touchSelection';
import { overlappingCrops } from '../../../../fixtures/layoutTouchFixtures';

const candidates: readonly TouchSelectionCandidate[] = [
  { id: 'a', centroid: { x: 100, y: 100 }, zOrder: 0 },
  { id: 'b', centroid: { x: 118, y: 108 }, zOrder: 1 },
  { id: 'c', centroid: { x: 92, y: 122 }, zOrder: 2 }
];

describe('resolveTouchSelection', () => {
  it.each([
    { point: { x: 101, y: 99 }, expected: 'a' },
    { point: { x: 120, y: 110 }, expected: 'b' },
    { point: { x: 90, y: 124 }, expected: 'c' }
  ])(
    'returns $expected as the candidate closest to the touch at $point',
    ({ point, expected }) => {
      expect(resolveTouchSelection(point, candidates)).toBe(expected);
    }
  );

  it('breaks an exact tie by selecting the higher z-order candidate', () => {
    const tied: readonly TouchSelectionCandidate[] = [
      { id: 'low', centroid: { x: 0, y: 0 }, zOrder: 1 },
      { id: 'high', centroid: { x: 0, y: 0 }, zOrder: 5 }
    ];
    expect(resolveTouchSelection({ x: 10, y: 0 }, tied)).toBe('high');
  });

  it('returns null when there are no candidates', () => {
    expect(resolveTouchSelection({ x: 0, y: 0 }, [])).toBeNull();
  });
});

describe('resolveCropAtPoint', () => {
  it('resolves the overlapping crop closest to the touch using crop centroids', () => {
    expect(resolveCropAtPoint({ x: 100, y: 100 }, overlappingCrops)).toBe(
      'crop-a'
    );
    expect(resolveCropAtPoint({ x: 118, y: 108 }, overlappingCrops)).toBe(
      'crop-b'
    );
    expect(resolveCropAtPoint({ x: 92, y: 122 }, overlappingCrops)).toBe(
      'crop-c'
    );
  });

  it('uses later render order as the higher z-order on an exact tie', () => {
    const stacked = [
      { id: 'under', position: { x: 50, y: 50 } },
      { id: 'over', position: { x: 50, y: 50 } }
    ];
    expect(resolveCropAtPoint({ x: 60, y: 50 }, stacked)).toBe('over');
  });

  it('returns null when the bed has no crops', () => {
    expect(resolveCropAtPoint({ x: 0, y: 0 }, [])).toBeNull();
  });
});
