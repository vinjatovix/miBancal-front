import { describe, expect, it } from 'vitest';

import { rotatedRectVertices } from '../../../../../src/components/beds/layout/utils/layoutGeometry';
import {
  findBedAtPoint,
  globalToBedLocal,
  isLocalPointInsideBed
} from '../../../../../src/components/beds/layout/utils/plantPlacementGeometry';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';

function buildBed(overrides: Partial<ResolvedBed> = {}): ResolvedBed {
  return {
    id: 'bed-1',
    name: 'B1',
    width: 90,
    height: 600,
    position: { x: 100, y: 50 },
    rotation: 0,
    ...overrides
  };
}

describe('globalToBedLocal', () => {
  it.each([0, 30, 90, 180, 270])(
    'maps each rotated rect vertex back to its local corner (rotation %i)',
    (rotation) => {
      const bed = buildBed({ rotation });
      const vertices = rotatedRectVertices(bed);
      const corners = [
        { x: 0, y: 0 },
        { x: bed.width, y: 0 },
        { x: bed.width, y: bed.height },
        { x: 0, y: bed.height }
      ];
      vertices.forEach((vertex, index) => {
        const local = globalToBedLocal(bed, vertex);
        expect(local.x).toBeCloseTo(corners[index].x, 6);
        expect(local.y).toBeCloseTo(corners[index].y, 6);
      });
    }
  );
});

describe('isLocalPointInsideBed', () => {
  it('accepts points within the bed and rejects points outside', () => {
    const bed = buildBed();
    expect(isLocalPointInsideBed(bed, { x: 45, y: 300 })).toBe(true);
    expect(isLocalPointInsideBed(bed, { x: 0, y: 0 })).toBe(true);
    expect(isLocalPointInsideBed(bed, { x: 91, y: 300 })).toBe(false);
    expect(isLocalPointInsideBed(bed, { x: 45, y: 601 })).toBe(false);
    expect(isLocalPointInsideBed(bed, { x: -1, y: 10 })).toBe(false);
  });
});

describe('findBedAtPoint', () => {
  it('returns the bed whose rotated footprint contains the point', () => {
    const horizontal = buildBed({
      id: 'horizontal',
      rotation: 90,
      position: { x: 0, y: 0 }
    });
    const center = globalToBedLocalCenter(horizontal);
    expect(findBedAtPoint([horizontal], center)?.id).toBe('horizontal');
  });

  it('returns null when the point is on no bed', () => {
    const bed = buildBed({ position: { x: 0, y: 0 }, rotation: 0 });
    expect(findBedAtPoint([bed], { x: -500, y: -500 })).toBeNull();
  });
});

function globalToBedLocalCenter(bed: ResolvedBed): { x: number; y: number } {
  const vertices = rotatedRectVertices(bed);
  const sum = vertices.reduce(
    (acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / vertices.length, y: sum.y / vertices.length };
}
