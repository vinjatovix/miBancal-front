import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { useGardenInputRoleScope } from '../../../src/shared/reactQuery/useGardenInputRoleScope';
import {
  ADMIN_TEST_TOKEN,
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';

describe('useGardenInputRoleScope', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
  });

  it('returns public for anonymous user without AuthProvider', () => {
    const { result } = renderHook(() => useGardenInputRoleScope());

    expect(result.current).toBe('public');
  });

  it('returns public for standard user without editorial role', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const { result } = renderHook(() => useGardenInputRoleScope(), {
      wrapper: AuthProvider
    });

    expect(result.current).toBe('public');
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', COLLABORATOR_TEST_TOKEN]
  ])('returns editorial for %s user', (_role, token) => {
    setStoredToken(token);

    const { result } = renderHook(() => useGardenInputRoleScope(), {
      wrapper: AuthProvider
    });

    expect(result.current).toBe('editorial');
  });
});
