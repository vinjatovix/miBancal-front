import { describe, expect, it } from 'vitest';

import { locationKeys } from '../../../src/shared/reactQuery/locationKeys';
import {
  DEFAULT_LOCATION_SORT,
  type LocationListRequest
} from '../../../src/services/locationListQuery';

const USER_ID = '00000000-0000-4000-8000-000000000001';

const REQUEST: LocationListRequest = {
  pagination: { page: 1, limit: 25 },
  sort: DEFAULT_LOCATION_SORT
};

describe('locationKeys', () => {
  it('all incluye el userId', () => {
    expect(locationKeys.all(USER_ID)).toEqual(['locations', USER_ID]);
  });

  it('list incluye el userId y la petición', () => {
    expect(locationKeys.list(USER_ID, REQUEST)).toEqual([
      'locations',
      USER_ID,
      'list',
      REQUEST
    ]);
  });

  it('detail incluye el userId y el id', () => {
    expect(locationKeys.detail(USER_ID, 'loc-1')).toEqual([
      'locations',
      USER_ID,
      'detail',
      'loc-1'
    ]);
  });

  it('detail admite id indefinido', () => {
    expect(locationKeys.detail(USER_ID)).toEqual([
      'locations',
      USER_ID,
      'detail',
      undefined
    ]);
  });

  it('layout includes the location id', () => {
    expect(locationKeys.layout('loc-1')).toEqual([
      'locations',
      'layout',
      'loc-1'
    ]);
  });
});
