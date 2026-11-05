import { describe, expect, it } from 'vitest';
import {
  buildPlantRelationsSearchParams,
  parsePlantRelationsSearchParams
} from '../../../../src/pages/plantRelations/utils/plantRelationsUrl.utils';

const PLANT_ID = '11111111-1111-4111-8111-111111111111';

describe('parsePlantRelationsSearchParams', () => {
  it('parses empty search params with null plantId, all type, and default name:asc sort', () => {
    const params = new URLSearchParams();

    const result = parsePlantRelationsSearchParams(params);

    expect(result).toEqual({
      plantId: null,
      type: 'all',
      sort: { field: 'name', direction: 'asc' }
    });
  });

  it('parses valid plantId, type, and sort', () => {
    const params = new URLSearchParams(
      `plantId=${PLANT_ID}&type=beneficial&sort=scientificName:desc`
    );

    const result = parsePlantRelationsSearchParams(params);

    expect(result).toEqual({
      plantId: PLANT_ID,
      type: 'beneficial',
      sort: { field: 'scientificName', direction: 'desc' }
    });
  });

  it.each([
    ['detrimental', 'detrimental'],
    ['beneficial', 'beneficial'],
    ['invalid', 'all'],
    ['', 'all']
  ] as const)(
    'parses type %s defaulting invalid to %s',
    (rawType, expectedType) => {
      const params = new URLSearchParams(`type=${rawType}`);

      const result = parsePlantRelationsSearchParams(params);

      expect(result.type).toBe(expectedType);
    }
  );

  it.each([
    ['name:desc', { field: 'name' as const, direction: 'desc' as const }],
    [
      'scientificName:asc',
      { field: 'scientificName' as const, direction: 'asc' as const }
    ],
    ['invalid:sort', { field: 'name' as const, direction: 'asc' as const }],
    ['', { field: 'name' as const, direction: 'asc' as const }]
  ])('parses sort %s to %o', (rawSort, expectedSort) => {
    const params = new URLSearchParams(`sort=${rawSort}`);

    const result = parsePlantRelationsSearchParams(params);

    expect(result.sort).toEqual(expectedSort);
  });
});

describe('buildPlantRelationsSearchParams', () => {
  it('omits empty plantId, all type, and default sort', () => {
    const result = buildPlantRelationsSearchParams({
      plantId: null,
      type: 'all'
    });

    expect(result.toString()).toBe('');
  });

  it('serializes plantId and non-default type', () => {
    const result = buildPlantRelationsSearchParams({
      plantId: PLANT_ID,
      type: 'detrimental'
    });

    expect(result.toString()).toBe(`plantId=${PLANT_ID}&type=detrimental`);
  });

  it('serializes non-default sort', () => {
    const result = buildPlantRelationsSearchParams({
      plantId: PLANT_ID,
      type: 'all',
      sort: { field: 'scientificName', direction: 'desc' }
    });

    expect(result.toString()).toBe(
      `plantId=${PLANT_ID}&sort=scientificName%3Adesc`
    );
  });

  it('serializes plantId with default type and default sort omitting them', () => {
    const result = buildPlantRelationsSearchParams({
      plantId: PLANT_ID,
      type: 'all',
      sort: { field: 'name', direction: 'asc' }
    });

    expect(result.toString()).toBe(`plantId=${PLANT_ID}`);
  });
});
