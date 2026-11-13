import { describe, expect, it } from 'vitest';
import { buildBotanicalRelationIndex } from '../../../../src/components/beds/associations/utils/botanicalRelationIndex';
import {
  calculateEffectiveReach,
  calculateEuclideanDistance,
  calculateMidpoint,
  computeActiveAssociationLinks,
  filterAssociationLinks,
  transformLocalToGlobal
} from '../../../../src/components/beds/associations/utils/cropAssociationGeometry';
import type { AssociationCropPoint } from '../../../../src/components/beds/associations/types/cropAssociationTypes';
import { buildPlantRelation } from '../../../fixtures/plantRelations/buildPlantRelation';

describe('cropAssociationGeometry', () => {
  describe('calculateEuclideanDistance', () => {
    it.each([
      [{ x: 0, y: 0 }, { x: 30, y: 40 }, 50],
      [{ x: 50, y: 50 }, { x: 80, y: 50 }, 30],
      [{ x: 10, y: 20 }, { x: 10, y: 120 }, 100],
      [{ x: 0, y: 0 }, { x: 0, y: 0 }, 0]
    ])(
      'computes distance correctly between %o and %o as %d cm',
      (p1, p2, expected) => {
        const distance = calculateEuclideanDistance(p1, p2);

        expect(distance).toBe(expected);
      }
    );
  });

  describe('calculateMidpoint', () => {
    it.each([
      [
        { x: 0, y: 0 },
        { x: 100, y: 200 },
        { x: 50, y: 100 }
      ],
      [
        { x: 30, y: 40 },
        { x: 70, y: 80 },
        { x: 50, y: 60 }
      ],
      [
        { x: -20, y: 10 },
        { x: 20, y: 50 },
        { x: 0, y: 30 }
      ]
    ])('computes midpoint between %o and %o as %o', (p1, p2, expected) => {
      const midpoint = calculateMidpoint(p1, p2);

      expect(midpoint).toEqual(expected);
    });
  });

  describe('calculateEffectiveReach', () => {
    it('uses the minimum maxDistanceCm among relations', () => {
      const relations = [
        buildPlantRelation({
          proximity: { minDistanceCm: 0, maxDistanceCm: 80 }
        }),
        buildPlantRelation({
          proximity: { minDistanceCm: 0, maxDistanceCm: 50 }
        })
      ];

      const reach = calculateEffectiveReach(relations);

      expect(reach).toBe(50);
    });

    it('falls back to 100 cm when maxDistanceCm is null or undefined', () => {
      const relations = [
        buildPlantRelation({
          proximity: { minDistanceCm: 0, maxDistanceCm: null }
        })
      ];

      const reach = calculateEffectiveReach(relations);

      expect(reach).toBe(100);
    });

    it('returns default reach when relations array is empty', () => {
      const reach = calculateEffectiveReach([], 120);

      expect(reach).toBe(120);
    });
  });

  describe('transformLocalToGlobal', () => {
    it.each([
      [50, 20, 100, 200, 0, { x: 150, y: 220 }],
      [10, 0, 100, 100, 90, { x: 100, y: 110 }],
      [10, 0, 100, 100, 180, { x: 90, y: 100 }]
    ])(
      'transforms local (%d, %d) on bed at (%d, %d) rotated %d deg to global %o',
      (x, y, bedX, bedY, rot, expected) => {
        const global = transformLocalToGlobal(x, y, bedX, bedY, rot);

        expect(Math.round(global.x)).toBe(expected.x);
        expect(Math.round(global.y)).toBe(expected.y);
      }
    );
  });

  describe('computeActiveAssociationLinks', () => {
    const tomatoCrop: AssociationCropPoint = {
      id: 'crop-tomato-1',
      plantId: 'plant-tomato',
      bedId: 'bed-1',
      commonName: 'Tomate',
      x: 50,
      y: 50,
      vitalRadius: 20
    };

    const basilCrop: AssociationCropPoint = {
      id: 'crop-basil-1',
      plantId: 'plant-basil',
      bedId: 'bed-1',
      commonName: 'Albahaca',
      x: 80,
      y: 50,
      vitalRadius: 15
    };

    const fennelCrop: AssociationCropPoint = {
      id: 'crop-fennel-1',
      plantId: 'plant-fennel',
      bedId: 'bed-1',
      commonName: 'Hinojo',
      x: 50,
      y: 100,
      vitalRadius: 20
    };

    const neutralCrop: AssociationCropPoint = {
      id: 'crop-neutral-1',
      plantId: 'plant-neutral',
      bedId: 'bed-1',
      commonName: 'Neutral',
      x: 60,
      y: 60,
      vitalRadius: 10
    };

    it('generates beneficial link between companion plants within reach', () => {
      const relation = buildPlantRelation({
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'beneficial',
        proximity: { minDistanceCm: 0, maxDistanceCm: 80 }
      });
      const index = buildBotanicalRelationIndex(
        [relation],
        [tomatoCrop, basilCrop]
      );

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, basilCrop],
        relationIndex: index
      });

      expect(links).toHaveLength(1);
      expect(links[0].visualPolarity).toBe('beneficial');
      expect(links[0].distanceCm).toBe(30);
      expect(links[0].scope).toBe('intra_bed');
      expect(links[0].isWarningPriority).toBe(false);
    });

    it('generates detrimental link with warning polarity for incompatible crops', () => {
      const relation = buildPlantRelation({
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-fennel',
        type: 'detrimental',
        proximity: { minDistanceCm: 0, maxDistanceCm: 80 }
      });
      const index = buildBotanicalRelationIndex(
        [relation],
        [tomatoCrop, fennelCrop]
      );

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, fennelCrop],
        relationIndex: index
      });

      expect(links).toHaveLength(1);
      expect(links[0].visualPolarity).toBe('detrimental');
      expect(links[0].distanceCm).toBe(50);
      expect(links[0].scope).toBe('intra_bed');
    });

    it('omits connection when plants are beyond effective reach', () => {
      const distantBasil: AssociationCropPoint = {
        ...basilCrop,
        x: 180
      };
      const relation = buildPlantRelation({
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'beneficial',
        proximity: { minDistanceCm: 0, maxDistanceCm: 50 }
      });
      const index = buildBotanicalRelationIndex(
        [relation],
        [tomatoCrop, distantBasil]
      );

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, distantBasil],
        relationIndex: index
      });

      expect(links).toHaveLength(0);
    });

    it('omits connection between neutral pairs without documented relations', () => {
      const index = buildBotanicalRelationIndex([], [tomatoCrop, neutralCrop]);

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, neutralCrop],
        relationIndex: index
      });

      expect(links).toHaveLength(0);
    });

    it('detects cross_bed scope when crops belong to different beds', () => {
      const otherBedBasil: AssociationCropPoint = {
        ...basilCrop,
        bedId: 'bed-2'
      };
      const relation = buildPlantRelation({
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'beneficial',
        proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
      });
      const index = buildBotanicalRelationIndex(
        [relation],
        [tomatoCrop, otherBedBasil]
      );

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, otherBedBasil],
        relationIndex: index
      });

      expect(links).toHaveLength(1);
      expect(links[0].scope).toBe('cross_bed');
    });

    it.each(['nitrogen_fixer', 'nutrient_accumulator'] as const)(
      'omits cross_bed link when the only relation is soil-mediated (%s)',
      (mechanism) => {
        const otherBedBasil: AssociationCropPoint = {
          ...basilCrop,
          bedId: 'bed-2'
        };
        const relation = buildPlantRelation({
          sourcePlantId: 'plant-tomato',
          targetPlantId: 'plant-basil',
          type: 'beneficial',
          mechanism,
          proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
        });
        const index = buildBotanicalRelationIndex(
          [relation],
          [tomatoCrop, otherBedBasil]
        );

        const links = computeActiveAssociationLinks({
          crops: [tomatoCrop, otherBedBasil],
          relationIndex: index
        });

        expect(links).toHaveLength(0);
      }
    );

    it.each(['nitrogen_fixer', 'nutrient_accumulator'] as const)(
      'keeps intra_bed link for soil-mediated relation (%s)',
      (mechanism) => {
        const relation = buildPlantRelation({
          sourcePlantId: 'plant-tomato',
          targetPlantId: 'plant-basil',
          type: 'beneficial',
          mechanism,
          proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
        });
        const index = buildBotanicalRelationIndex(
          [relation],
          [tomatoCrop, basilCrop]
        );

        const links = computeActiveAssociationLinks({
          crops: [tomatoCrop, basilCrop],
          relationIndex: index
        });

        expect(links).toHaveLength(1);
        expect(links[0].scope).toBe('intra_bed');
      }
    );

    it('keeps cross_bed link but drops the soil-mediated relation when a spatial one coexists', () => {
      const otherBedBasil: AssociationCropPoint = {
        ...basilCrop,
        bedId: 'bed-2'
      };
      const soilRelation = buildPlantRelation({
        id: 'rel-soil',
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'beneficial',
        mechanism: 'nitrogen_fixer',
        proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
      });
      const spatialRelation = buildPlantRelation({
        id: 'rel-spatial',
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'beneficial',
        mechanism: 'pest_repellent',
        proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
      });
      const index = buildBotanicalRelationIndex(
        [soilRelation, spatialRelation],
        [tomatoCrop, otherBedBasil]
      );

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, otherBedBasil],
        relationIndex: index
      });

      expect(links).toHaveLength(1);
      expect(links[0].scope).toBe('cross_bed');
      expect(links[0].relations).toHaveLength(1);
      expect(links[0].relations[0].mechanism).toBe('pest_repellent');
    });

    it('sets isWarningPriority when concurrent beneficial and detrimental relations coexist', () => {
      const beneficialRel = buildPlantRelation({
        id: 'rel-ben',
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'beneficial',
        proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
      });
      const detrimentalRel = buildPlantRelation({
        id: 'rel-det',
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-basil',
        type: 'detrimental',
        proximity: { minDistanceCm: 0, maxDistanceCm: 100 }
      });
      const index = buildBotanicalRelationIndex(
        [beneficialRel, detrimentalRel],
        [tomatoCrop, basilCrop]
      );

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, basilCrop],
        relationIndex: index
      });

      expect(links).toHaveLength(1);
      expect(links[0].visualPolarity).toBe('detrimental');
      expect(links[0].isWarningPriority).toBe(true);
      expect(links[0].relations).toHaveLength(2);
    });

    it('ignores duplicate crops with identical id (non-reflexive)', () => {
      const relation = buildPlantRelation({
        sourcePlantId: 'plant-tomato',
        targetPlantId: 'plant-tomato',
        type: 'beneficial'
      });
      const index = buildBotanicalRelationIndex([relation], [tomatoCrop]);

      const links = computeActiveAssociationLinks({
        crops: [tomatoCrop, tomatoCrop],
        relationIndex: index
      });

      expect(links).toHaveLength(0);
    });
  });

  describe('filterAssociationLinks', () => {
    const beneficialLink = {
      id: 'link-1',
      visualPolarity: 'beneficial' as const
    } as unknown as Parameters<typeof filterAssociationLinks>[0][0];

    const detrimentalLink = {
      id: 'link-2',
      visualPolarity: 'detrimental' as const
    } as unknown as Parameters<typeof filterAssociationLinks>[0][0];

    it('returns all links when filterMode is all', () => {
      const links = [beneficialLink, detrimentalLink];

      const filtered = filterAssociationLinks(links, 'all');

      expect(filtered).toHaveLength(2);
    });

    it('returns only detrimental links when filterMode is detrimental_only', () => {
      const links = [beneficialLink, detrimentalLink];

      const filtered = filterAssociationLinks(links, 'detrimental_only');

      expect(filtered).toEqual([detrimentalLink]);
    });
  });
});
