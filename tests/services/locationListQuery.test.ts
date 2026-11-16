import { describe, expect, it } from 'vitest';

import {
  buildLocationListQuery,
  DEFAULT_LOCATION_SORT,
  isLocationSortField,
  sortQueryKey,
  type LocationListRequest
} from '../../src/services/locationListQuery';

const DEFAULT_REQUEST: LocationListRequest = {
  pagination: { page: 1, limit: 25 },
  sort: DEFAULT_LOCATION_SORT
};

describe('sortQueryKey', () => {
  it.each(['name', 'createdAt'] as const)('construye sort[%s]', (field) => {
    expect(sortQueryKey(field)).toBe(`sort[${field}]`);
  });
});

describe('isLocationSortField', () => {
  it('acepta campos declarados', () => {
    expect(isLocationSortField('name')).toBe(true);
    expect(isLocationSortField('createdAt')).toBe(true);
  });

  it('rechaza campos no declarados', () => {
    expect(isLocationSortField('updatedAt')).toBe(false);
    expect(isLocationSortField('')).toBe(false);
  });
});

describe('buildLocationListQuery', () => {
  it('construye paginación y orden por defecto', () => {
    expect(buildLocationListQuery(DEFAULT_REQUEST)).toBe(
      'pagination%5Bpage%5D=1&pagination%5Blimit%5D=25&sort%5Bname%5D=asc'
    );
  });

  it.each([
    ['name', 'asc'],
    ['name', 'desc'],
    ['createdAt', 'asc'],
    ['createdAt', 'desc']
  ] as const)('incluye sort[%s]=%s', (field, direction) => {
    const query = buildLocationListQuery({
      ...DEFAULT_REQUEST,
      sort: { field, direction }
    });

    expect(decodeURIComponent(query)).toContain(`sort[${field}]=${direction}`);
  });

  it('respeta página y límite', () => {
    const query = buildLocationListQuery({
      pagination: { page: 3, limit: 100 },
      sort: DEFAULT_LOCATION_SORT
    });

    const decoded = decodeURIComponent(query);
    expect(decoded).toContain('pagination[page]=3');
    expect(decoded).toContain('pagination[limit]=100');
  });
});
