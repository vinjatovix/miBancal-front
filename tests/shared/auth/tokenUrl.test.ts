import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  extractAndSanitizeSessionToken,
  extractAndSanitizeToken
} from '../../../src/shared/auth/tokenUrl';

describe('extractAndSanitizeToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts token from hash fragment and sanitizes history', () => {
    window.history.pushState(null, '', '/activate#token=test-hash-token-value');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const token = extractAndSanitizeToken();

    expect(token).toBe('test-hash-token-value');
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/activate');
  });

  it('extracts token from search query fallback and sanitizes history', () => {
    window.history.pushState(
      null,
      '',
      '/activate?token=test-query-token-value'
    );
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const token = extractAndSanitizeToken();

    expect(token).toBe('test-query-token-value');
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/activate');
  });

  it('returns null and does not replace history when no token is present', () => {
    window.history.pushState(null, '', '/activate');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const token = extractAndSanitizeToken();

    expect(token).toBeNull();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});

describe('extractAndSanitizeSessionToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts session token from hash fragment and sanitizes history', () => {
    window.history.pushState(
      null,
      '',
      '/families/new#session_token=valid-jwt-token'
    );
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const token = extractAndSanitizeSessionToken();

    expect(token).toBe('valid-jwt-token');
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/families/new');
  });

  it('returns null and leaves history unchanged when no session token exists in hash', () => {
    window.history.pushState(null, '', '/families/new#other_hash=value');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    const token = extractAndSanitizeSessionToken();

    expect(token).toBeNull();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});
