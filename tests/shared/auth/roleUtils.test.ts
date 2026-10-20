import { describe, expect, it } from 'vitest';

import { hasCatalogEditorRole } from '../../../src/shared/auth/roleUtils';
import type { AuthUser, UserRole } from '../../../src/types/auth';

function buildUser(roles: readonly UserRole[]): AuthUser {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: 'gardener',
    roles
  };
}

describe('hasCatalogEditorRole', () => {
  it.each([
    [['admin'] as const, true],
    [['collaborator'] as const, true],
    [['admin', 'collaborator'] as const, true],
    [['user', 'collaborator'] as const, true],
    [['user'] as const, false],
    [[] as const, false]
  ])('returns %s for user with roles %j', (roles, expected) => {
    const user = buildUser(roles);

    const result = hasCatalogEditorRole(user);

    expect(result).toBe(expected);
  });

  it.each([
    [['admin'] as const, true],
    [['collaborator'] as const, true],
    [['user'] as const, false],
    [[] as const, false]
  ])('returns %s for direct roles array %j', (roles, expected) => {
    const result = hasCatalogEditorRole(roles);

    expect(result).toBe(expected);
  });

  it('returns false when user is null', () => {
    const result = hasCatalogEditorRole(null);

    expect(result).toBe(false);
  });

  it('returns false when user is undefined', () => {
    const result = hasCatalogEditorRole(undefined);

    expect(result).toBe(false);
  });
});
