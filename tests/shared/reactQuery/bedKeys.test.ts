import { describe, expect, it } from 'vitest';

import { bedKeys } from '../../../src/shared/reactQuery/bedKeys';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const BED_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const LOCATION_ID = '7ca85f64-5717-4562-b3fc-2c963f66afa6';

describe('bedKeys', () => {
  it('creates root scope key containing userId', () => {
    const key = bedKeys.all(USER_ID);

    expect(key).toEqual(['beds', USER_ID]);
  });

  it('creates lists scope key extending all', () => {
    const key = bedKeys.lists(USER_ID);

    expect(key).toEqual(['beds', USER_ID, 'list']);
  });

  it('creates default list key with empty filters object when omitted', () => {
    const key = bedKeys.list(USER_ID);

    expect(key).toEqual(['beds', USER_ID, 'list', {}]);
  });

  it('creates list key with location filter serialized', () => {
    const filters = { locationId: LOCATION_ID };

    const key = bedKeys.list(USER_ID, filters);

    expect(key).toEqual(['beds', USER_ID, 'list', { locationId: LOCATION_ID }]);
  });

  it('creates details scope key extending all', () => {
    const key = bedKeys.details(USER_ID);

    expect(key).toEqual(['beds', USER_ID, 'detail']);
  });

  it('creates detail key with specific bed identifier', () => {
    const key = bedKeys.detail(USER_ID, BED_ID);

    expect(key).toEqual(['beds', USER_ID, 'detail', BED_ID]);
  });
});
