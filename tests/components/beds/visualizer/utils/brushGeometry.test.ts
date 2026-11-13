import { describe, expect, it } from 'vitest';

import {
  calculateDirectrix,
  evaluatePermissiveBrushPlacement,
  generateDoubleRowPositions,
  generateSingleRowPositions,
  generateStaggeredTrianglePositions
} from '../../../../../src/components/beds/visualizer/utils/brushGeometry';
import type { SpatialCrop } from '../../../../../src/components/beds/visualizer/utils/spatialCollisions';

describe('brushGeometry', () => {
  describe('calculateDirectrix', () => {
    it('calculates length, unit vector and normal vector for standard segment', () => {
      const start = { x: 10, y: 20 };
      const end = { x: 70, y: 100 };

      const directrix = calculateDirectrix(start, end);

      expect(directrix.lengthCm).toBeCloseTo(100);
      expect(directrix.unitVector.x).toBeCloseTo(0.6);
      expect(directrix.unitVector.y).toBeCloseTo(0.8);
      expect(directrix.normalVector.x).toBeCloseTo(-0.8);
      expect(directrix.normalVector.y).toBeCloseTo(0.6);
    });

    it('handles zero-length directrix safely with fallback unit and normal vectors', () => {
      const point = { x: 50, y: 50 };

      const directrix = calculateDirectrix(point, point);

      expect(directrix.lengthCm).toBe(0);
      expect(directrix.unitVector).toEqual({ x: 1, y: 0 });
      expect(directrix.normalVector).toEqual({ x: 0, y: 1 });
    });
  });

  describe('generateSingleRowPositions', () => {
    it('generates a single position at start when segment length is less than spacing', () => {
      const directrix = calculateDirectrix({ x: 10, y: 10 }, { x: 25, y: 10 });

      const positions = generateSingleRowPositions(directrix, 30);

      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({ x: 10, y: 10 });
    });

    it('generates equidistant points separated by exact spacing along directrix', () => {
      const directrix = calculateDirectrix({ x: 0, y: 0 }, { x: 100, y: 0 });

      const positions = generateSingleRowPositions(directrix, 30);

      expect(positions).toHaveLength(4);
      expect(positions[0].x).toBeCloseTo(0);
      expect(positions[1].x).toBeCloseTo(30);
      expect(positions[2].x).toBeCloseTo(60);
      expect(positions[3].x).toBeCloseTo(90);
    });

    it('applies fallback spacing of 30 cm when provided spacing is zero or negative', () => {
      const directrix = calculateDirectrix({ x: 0, y: 0 }, { x: 65, y: 0 });

      const positions = generateSingleRowPositions(directrix, 0);

      expect(positions).toHaveLength(3);
      expect(positions[1].x).toBeCloseTo(30);
      expect(positions[2].x).toBeCloseTo(60);
    });
  });

  describe('generateDoubleRowPositions', () => {
    it('generates two parallel rows symmetrically offset by half spacing', () => {
      const directrix = calculateDirectrix({ x: 20, y: 50 }, { x: 140, y: 50 });

      const positions = generateDoubleRowPositions(directrix, 30);

      expect(positions).toHaveLength(10);

      const rowA = positions.slice(0, 5);
      const rowB = positions.slice(5, 10);

      for (const pos of rowA) {
        expect(pos.y).toBeCloseTo(65);
      }
      for (const pos of rowB) {
        expect(pos.y).toBeCloseTo(35);
      }

      expect(rowA[0].x).toBeCloseTo(20);
      expect(rowA[1].x).toBeCloseTo(50);
      expect(rowA[4].x).toBeCloseTo(140);
    });

    it('generates two side-by-side plants when stroke length is less than spacing', () => {
      const directrix = calculateDirectrix({ x: 40, y: 50 }, { x: 50, y: 50 });

      const positions = generateDoubleRowPositions(directrix, 30);

      expect(positions).toHaveLength(2);
      expect(positions[0]).toEqual({ x: 40, y: 65 });
      expect(positions[1]).toEqual({ x: 40, y: 35 });
    });
  });

  describe('generateStaggeredTrianglePositions', () => {
    it('produces equilateral triangular spacing where adjacent diagonal distance equals spacing', () => {
      const directrix = calculateDirectrix({ x: 0, y: 50 }, { x: 90, y: 50 });
      const spacing = 30;

      const positions = generateStaggeredTrianglePositions(directrix, spacing);

      expect(positions.length).toBeGreaterThan(1);

      const h = spacing * (Math.sqrt(3) / 2);
      const halfH = h / 2;

      const firstUpper = positions[0];
      expect(firstUpper.y).toBeCloseTo(50 + halfH);
      expect(firstUpper.x).toBeCloseTo(0);

      const firstLower = positions.find((p) => p.y < 50);
      expect(firstLower).toBeDefined();
      expect(firstLower!.y).toBeCloseTo(50 - halfH);
      expect(firstLower!.x).toBeCloseTo(15);

      const diagonalDistance = Math.hypot(
        firstUpper.x - firstLower!.x,
        firstUpper.y - firstLower!.y
      );
      expect(diagonalDistance).toBeCloseTo(spacing);
    });

    it('generates at least one initial triangle vertex when length is less than spacing', () => {
      const directrix = calculateDirectrix({ x: 10, y: 20 }, { x: 20, y: 20 });

      const positions = generateStaggeredTrianglePositions(directrix, 30);

      expect(positions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('evaluatePermissiveBrushPlacement', () => {
    const bedDimensions = { width: 200, height: 100 };
    const vitalRadius = 15;

    it('accepts valid in-bounds positions with no collisions', () => {
      const rawPositions = [
        { x: 30, y: 30 },
        { x: 70, y: 30 }
      ];

      const result = evaluatePermissiveBrushPlacement({
        rawPositions,
        vitalRadius,
        existingCrops: [],
        bedDimensions
      });

      expect(result.plantedCount).toBe(2);
      expect(result.omittedCount).toBe(0);
      expect(result.accepted).toHaveLength(2);
      expect(result.candidates.every((c) => c.isValid)).toBe(true);
    });

    it('omits candidate positions that fall outside bed boundaries', () => {
      const rawPositions = [
        { x: 50, y: 50 },
        { x: 210, y: 50 }
      ];

      const result = evaluatePermissiveBrushPlacement({
        rawPositions,
        vitalRadius,
        existingCrops: [],
        bedDimensions
      });

      expect(result.plantedCount).toBe(1);
      expect(result.omittedCount).toBe(1);
      expect(result.candidates[1].isValid).toBe(false);
      expect(result.candidates[1].omissionReason).toBe('out_of_bounds');
    });

    it('omits candidate positions that collide with existing fixed crops', () => {
      const existingCrops: readonly SpatialCrop[] = [
        { id: 'fixed-1', x: 50, y: 50, vitalRadius: 15 }
      ];
      const rawPositions = [
        { x: 55, y: 50 },
        { x: 120, y: 50 }
      ];

      const result = evaluatePermissiveBrushPlacement({
        rawPositions,
        vitalRadius,
        existingCrops,
        bedDimensions
      });

      expect(result.plantedCount).toBe(1);
      expect(result.omittedCount).toBe(1);
      expect(result.candidates[0].isValid).toBe(false);
      expect(result.candidates[0].omissionReason).toBe('collision');
      expect(result.candidates[1].isValid).toBe(true);
    });

    it('prevents intra-stroke collisions between overlapping candidate positions', () => {
      const rawPositions = [
        { x: 50, y: 50 },
        { x: 55, y: 50 }
      ];

      const result = evaluatePermissiveBrushPlacement({
        rawPositions,
        vitalRadius,
        existingCrops: [],
        bedDimensions
      });

      expect(result.plantedCount).toBe(1);
      expect(result.omittedCount).toBe(1);
      expect(result.candidates[0].isValid).toBe(true);
      expect(result.candidates[1].isValid).toBe(false);
      expect(result.candidates[1].omissionReason).toBe('collision');
    });
  });
});
