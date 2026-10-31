import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { useAnomalyRoleScope } from '../../../src/shared/reactQuery/useAnomalyRoleScope';
import {
  ADMIN_TEST_TOKEN,
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';

describe('useAnomalyRoleScope', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
  });

  it('devuelve public para un anónimo sin AuthProvider', () => {
    const { result } = renderHook(() => useAnomalyRoleScope());

    expect(result.current).toBe('public');
  });

  it('devuelve public para un usuario sin rol editorial', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const { result } = renderHook(() => useAnomalyRoleScope(), {
      wrapper: AuthProvider
    });

    expect(result.current).toBe('public');
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', COLLABORATOR_TEST_TOKEN]
  ])('devuelve editorial para %s', (_role, token) => {
    setStoredToken(token);

    const { result } = renderHook(() => useAnomalyRoleScope(), {
      wrapper: AuthProvider
    });

    expect(result.current).toBe('editorial');
  });
});
