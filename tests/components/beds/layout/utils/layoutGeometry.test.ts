import { describe, expect, it } from 'vitest';

import {
  calculateFitBounds,
  computeViewBox,
  diffAdjustedBedIds,
  pixelToCm,
  rectAabb,
  rotatedRectVertices,
  unionAabb
} from '../../../../../src/components/beds/layout/utils/layoutGeometry';

describe('rotatedRectVertices', () => {
  it('returns the four corners from the origin when rotation is zero', () => {
    const vertices = rotatedRectVertices({
      position: { x: 10, y: 20 },
      width: 100,
      height: 50,
      rotation: 0
    });

    expect(vertices).toEqual([
      { x: 10, y: 20 },
      { x: 110, y: 20 },
      { x: 110, y: 70 },
      { x: 10, y: 70 }
    ]);
  });

  it('rotates clockwise around the bed origin', () => {
    const [origin, topRight, bottomRight, bottomLeft] = rotatedRectVertices({
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
      rotation: 90
    });

    expect(origin.x).toBeCloseTo(0);
    expect(origin.y).toBeCloseTo(0);
    expect(topRight.x).toBeCloseTo(0);
    expect(topRight.y).toBeCloseTo(100);
    expect(bottomRight.x).toBeCloseTo(-50);
    expect(bottomRight.y).toBeCloseTo(100);
    expect(bottomLeft.x).toBeCloseTo(-50);
    expect(bottomLeft.y).toBeCloseTo(0);
  });
});

describe('pixelToCm', () => {
  it('converts a pointer delta to centimeters using the viewport scale', () => {
    expect(pixelToCm(50, 2)).toBeCloseTo(25);
  });

  it('returns the delta unchanged at scale one', () => {
    expect(pixelToCm(42, 1)).toBeCloseTo(42);
  });

  it('is safe when the scale is zero', () => {
    expect(pixelToCm(42, 0)).toBe(0);
  });
});

describe('computeViewBox', () => {
  it('uses the location canvas with a margin when dimensions exist', () => {
    const viewBox = computeViewBox({
      location: { width: 1000, height: 600 },
      placedBeds: [],
      margin: 50
    });

    expect(viewBox).toBe('-50 -50 1100 700');
  });

  it('derives the bounding box of placed beds plus margin without dimensions', () => {
    const viewBox = computeViewBox({
      location: { width: null, height: null },
      placedBeds: [
        { position: { x: 100, y: 100 }, width: 100, height: 100, rotation: 0 }
      ],
      margin: 20
    });

    expect(viewBox).toBe('80 80 140 140');
  });
});

describe('rectAabb', () => {
  it('returns the axis-aligned bounds of an unrotated rectangle', () => {
    expect(
      rectAabb({
        position: { x: 10, y: 20 },
        width: 100,
        height: 50,
        rotation: 0
      })
    ).toEqual({ minX: 10, minY: 20, maxX: 110, maxY: 70 });
  });

  it('grows the bounds for a rotated rectangle', () => {
    const box = rectAabb({
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
      rotation: 90
    });

    expect(box.minX).toBeCloseTo(-50);
    expect(box.maxX).toBeCloseTo(0);
    expect(box.minY).toBeCloseTo(0);
    expect(box.maxY).toBeCloseTo(100);
  });
});

describe('diffAdjustedBedIds', () => {
  it('flags beds whose saved position differs beyond the tolerance', () => {
    const sent = [
      { id: 'a', position: { x: 10, y: 10 }, rotation: 0 },
      { id: 'b', position: { x: 50, y: 50 }, rotation: 90 }
    ];
    const server = [
      { id: 'a', position: { x: 10.2, y: 10 }, rotation: 0 },
      { id: 'b', position: { x: 40, y: 50 }, rotation: 90 }
    ];

    expect(diffAdjustedBedIds(sent, server, 0.5)).toEqual(['b']);
  });

  it('flags beds whose rotation was adjusted', () => {
    const sent = [{ id: 'a', position: { x: 10, y: 10 }, rotation: 10 }];
    const server = [{ id: 'a', position: { x: 10, y: 10 }, rotation: 15 }];

    expect(diffAdjustedBedIds(sent, server)).toEqual(['a']);
  });

  it('flags a bed that could not be placed as requested', () => {
    const sent = [{ id: 'a', position: { x: 10, y: 10 }, rotation: 0 }];
    const server = [{ id: 'a', position: null, rotation: 0 }];

    expect(diffAdjustedBedIds(sent, server)).toEqual(['a']);
  });

  it('returns nothing when everything matches within tolerance', () => {
    const sent = [{ id: 'a', position: { x: 10, y: 10 }, rotation: 0 }];
    const server = [{ id: 'a', position: { x: 10.1, y: 9.9 }, rotation: 0 }];

    expect(diffAdjustedBedIds(sent, server, 0.5)).toEqual([]);
  });
});

describe('unionAabb', () => {
  it('returns null for an empty list', () => {
    expect(unionAabb([])).toBeNull();
  });

  it('merges several boxes into their enclosing bounds', () => {
    expect(
      unionAabb([
        { minX: 0, minY: 0, maxX: 100, maxY: 100 },
        { minX: 200, minY: 50, maxX: 400, maxY: 300 }
      ])
    ).toEqual({ minX: 0, minY: 0, maxX: 400, maxY: 300 });
  });
});

describe('calculateFitBounds', () => {
  it('centers and zooms onto a single bed target with a 15% margin', () => {
    const target = calculateFitBounds(
      { minX: 0, minY: 0, maxX: 400, maxY: 300 },
      '0 0 1000 800',
      0.85
    );

    expect(target).toEqual({ zoom: 2.125, panX: 637.5, panY: 531.25 });
  });

  it('fits the union of all placed beds', () => {
    const bounds = unionAabb([
      { minX: 0, minY: 0, maxX: 200, maxY: 150 },
      { minX: 200, minY: 150, maxX: 400, maxY: 300 }
    ]);

    const target = calculateFitBounds(bounds, '0 0 1000 800', 0.85);

    expect(target).toEqual({ zoom: 2.125, panX: 637.5, panY: 531.25 });
  });

  it('resets the viewport when the layout is empty', () => {
    expect(calculateFitBounds(null, '0 0 1000 800', 0.85)).toEqual({
      zoom: 1,
      panX: 0,
      panY: 0
    });
  });

  it('returns null for an invalid view box', () => {
    expect(
      calculateFitBounds({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, 'nope')
    ).toBeNull();
  });

  it('returns null for degenerate bounds', () => {
    expect(
      calculateFitBounds(
        { minX: 10, minY: 10, maxX: 10, maxY: 20 },
        '0 0 100 100'
      )
    ).toBeNull();
  });
});
