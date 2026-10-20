import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AUTH_TOKEN_STORAGE_KEY,
  buildSessionFromToken,
  clearStoredToken,
  getInitialSession,
  getStoredToken,
  notifySessionPurged,
  setStoredToken,
  subscribeToSessionPurge,
  TOKEN_REFRESH_MARGIN_MS
} from '../../../src/shared/auth/session';
import {
  createTestJwt,
  EXPIRED_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';

describe('session storage manager', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('defines correct storage key and refresh margin', () => {
    expect(AUTH_TOKEN_STORAGE_KEY).toBe('auth_token');
    expect(TOKEN_REFRESH_MARGIN_MS).toBe(300000);
  });

  it('returns null when storage is empty', () => {
    const token = getStoredToken();

    expect(token).toBeNull();
  });

  it('stores and retrieves a valid token', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const token = getStoredToken();

    expect(token).toBe(VALID_TEST_TOKEN);
  });

  it('clears storage and returns null when stored token is expired', () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, EXPIRED_TEST_TOKEN);

    const token = getStoredToken();

    expect(token).toBeNull();
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('clears storage and returns null when stored token is malformed', () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'malformed.jwt');

    const token = getStoredToken();

    expect(token).toBeNull();
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('removes token on clearStoredToken', () => {
    setStoredToken(VALID_TEST_TOKEN);

    clearStoredToken();

    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('builds AuthSession from a valid token', () => {
    const token = createTestJwt({ exp: 2500000000 });

    const session = buildSessionFromToken(token);

    expect(session).toEqual({
      token,
      user: {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'hortelano@example.com',
        username: 'hortelano',
        roles: ['user']
      },
      expiresAt: 2500000000
    });
  });

  it('returns null when building session from expired token', () => {
    const session = buildSessionFromToken(EXPIRED_TEST_TOKEN);

    expect(session).toBeNull();
  });

  it('returns null when building session from invalid token', () => {
    const session = buildSessionFromToken('invalid-token');

    expect(session).toBeNull();
  });

  it('restores valid session with getInitialSession', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const session = getInitialSession();

    expect(session?.user.username).toBe('hortelano');
  });

  it('restores and stores valid session from transferred URL session token in getInitialSession', () => {
    window.history.pushState(
      null,
      '',
      `/families/new#session_token=${VALID_TEST_TOKEN}`
    );

    const session = getInitialSession();

    expect(session?.user.username).toBe('hortelano');
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(
      VALID_TEST_TOKEN
    );
  });

  it('cleans storage and returns null in getInitialSession when token is expired', () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, EXPIRED_TEST_TOKEN);

    const session = getInitialSession();

    expect(session).toBeNull();
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('notifies registered purge listeners', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionPurge(listener);

    notifySessionPurged();

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('unsubscribes listener correctly', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionPurge(listener);
    unsubscribe();

    notifySessionPurged();

    expect(listener).not.toHaveBeenCalled();
  });
});
