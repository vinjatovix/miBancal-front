import { describe, expect, it } from 'vitest';

import {
  buildPlantInstanceListQuery,
  type PlantInstanceListRequest
} from '../../src/services/plantInstanceListQuery';

describe('buildPlantInstanceListQuery', () => {
  it('returns an empty string when the request is omitted', () => {
    const query = buildPlantInstanceListQuery();

    expect(query).toBe('');
  });

  it.each<{
    readonly name: string;
    readonly request: PlantInstanceListRequest;
    readonly expected: string;
  }>([
    {
      name: 'bedId filter',
      request: { bedId: 'd3b07384-d113-48e0-bb12-f0183f05b0c8' },
      expected: 'filter[bedId][eq]=d3b07384-d113-48e0-bb12-f0183f05b0c8'
    },
    {
      name: 'plantId filter',
      request: { plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' },
      expected: 'filter[plantId][eq]=9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    },
    {
      name: 'pagination page',
      request: { page: 2 },
      expected: 'pagination[page]=2'
    },
    {
      name: 'pagination limit',
      request: { limit: 50 },
      expected: 'pagination[limit]=50'
    },
    {
      name: 'plantedAt sort ascending',
      request: { sort: 'asc' },
      expected: 'sort[plantedAt]=asc'
    }
  ])('encodes the $name', ({ request, expected }) => {
    const query = decodeURIComponent(buildPlantInstanceListQuery(request));

    expect(query).toBe(expected);
  });

  it('caps the pagination limit at 100', () => {
    const query = decodeURIComponent(
      buildPlantInstanceListQuery({ limit: 500 })
    );

    expect(query).toBe('pagination[limit]=100');
  });

  it('combines every parameter in a deterministic order', () => {
    const query = decodeURIComponent(
      buildPlantInstanceListQuery({
        bedId: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
        plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        page: 1,
        limit: 100,
        sort: 'desc'
      })
    );

    expect(query).toBe(
      'filter[bedId][eq]=d3b07384-d113-48e0-bb12-f0183f05b0c8&' +
        'filter[plantId][eq]=9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d&' +
        'pagination[page]=1&pagination[limit]=100&sort[plantedAt]=desc'
    );
  });
});
