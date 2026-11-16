import { describe, expect, it } from 'vitest';
import {
  buildBotanicalPairKey,
  buildBotanicalRelationIndex,
  getRelationsForPair,
  resolveVisualPolarity
} from '../../../../src/components/beds/associations/utils/botanicalRelationIndex';
import type { AssociationCropPoint } from '../../../../src/components/beds/associations/types/cropAssociationTypes';
import {
  buildPlantRelation,
  DEFAULT_SOURCE_PLANT_ID,
  DEFAULT_TARGET_PLANT_ID
} from '../../../fixtures/plantRelations/buildPlantRelation';

describe('botanicalRelationIndex', () => {
  describe('buildBotanicalPairKey', () => {
    it.each([
      ['plant-a', 'plant-b', 'plant-a:plant-b'],
      ['plant-b', 'plant-a', 'plant-a:plant-b'],
      ['same-plant', 'same-plant', 'same-plant:same-plant'],
      ['1111', '2222', '1111:2222'],
      ['2222', '1111', '1111:2222']
    ])(
      'creates canonical pair key regardless of parameter order for %s and %s',
      (plantA, plantB, expected) => {
        const key = buildBotanicalPairKey(plantA, plantB);

        expect(key).toBe(expected);
      }
    );
  });

  describe('resolveVisualPolarity', () => {
    it('returns beneficial when all relations are beneficial', () => {
      const relations = [
        buildPlantRelation({ type: 'beneficial', mechanism: 'pest_repellent' }),
        buildPlantRelation({
          type: 'beneficial',
          mechanism: 'growth_stimulator'
        })
      ];

      const result = resolveVisualPolarity(relations);

      expect(result).toEqual({
        visualPolarity: 'beneficial',
        isWarningPriority: false
      });
    });

    it('returns detrimental without warning priority when all relations are detrimental', () => {
      const relations = [
        buildPlantRelation({ type: 'detrimental', mechanism: 'allelopathy' })
      ];

      const result = resolveVisualPolarity(relations);

      expect(result).toEqual({
        visualPolarity: 'detrimental',
        isWarningPriority: false
      });
    });

    it('prioritizes detrimental polarity and sets isWarningPriority when relations are mixed', () => {
      const relations = [
        buildPlantRelation({ type: 'beneficial', mechanism: 'pest_repellent' }),
        buildPlantRelation({ type: 'detrimental', mechanism: 'allelopathy' })
      ];

      const result = resolveVisualPolarity(relations);

      expect(result).toEqual({
        visualPolarity: 'detrimental',
        isWarningPriority: true
      });
    });

    it('defaults to beneficial with false warning priority for empty relations array', () => {
      const result = resolveVisualPolarity([]);

      expect(result).toEqual({
        visualPolarity: 'beneficial',
        isWarningPriority: false
      });
    });
  });

  describe('buildBotanicalRelationIndex', () => {
    const crop = (
      plantId: string,
      extra: Partial<AssociationCropPoint> = {}
    ): AssociationCropPoint => ({
      id: `crop-${plantId}`,
      plantId,
      bedId: 'bed-1',
      commonName: plantId,
      x: 0,
      y: 0,
      vitalRadius: 20,
      ...extra
    });

    it('indexes relations by canonical species pair key', () => {
      const beneficialRelation = buildPlantRelation({
        id: 'rel-1',
        sourcePlantId: 'plant-a',
        targetPlantId: 'plant-b',
        source: { scope: 'plant', value: 'plant-a' },
        target: { scope: 'plant', value: 'plant-b' },
        type: 'beneficial'
      });
      const detrimentalRelation = buildPlantRelation({
        id: 'rel-2',
        sourcePlantId: 'plant-b',
        targetPlantId: 'plant-a',
        source: { scope: 'plant', value: 'plant-b' },
        target: { scope: 'plant', value: 'plant-a' },
        type: 'detrimental'
      });

      const index = buildBotanicalRelationIndex(
        [beneficialRelation, detrimentalRelation],
        [crop('plant-a'), crop('plant-b')]
      );

      const key = buildBotanicalPairKey('plant-a', 'plant-b');
      expect(index.hasData).toBe(true);
      expect(index.isLoading).toBe(false);
      expect(index.relationsBySpeciesPair.get(key)).toHaveLength(2);
    });

    it('indexes relations scoped with target all against every other crop', () => {
      const globalRelation = buildPlantRelation({
        id: 'rel-all',
        sourcePlantId: 'pest-repeller',
        source: { scope: 'plant', value: 'pest-repeller' },
        target: { scope: 'all' },
        targetPlantId: undefined,
        type: 'beneficial'
      });

      const index = buildBotanicalRelationIndex(
        [globalRelation],
        [crop('pest-repeller'), crop('crop-1'), crop('crop-2')]
      );

      const key1 = buildBotanicalPairKey('pest-repeller', 'crop-1');
      const key2 = buildBotanicalPairKey('pest-repeller', 'crop-2');

      expect(index.relationsBySpeciesPair.get(key1)).toEqual([globalRelation]);
      expect(index.relationsBySpeciesPair.get(key2)).toEqual([globalRelation]);
    });

    it('returns empty array when querying pair with no relations in index', () => {
      const index = buildBotanicalRelationIndex([], []);

      const relations = getRelationsForPair(index, 'plant-x', 'plant-y');

      expect(relations).toEqual([]);
    });

    it('retrieves relations symmetrically using getRelationsForPair', () => {
      const relation = buildPlantRelation({
        sourcePlantId: DEFAULT_SOURCE_PLANT_ID,
        targetPlantId: DEFAULT_TARGET_PLANT_ID,
        source: { scope: 'plant', value: DEFAULT_SOURCE_PLANT_ID },
        target: { scope: 'plant', value: DEFAULT_TARGET_PLANT_ID }
      });
      const index = buildBotanicalRelationIndex(
        [relation],
        [crop(DEFAULT_SOURCE_PLANT_ID), crop(DEFAULT_TARGET_PLANT_ID)]
      );

      const direct = getRelationsForPair(
        index,
        DEFAULT_SOURCE_PLANT_ID,
        DEFAULT_TARGET_PLANT_ID
      );
      const reverse = getRelationsForPair(
        index,
        DEFAULT_TARGET_PLANT_ID,
        DEFAULT_SOURCE_PLANT_ID
      );

      expect(direct).toEqual([relation]);
      expect(reverse).toEqual([relation]);
    });

    it('ignores relations when no crop matches the source scope', () => {
      const relation = buildPlantRelation({
        sourcePlantId: undefined,
        sourcePlant: undefined,
        source: { scope: 'family', value: 'fam-1' },
        target: { scope: 'all' }
      });

      const index = buildBotanicalRelationIndex(
        [relation],
        [crop('p1'), crop('p2')]
      );

      expect(index.relationsBySpeciesPair.size).toBe(0);
    });

    it('indexes a genus-source to family-target relation (tagetes repels in solanaceae)', () => {
      const relation = buildPlantRelation({
        id: 'rel-tagetes-solanaceae',
        sourcePlantId: undefined,
        targetPlantId: undefined,
        sourcePlant: undefined,
        targetPlant: undefined,
        source: { scope: 'genus', value: 'Tagetes' },
        target: { scope: 'family', value: 'fam-solanaceae' },
        type: 'beneficial',
        mechanism: 'pest_repellent'
      });

      const crops = [
        crop('plant-tagete', { genus: 'Tagetes', familyId: 'fam-asteraceae' }),
        crop('plant-huacatay', {
          genus: 'Tagetes',
          familyId: 'fam-asteraceae'
        }),
        crop('plant-tomato', { genus: 'Solanum', familyId: 'fam-solanaceae' }),
        crop('plant-onion', { genus: 'Allium', familyId: 'fam-amaryllidaceae' })
      ];

      const index = buildBotanicalRelationIndex([relation], crops);

      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-tagete', 'plant-tomato')
        )
      ).toEqual([relation]);
      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-huacatay', 'plant-tomato')
        )
      ).toEqual([relation]);
      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-tagete', 'plant-onion')
        )
      ).toBeUndefined();
    });

    it('indexes relations scoped with family target for matching crops', () => {
      const familyRelation = buildPlantRelation({
        id: 'rel-family',
        sourcePlantId: 'plant-tagetes',
        source: { scope: 'plant', value: 'plant-tagetes' },
        target: { scope: 'family', value: 'fam-solanaceae' },
        targetPlantId: undefined,
        type: 'beneficial',
        mechanism: 'pest_repellent'
      });

      const crops = [
        crop('plant-tagetes', { familyId: 'fam-asteraceae' }),
        crop('plant-tomato', { familyId: 'fam-solanaceae' }),
        crop('plant-pepper', { familyId: 'fam-solanaceae' })
      ];

      const index = buildBotanicalRelationIndex([familyRelation], crops);

      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-tagetes', 'plant-tomato')
        )
      ).toEqual([familyRelation]);
      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-tagetes', 'plant-pepper')
        )
      ).toEqual([familyRelation]);
    });

    it('indexes relations scoped with genus target for matching crops', () => {
      const genusRelation = buildPlantRelation({
        id: 'rel-genus',
        sourcePlantId: 'plant-basil',
        source: { scope: 'plant', value: 'plant-basil' },
        target: { scope: 'genus', value: 'Solanum' },
        targetPlantId: undefined,
        type: 'beneficial'
      });

      const crops = [
        crop('plant-basil', { genus: 'Ocimum' }),
        crop('plant-tomato', { genus: 'Solanum' }),
        crop('plant-eggplant', { genus: 'Solanum' })
      ];

      const index = buildBotanicalRelationIndex([genusRelation], crops);

      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-basil', 'plant-tomato')
        )
      ).toEqual([genusRelation]);
      expect(
        index.relationsBySpeciesPair.get(
          buildBotanicalPairKey('plant-basil', 'plant-eggplant')
        )
      ).toEqual([genusRelation]);
    });
  });
});
