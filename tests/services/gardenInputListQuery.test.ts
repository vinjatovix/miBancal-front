import { describe, expect, it } from 'vitest';

import {
  DEFAULT_GARDEN_INPUT_SORT,
  GARDEN_INPUT_FIELDS_QUERY_KEY,
  GARDEN_INPUT_LIST_FIELDS,
  GARDEN_INPUT_SORT_FIELDS,
  buildGardenInputQuery,
  gardenInputSortQueryKey,
  isGardenInputSortField,
  type GardenInputListRequest
} from '../../src/services/gardenInputListQuery';

describe('gardenInputListQuery', () => {
  it('declares the sparse fieldset query key as fields[gardenInputs]', () => {
    const key = GARDEN_INPUT_FIELDS_QUERY_KEY;

    expect(key).toBe('fields[gardenInputs]');
  });

  it('declares the required sparse fieldset list fields', () => {
    const fields = [...GARDEN_INPUT_LIST_FIELDS];

    expect(fields).toEqual([
      'id',
      'slug',
      'name',
      'category',
      'actions',
      'description',
      'status',
      'deletedAt'
    ]);
  });

  it('declares valid sort fields and default sort', () => {
    const sortFields = [...GARDEN_INPUT_SORT_FIELDS];
    const defaultSort = DEFAULT_GARDEN_INPUT_SORT;

    expect(sortFields).toEqual(['name', 'slug', 'category']);
    expect(defaultSort).toEqual({ field: 'name', direction: 'asc' });
    expect(gardenInputSortQueryKey('name')).toBe('sort[name]');
    expect(gardenInputSortQueryKey('slug')).toBe('sort[slug]');
    expect(gardenInputSortQueryKey('category')).toBe('sort[category]');
  });

  it('validates sort fields accurately', () => {
    const isName = isGardenInputSortField('name');
    const isInvalid = isGardenInputSortField('invalid');

    expect(isName).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('builds query with pagination, default sort and sparse fieldset', () => {
    const request: GardenInputListRequest = {
      filters: {},
      pagination: { page: 1, limit: 25 },
      sort: DEFAULT_GARDEN_INPUT_SORT
    };

    const query = buildGardenInputQuery(request);

    expect(query).toContain('pagination%5Bpage%5D=1');
    expect(query).toContain('pagination%5Blimit%5D=25');
    expect(query).toContain('sort%5Bname%5D=asc');
    expect(query).toContain(
      'fields%5BgardenInputs%5D=id%2Cslug%2Cname%2Ccategory%2Cactions%2Cdescription%2Cstatus%2CdeletedAt'
    );
  });

  it('serializes category in filter when multiple or single categories provided', () => {
    const request: GardenInputListRequest = {
      filters: {
        category: ['defense', 'fertilizer']
      },
      pagination: { page: 1, limit: 20 },
      sort: { field: 'slug', direction: 'desc' }
    };

    const query = buildGardenInputQuery(request);

    expect(query).toContain(
      'filter%5Bcategory%5D%5Bin%5D=defense%2Cfertilizer'
    );
  });

  it('serializes action in filter when actions are provided', () => {
    const request: GardenInputListRequest = {
      filters: {
        action: ['fungicide', 'insecticide']
      },
      pagination: { page: 1, limit: 20 },
      sort: DEFAULT_GARDEN_INPUT_SORT
    };

    const query = buildGardenInputQuery(request);

    expect(query).toContain(
      'filter%5Baction%5D%5Bin%5D=fungicide%2Cinsecticide'
    );
  });

  it('serializes status with eq when single status provided', () => {
    const request: GardenInputListRequest = {
      filters: {
        status: 'active'
      },
      pagination: { page: 1, limit: 25 },
      sort: DEFAULT_GARDEN_INPUT_SORT
    };

    const query = buildGardenInputQuery(request);

    expect(query).toContain('filter%5Bstatus%5D%5Beq%5D=active');
  });

  it('serializes status with in when multiple statuses provided', () => {
    const request: GardenInputListRequest = {
      filters: {
        status: ['active', 'deleted']
      },
      pagination: { page: 1, limit: 25 },
      sort: DEFAULT_GARDEN_INPUT_SORT
    };

    const query = buildGardenInputQuery(request);

    expect(query).toContain('filter%5Bstatus%5D%5Bin%5D=active%2Cdeleted');
  });
});
