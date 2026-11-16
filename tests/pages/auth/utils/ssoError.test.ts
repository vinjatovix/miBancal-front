import { describe, expect, it } from 'vitest';

import { t } from '../../../../src/i18n/core/t';
import { classifySsoError } from '../../../../src/pages/auth/utils/ssoError';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../../src/shared/errors/NetworkError';

describe('classifySsoError', () => {
  it('maps HTTP 429 ApiError to rate limit notice', () => {
    const error = new ApiError('Too Many Requests', 429);

    const result = classifySsoError(error);

    expect(result).toBe(t('auth.rate_limit_notice'));
  });

  it.each([['access_denied'], [{ error: 'access_denied' }]])(
    'maps access denied condition %j to sso_access_denied translation',
    (condition) => {
      const result = classifySsoError(condition);

      expect(result).toBe(t('auth.sso_access_denied'));
    }
  );

  it.each([
    [400, 'Bad Request'],
    [401, 'Unauthorized']
  ])(
    'maps HTTP %i ApiError to sso_github_invalid translation',
    (status, message) => {
      const error = new ApiError(message, status);

      const result = classifySsoError(error);

      expect(result).toBe(t('auth.sso_github_invalid'));
    }
  );

  it.each([
    [400, 'Bad Request'],
    [401, 'Unauthorized']
  ])(
    'maps HTTP %i ApiError to sso_google_invalid translation when provider is google',
    (status, message) => {
      const error = new ApiError(message, status);

      const result = classifySsoError(error, 'google');

      expect(result).toBe(t('auth.sso_google_invalid'));
    }
  );

  it('maps invalid_grant to sso_google_invalid translation when provider is google', () => {
    const result = classifySsoError('invalid_grant', 'google');

    expect(result).toBe(t('auth.sso_google_invalid'));
  });

  it('maps NetworkError to sso_unavailable translation when provider is google', () => {
    const error = new NetworkError(new Error('Network request failed'));

    const result = classifySsoError(error, 'google');

    expect(result).toBe(t('auth.sso_unavailable'));
  });

  it.each([
    ['security_error'],
    [{ error: 'security_error' }],
    [{ type: 'security_error' }]
  ])(
    'maps security mismatch condition %j to sso_security_error translation',
    (condition) => {
      const result = classifySsoError(condition);

      expect(result).toBe(t('auth.sso_security_error'));
    }
  );

  it.each([
    [500, 'Internal Server Error'],
    [502, 'Bad Gateway'],
    [503, 'Service Unavailable']
  ])(
    'maps HTTP %i ApiError to sso_unavailable translation',
    (status, message) => {
      const error = new ApiError(message, status);

      const result = classifySsoError(error);

      expect(result).toBe(t('auth.sso_unavailable'));
    }
  );

  it('maps NetworkError to sso_unavailable translation', () => {
    const error = new NetworkError(new Error('Failed to fetch'));

    const result = classifySsoError(error);

    expect(result).toBe(t('auth.sso_unavailable'));
  });

  it('maps HTTP 409 ApiError to sso_conflict translation', () => {
    const error = new ApiError('Conflict', 409);

    const result = classifySsoError(error);

    expect(result).toBe(t('auth.sso_conflict'));
  });

  it.each([['conflict'], [{ error: 'conflict' }]])(
    'maps conflict condition %j to sso_conflict translation',
    (condition) => {
      const result = classifySsoError(condition);

      expect(result).toBe(t('auth.sso_conflict'));
    }
  );

  it.each([
    ['rate_limit', 'auth.rate_limit_notice'],
    ['invalid_grant', 'auth.sso_github_invalid'],
    ['conflict', 'auth.sso_conflict'],
    ['unavailable', 'auth.sso_unavailable']
  ] as const)(
    'maps named category %s to %s translation',
    (category, translationKey) => {
      const result = classifySsoError(category);

      expect(result).toBe(t(translationKey));
    }
  );

  it.each([
    [new Error('Unknown generic error')],
    ['unknown_string_error'],
    [null],
    [undefined]
  ])(
    'falls back unexpected error %j to sso_unavailable translation',
    (error) => {
      const result = classifySsoError(error);

      expect(result).toBe(t('auth.sso_unavailable'));
    }
  );
});
