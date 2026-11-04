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
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
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

  it('stores token in localStorage and retrieves it', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const token = getStoredToken();

    expect(token).toBe(VALID_TEST_TOKEN);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(VALID_TEST_TOKEN);
  });

  it('clears localStorage and returns null when stored token is expired', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, EXPIRED_TEST_TOKEN);

    const token = getStoredToken();

    expect(token).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('clears localStorage and returns null when stored token is malformed', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'malformed.jwt');

    const token = getStoredToken();

    expect(token).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('removes token from localStorage on clearStoredToken', () => {
    setStoredToken(VALID_TEST_TOKEN);

    clearStoredToken();

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
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

  it('restores valid session from localStorage with getInitialSession', () => {
    setStoredToken(VALID_TEST_TOKEN);

    const session = getInitialSession();

    expect(session?.user.username).toBe('hortelano');
  });

  it('persists session across tab restarts when sessionStorage is empty', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, VALID_TEST_TOKEN);
    sessionStorage.clear();

    const session = getInitialSession();

    expect(session?.user.username).toBe('hortelano');
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(VALID_TEST_TOKEN);
  });

  it('preserves localStorage session and sanitizes legacy transfer ticket from URL', () => {
    const attackerToken = createTestJwt({
      id: '00000000-0000-4000-8000-000000000099',
      username: 'attacker',
      exp: 2500000000
    });
    const ticket = 'attacker-ticket-id';
    localStorage.setItem(
      `session_transfer_${ticket}`,
      JSON.stringify({ token: attackerToken, expiresAt: Date.now() + 60000 })
    );
    setStoredToken(VALID_TEST_TOKEN);
    window.history.pushState(
      null,
      '',
      `/families/new#session_transfer=${ticket}`
    );

    const session = getInitialSession();

    expect(session?.user.username).toBe('hortelano');
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(VALID_TEST_TOKEN);
    expect(window.location.hash).toBe('');
  });

  it('restores valid session from legacy transferred ticket when localStorage is empty', () => {
    const ticket = 'valid-handoff-ticket';
    localStorage.setItem(
      `session_transfer_${ticket}`,
      JSON.stringify({ token: VALID_TEST_TOKEN, expiresAt: Date.now() + 60000 })
    );
    window.history.pushState(
      null,
      '',
      `/families/new#session_transfer=${ticket}`
    );

    const session = getInitialSession();

    expect(session?.user.username).toBe('hortelano');
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(VALID_TEST_TOKEN);
    expect(window.location.hash).toBe('');
  });

  it('rejects untrusted transfer ticket not present in localStorage', () => {
    window.history.pushState(
      null,
      '',
      '/families/new#session_transfer=foreign-untrusted-ticket'
    );

    const session = getInitialSession();

    expect(session).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('does not accept raw bearer token in URL hash fragment', () => {
    window.history.pushState(
      null,
      '',
      `/families/new#session_token=${VALID_TEST_TOKEN}`
    );

    const session = getInitialSession();

    expect(session).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('cleans localStorage and returns null in getInitialSession when token is expired', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, EXPIRED_TEST_TOKEN);

    const session = getInitialSession();

    expect(session).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
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
