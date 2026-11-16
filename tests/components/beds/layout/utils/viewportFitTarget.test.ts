import { describe, expect, it } from 'vitest';

import { calculateFitBounds } from '../../../../../src/components/beds/layout/utils/layoutGeometry';
import type { RotatedRectInput } from '../../../../../src/components/beds/layout/utils/layoutGeometry';
import { resolveFitBounds } from '../../../../../src/components/beds/layout/utils/viewportFitTarget';

const VIEW_BOX = '0 0 1000 800';

function bed(overrides: Partial<RotatedRectInput> = {}): RotatedRectInput {
  return {
    position: { x: 0, y: 0 },
    width: 200,
    height: 150,
    rotation: 0,
    ...overrides
  };
}

describe('viewportFitTarget - resolveFitBounds', () => {
  it('fits the selected bed when a bed is selected', () => {
    const selected = bed({ position: { x: 100, y: 100 } });
    const bounds = resolveFitBounds(selected, [selected, bed()]);

    expect(bounds).toEqual({ minX: 100, minY: 100, maxX: 300, maxY: 250 });
  });

  it('fits the union of every placed bed when nothing is selected', () => {
    const bounds = resolveFitBounds(null, [
      bed({ position: { x: 0, y: 0 } }),
      bed({ position: { x: 400, y: 300 } })
    ]);

    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 600, maxY: 450 });
  });

  it('resets the viewport when the layout has no placed beds', () => {
    const bounds = resolveFitBounds(null, []);

    expect(bounds).toBeNull();
    expect(calculateFitBounds(bounds, VIEW_BOX, 0.85)).toEqual({
      zoom: 1,
      panX: 0,
      panY: 0
    });
  });
});
