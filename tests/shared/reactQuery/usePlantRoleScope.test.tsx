import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { usePlantRoleScope } from '../../../src/shared/reactQuery/usePlantRoleScope';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';

describe('usePlantRoleScope', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
  });

  it('devuelve public cuando se ejecuta sin AuthProvider', () => {
    const { result } = renderHook(() => usePlantRoleScope());

    expect(result.current).toBe('public');
  });

  it('devuelve public cuando la sesión es de un usuario no administrador', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const { result } = renderHook(() => usePlantRoleScope(), {
      wrapper: AuthProvider
    });

    expect(result.current).toBe('public');
  });

  it('devuelve admin cuando la sesión es de un administrador', () => {
    setStoredToken(ADMIN_TEST_TOKEN);

    const { result } = renderHook(() => usePlantRoleScope(), {
      wrapper: AuthProvider
    });

    expect(result.current).toBe('admin');
  });
});
