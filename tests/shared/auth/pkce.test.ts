import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  buildGithubAuthorizeUrl,
  clearGithubPkceSession,
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
  getGithubPkceSession,
  PKCE_RETURN_URL_KEY,
  PKCE_STATE_KEY,
  PKCE_VERIFIER_KEY,
  saveGithubPkceSession
} from '../../../src/shared/auth/pkce';

describe('generateCodeVerifier', () => {
  it.each([43, 64, 128])(
    'generates verifier of specified length %i',
    (length) => {
      const verifier = generateCodeVerifier(length);

      expect(verifier).toHaveLength(length);
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    }
  );

  it('generates 64-character verifier by default', () => {
    const verifier = generateCodeVerifier();

    expect(verifier).toHaveLength(64);
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it('generates unique verifiers across calls', () => {
    const verifierA = generateCodeVerifier();
    const verifierB = generateCodeVerifier();

    expect(verifierA).not.toBe(verifierB);
  });
});

describe('generateCodeChallenge', () => {
  it('computes correct S256 code challenge for RFC 7636 test vector', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    const expectedChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

    const challenge = await generateCodeChallenge(verifier);

    expect(challenge).toBe(expectedChallenge);
  });

  it.each([
    ['simple', 'simple-verifier-string-length-at-least-43-chars-long'],
    ['custom', 'another-custom-verifier-testing-sha-256-hash-calculation']
  ])(
    'produces url-safe base64 string without padding for %s',
    async (_, verifier) => {
      const challenge = await generateCodeChallenge(verifier);

      expect(challenge).not.toContain('+');
      expect(challenge).not.toContain('/');
      expect(challenge).not.toContain('=');
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    }
  );
});

describe('generateState', () => {
  it('generates non-empty random state string', () => {
    const state = generateState();

    expect(state.length).toBeGreaterThanOrEqual(16);
  });

  it('generates unique states across calls', () => {
    const stateA = generateState();
    const stateB = generateState();

    expect(stateA).not.toBe(stateB);
  });
});

describe('sessionStorage PKCE management', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('saves verifier, state and returnUrl to sessionStorage with expected keys', () => {
    saveGithubPkceSession({
      verifier: 'test-verifier-value',
      state: 'test-state-value',
      returnUrl: '/plants'
    });

    expect(sessionStorage.getItem(PKCE_VERIFIER_KEY)).toBe(
      'test-verifier-value'
    );
    expect(sessionStorage.getItem(PKCE_STATE_KEY)).toBe('test-state-value');
    expect(sessionStorage.getItem(PKCE_RETURN_URL_KEY)).toBe('/plants');
  });

  it('retrieves saved session values from sessionStorage', () => {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, 'stored-verifier');
    sessionStorage.setItem(PKCE_STATE_KEY, 'stored-state');
    sessionStorage.setItem(PKCE_RETURN_URL_KEY, '/catalog');

    const session = getGithubPkceSession();

    expect(session).toEqual({
      verifier: 'stored-verifier',
      state: 'stored-state',
      returnUrl: '/catalog'
    });
  });

  it('clears all github pkce session keys from sessionStorage', () => {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, 'stored-verifier');
    sessionStorage.setItem(PKCE_STATE_KEY, 'stored-state');
    sessionStorage.setItem(PKCE_RETURN_URL_KEY, '/catalog');

    clearGithubPkceSession();

    expect(sessionStorage.getItem(PKCE_VERIFIER_KEY)).toBeNull();
    expect(sessionStorage.getItem(PKCE_STATE_KEY)).toBeNull();
    expect(sessionStorage.getItem(PKCE_RETURN_URL_KEY)).toBeNull();
  });
});

describe('buildGithubAuthorizeUrl', () => {
  it('constructs correct authorization url with S256 PKCE parameters', () => {
    const params = {
      clientId: 'test-client-id',
      state: 'test-state-token',
      codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
      redirectUri: 'https://example.com/auth/github/callback'
    };

    const url = buildGithubAuthorizeUrl(params);

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://github.com');
    expect(parsed.pathname).toBe('/login/oauth/authorize');
    expect(parsed.searchParams.get('client_id')).toBe('test-client-id');
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'https://example.com/auth/github/callback'
    );
    expect(parsed.searchParams.get('scope')).toBe('read:user user:email');
    expect(parsed.searchParams.get('state')).toBe('test-state-token');
    expect(parsed.searchParams.get('code_challenge')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    );
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
  });
});
