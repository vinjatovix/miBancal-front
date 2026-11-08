import { describe, expect, it } from 'vitest';

import {
  DEFAULT_VITAL_RADIUS_CM,
  calculateDistance,
  calculateVitalRadius,
  evaluateCollision,
  evaluatePerimeter,
  evaluatePlacementCollision,
  findCollisions,
  type SpatialCrop
} from '../../../../../src/components/beds/visualizer/utils/spatialCollisions';

describe('calculateVitalRadius', () => {
  it.each<{
    readonly spacing: number | null | undefined;
    readonly radius: number;
  }>([
    { spacing: 50, radius: 25 },
    { spacing: 30, radius: 15 },
    { spacing: undefined, radius: DEFAULT_VITAL_RADIUS_CM },
    { spacing: null, radius: DEFAULT_VITAL_RADIUS_CM },
    { spacing: 0, radius: DEFAULT_VITAL_RADIUS_CM },
    { spacing: -10, radius: DEFAULT_VITAL_RADIUS_CM }
  ])('maps spacing $spacing to radius $radius', ({ spacing, radius }) => {
    const result = calculateVitalRadius(spacing);

    expect(result).toBe(radius);
  });
});

describe('calculateDistance', () => {
  it.each<{
    readonly p1: { x: number; y: number };
    readonly p2: { x: number; y: number };
    readonly distance: number;
  }>([
    { p1: { x: 0, y: 0 }, p2: { x: 3, y: 4 }, distance: 5 },
    { p1: { x: 60, y: 40 }, p2: { x: 75, y: 40 }, distance: 15 },
    { p1: { x: 10, y: 10 }, p2: { x: 10, y: 10 }, distance: 0 }
  ])('computes euclidean distance as $distance', ({ p1, p2, distance }) => {
    const result = calculateDistance(p1, p2);

    expect(result).toBeCloseTo(distance, 5);
  });
});

describe('evaluateCollision', () => {
  it('reports a collision when the distance is below the sum of radii', () => {
    const result = evaluateCollision(
      { x: 60, y: 40, vitalRadius: 25 },
      { x: 75, y: 40, vitalRadius: 15 }
    );

    expect(result).toBe(true);
  });

  it('reports no collision when the distance equals the sum of radii', () => {
    const result = evaluateCollision(
      { x: 0, y: 0, vitalRadius: 20 },
      { x: 40, y: 0, vitalRadius: 20 }
    );

    expect(result).toBe(false);
  });
});

describe('evaluatePlacementCollision', () => {
  const crops: readonly SpatialCrop[] = [
    { id: 'a', x: 50, y: 50, vitalRadius: 15 },
    { id: 'b', x: 100, y: 100, vitalRadius: 20 }
  ];

  it('reports collision when point overlaps a crop', () => {
    const result = evaluatePlacementCollision({ x: 55, y: 55 }, 15, crops);
    expect(result).toBe(true);
  });

  it('reports no collision when point is far from crops', () => {
    const result = evaluatePlacementCollision({ x: 200, y: 200 }, 15, crops);
    expect(result).toBe(false);
  });

  it('ignores collision with the specified ignoreCropId', () => {
    const result = evaluatePlacementCollision({ x: 55, y: 55 }, 15, crops, 'a');
    expect(result).toBe(false);
  });
});

describe('findCollisions', () => {
  it('returns every conflicting pair with distance metadata', () => {
    const crops: readonly SpatialCrop[] = [
      { id: 'a', x: 60, y: 40, vitalRadius: 25 },
      { id: 'b', x: 75, y: 40, vitalRadius: 15 },
      { id: 'c', x: 200, y: 200, vitalRadius: 10 }
    ];

    const result = findCollisions(crops);

    expect(result).toEqual([
      { cropIdA: 'a', cropIdB: 'b', distance: 15, requiredDistance: 40 }
    ]);
  });

  it('returns an empty list when no crops collide', () => {
    const crops: readonly SpatialCrop[] = [
      { id: 'a', x: 0, y: 0, vitalRadius: 10 },
      { id: 'b', x: 100, y: 100, vitalRadius: 10 }
    ];

    const result = findCollisions(crops);

    expect(result).toEqual([]);
  });
});

describe('evaluatePerimeter', () => {
  const bed = { width: 200, height: 100 };

  it('flags a center outside the bed boundary', () => {
    const result = evaluatePerimeter(
      { id: 'a', x: -5, y: 50, vitalRadius: 10 },
      bed
    );

    expect(result.isCenterInside).toBe(false);
  });

  it('flags an overflow when the radius exceeds a border but the center stays inside', () => {
    const result = evaluatePerimeter(
      { id: 'a', x: 10, y: 50, vitalRadius: 20 },
      bed
    );

    expect(result.isCenterInside).toBe(true);
    expect(result.isOverflowing).toBe(true);
    expect(result.overflowEdges.left).toBe(true);
    expect(result.overflowEdges.right).toBe(false);
  });

  it('reports a fully contained crop as inside and not overflowing', () => {
    const result = evaluatePerimeter(
      { id: 'a', x: 100, y: 50, vitalRadius: 20 },
      bed
    );

    expect(result.isCenterInside).toBe(true);
    expect(result.isOverflowing).toBe(false);
  });
});
