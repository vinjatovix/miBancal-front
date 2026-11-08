import { describe, expect, it } from 'vitest';

import {
  computeGroupBoundingBox,
  computeMarqueeBox,
  evaluateGroupMovement,
  findCropsInMarquee,
  isPointInMarquee
} from '../../../../../src/components/beds/visualizer/utils/selectionGeometry';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

describe('selectionGeometry', () => {
  describe('computeMarqueeBox', () => {
    it.each([
      {
        start: { x: 10, y: 10 },
        current: { x: 50, y: 40 },
        expected: {
          minX: 10,
          minY: 10,
          maxX: 50,
          maxY: 40,
          width: 40,
          height: 30
        }
      },
      {
        start: { x: 60, y: 80 },
        current: { x: 20, y: 30 },
        expected: {
          minX: 20,
          minY: 30,
          maxX: 60,
          maxY: 80,
          width: 40,
          height: 50
        }
      }
    ])(
      'computes normalized coordinates and dimensions: $start -> $current',
      ({ start, current, expected }) => {
        const box = computeMarqueeBox(start, current);

        expect(box.minX).toBe(expected.minX);
        expect(box.minY).toBe(expected.minY);
        expect(box.maxX).toBe(expected.maxX);
        expect(box.maxY).toBe(expected.maxY);
        expect(box.width).toBe(expected.width);
        expect(box.height).toBe(expected.height);
      }
    );
  });

  describe('isPointInMarquee & findCropsInMarquee', () => {
    const box = computeMarqueeBox({ x: 20, y: 20 }, { x: 80, y: 80 });

    it('returns true when point center is strictly inside marquee bounds', () => {
      const inside = isPointInMarquee({ x: 50, y: 50 }, box);
      expect(inside).toBe(true);
    });

    it('returns false when point center is outside marquee bounds', () => {
      const outside = isPointInMarquee({ x: 10, y: 50 }, box);
      expect(outside).toBe(false);
    });

    it('finds ids of all crops whose centers fall inside marquee rectangle', () => {
      const crops = [
        buildCropPlacementItem({ id: 'c1', position: { x: 30, y: 30 } }),
        buildCropPlacementItem({ id: 'c2', position: { x: 70, y: 50 } }),
        buildCropPlacementItem({ id: 'c3', position: { x: 95, y: 50 } })
      ];

      const foundIds = findCropsInMarquee(crops, box);

      expect(foundIds).toEqual(['c1', 'c2']);
    });
  });

  describe('computeGroupBoundingBox', () => {
    it('returns null when selected set is empty or matches no crops', () => {
      const crops = [buildCropPlacementItem({ id: 'c1' })];

      const box = computeGroupBoundingBox(crops, new Set(['unknown']));

      expect(box).toBeNull();
    });

    it('calculates bounding box enclosing vital radii of all selected crops plus padding', () => {
      const crops = [
        buildCropPlacementItem({
          id: 'c1',
          position: { x: 30, y: 40 },
          vitalRadius: 10
        }),
        buildCropPlacementItem({
          id: 'c2',
          position: { x: 80, y: 60 },
          vitalRadius: 15
        }),
        buildCropPlacementItem({
          id: 'c3',
          position: { x: 150, y: 60 },
          vitalRadius: 10
        })
      ];
      const selectedIds = new Set(['c1', 'c2']);
      const padding = 4;

      const box = computeGroupBoundingBox(crops, selectedIds, padding);

      expect(box).not.toBeNull();
      expect(box?.minX).toBe(30 - 10 - padding);
      expect(box?.maxX).toBe(80 + 15 + padding);
      expect(box?.minY).toBe(40 - 10 - padding);
      expect(box?.maxY).toBe(60 + 15 + padding);
      expect(box?.count).toBe(2);
      expect(box?.center.x).toBeCloseTo((16 + 99) / 2);
    });
  });

  describe('evaluateGroupMovement', () => {
    const bedDimensions = { width: 200, height: 100 };

    it('returns valid when group moves to a free in-bounds region', () => {
      const crops = [
        buildCropPlacementItem({
          id: 's1',
          position: { x: 30, y: 30 },
          vitalRadius: 10
        }),
        buildCropPlacementItem({
          id: 's2',
          position: { x: 60, y: 30 },
          vitalRadius: 10
        }),
        buildCropPlacementItem({
          id: 'f1',
          position: { x: 150, y: 30 },
          vitalRadius: 10
        })
      ];

      const result = evaluateGroupMovement({
        crops,
        selectedCropIds: new Set(['s1', 's2']),
        displacementCm: { x: 20, y: 10 },
        bedDimensions
      });

      expect(result.isValid).toBe(true);
      expect(result.hasCollision).toBe(false);
      expect(result.isOutOfBounds).toBe(false);
    });

    it('flags out of bounds when any moved crop leaves bed boundary', () => {
      const crops = [
        buildCropPlacementItem({
          id: 's1',
          position: { x: 190, y: 30 },
          vitalRadius: 10
        })
      ];

      const result = evaluateGroupMovement({
        crops,
        selectedCropIds: new Set(['s1']),
        displacementCm: { x: 20, y: 0 },
        bedDimensions
      });

      expect(result.isValid).toBe(false);
      expect(result.isOutOfBounds).toBe(true);
    });

    it('does not evaluate collision among selected crops themselves', () => {
      const crops = [
        buildCropPlacementItem({
          id: 's1',
          position: { x: 30, y: 30 },
          vitalRadius: 10
        }),
        buildCropPlacementItem({
          id: 's2',
          position: { x: 45, y: 30 },
          vitalRadius: 10
        })
      ];

      const result = evaluateGroupMovement({
        crops,
        selectedCropIds: new Set(['s1', 's2']),
        displacementCm: { x: 10, y: 10 },
        bedDimensions
      });

      expect(result.hasCollision).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('flags collision when a moved crop overlaps with a fixed crop', () => {
      const crops = [
        buildCropPlacementItem({
          id: 's1',
          position: { x: 30, y: 30 },
          vitalRadius: 10
        }),
        buildCropPlacementItem({
          id: 'fixed-1',
          position: { x: 60, y: 30 },
          vitalRadius: 10
        })
      ];

      const result = evaluateGroupMovement({
        crops,
        selectedCropIds: new Set(['s1']),
        displacementCm: { x: 25, y: 0 },
        bedDimensions
      });

      expect(result.isValid).toBe(false);
      expect(result.hasCollision).toBe(true);
    });
  });
});
