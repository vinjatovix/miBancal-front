import { describe, expect, it } from 'vitest';

import { calculateBedGeometry } from '../../../../../src/components/beds/visualizer/utils/bedGeometry';

describe('calculateBedGeometry', () => {
  it('calculates aspect ratio as width divided by height', () => {
    const geometry = calculateBedGeometry({ width: 120, height: 240 });

    expect(geometry.aspectRatio).toBe(0.5);
  });

  it('calculates 1:1 scale fitting container dimensions', () => {
    const geometry = calculateBedGeometry({
      width: 100,
      height: 200,
      containerWidth: 800,
      containerHeight: 600
    });

    expect(geometry.scale).toBeGreaterThan(0);
    expect(geometry.bedPixelWidth).toBe(100 * geometry.scale);
    expect(geometry.bedPixelHeight).toBe(200 * geometry.scale);
  });

  it('centers bed within available container area', () => {
    const geometry = calculateBedGeometry({
      width: 120,
      height: 240,
      containerWidth: 1000,
      containerHeight: 800
    });

    expect(geometry.originX).toBeGreaterThanOrEqual(60);
    expect(geometry.originY).toBeGreaterThanOrEqual(60);
  });

  it('computes top dimension line projecting full width in centimeters', () => {
    const geometry = calculateBedGeometry({
      width: 120,
      height: 240,
      containerWidth: 800,
      containerHeight: 800
    });

    expect(geometry.widthDimension.start.x).toBe(geometry.originX);
    expect(geometry.widthDimension.end.x).toBe(
      geometry.originX + geometry.bedPixelWidth
    );
    expect(geometry.widthDimension.start.y).toBeLessThan(geometry.originY);
  });

  it('computes left dimension line projecting full height in centimeters', () => {
    const geometry = calculateBedGeometry({
      width: 120,
      height: 240,
      containerWidth: 800,
      containerHeight: 800
    });

    expect(geometry.heightDimension.start.y).toBe(geometry.originY);
    expect(geometry.heightDimension.end.y).toBe(
      geometry.originY + geometry.bedPixelHeight
    );
    expect(geometry.heightDimension.start.x).toBeLessThan(geometry.originX);
  });
});
