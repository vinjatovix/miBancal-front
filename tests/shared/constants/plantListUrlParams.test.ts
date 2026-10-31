import { describe, it, expect } from 'vitest';
import {
  PLANT_LIST_FILTER_URL_PARAMS,
  PLANT_LIST_URL_PARAMS,
  withoutPlantListFilters
} from '../../../src/shared/constants/plantListUrlParams';

const NON_FILTER_PARAMS = [
  'page',
  'limit',
  'sortField',
  'sortDirection',
  'hemisphere',
  'tab'
];

describe('PLANT_LIST_FILTER_URL_PARAMS', () => {
  it('lists every url param except page, limit, sort, hemisphere and tab', () => {
    const expected = Object.values(PLANT_LIST_URL_PARAMS).filter(
      (param) => !NON_FILTER_PARAMS.includes(param)
    );

    expect([...PLANT_LIST_FILTER_URL_PARAMS].sort()).toEqual(expected.sort());
  });
});

describe('withoutPlantListFilters', () => {
  it('removes filters and page keeping limit, sort and hemisphere', () => {
    const input = new URLSearchParams(
      'identity=x&family=y&page=3&limit=24&sortField=a&sortDirection=asc&hemisphere=south'
    );

    const result = withoutPlantListFilters(input);

    expect(result.toString()).toBe(
      'limit=24&sortField=a&sortDirection=asc&hemisphere=south'
    );
  });

  it('removes repeated filter values', () => {
    const result = withoutPlantListFilters(
      new URLSearchParams('edible=true&edible=false&limit=25')
    );

    expect(result.toString()).toBe('limit=25');
  });

  it('conserva el parámetro tab (no es un filtro)', () => {
    const result = withoutPlantListFilters(
      new URLSearchParams('identity=x&tab=favorites&limit=25')
    );

    expect(result.toString()).toBe('tab=favorites&limit=25');
  });

  it('does not mutate its input', () => {
    const input = new URLSearchParams('identity=x&page=3');

    withoutPlantListFilters(input);

    expect(input.toString()).toBe('identity=x&page=3');
  });
});
