import { describe, expect, it } from 'vitest';

import { userKeys } from '../../../src/shared/reactQuery/userKeys';

describe('userKeys', () => {
  it('defines the base key for all user operations', () => {
    const key = userKeys.all;

    expect(key).toEqual(['users']);
  });

  it.each([
    [
      { email: 'hortelano@example.com' },
      ['users', 'lookup', { email: 'hortelano@example.com' }]
    ],
    [{ username: 'hortelano' }, ['users', 'lookup', { username: 'hortelano' }]]
  ])('creates a lookup query key for %o', (query, expectedKey) => {
    const key = userKeys.lookup(query);

    expect(key).toEqual(expectedKey);
  });
});
