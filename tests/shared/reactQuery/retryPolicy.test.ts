import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { shouldRetryQuery } from '../../../src/shared/reactQuery/retryPolicy';

const RETRYABLE_ERRORS = [
  ['a NetworkError', new NetworkError(new TypeError())],
  ['a 500', new ApiError('x', 500)],
  ['a 503', new ApiError('x', 503)],
  ['a 429', new ApiError('x', 429)]
] as const;

const NON_RETRYABLE_ERRORS = [
  ['a 400', new ApiError('x', 400)],
  ['a 401', new ApiError('x', 401)],
  ['a 403', new ApiError('x', 403)],
  ['a 404', new ApiError('x', 404)],
  ['an unknown error', new Error('x')]
] as const;

describe('shouldRetryQuery', () => {
  it.each(RETRYABLE_ERRORS)(
    'retries %s on the first two failures',
    (_label, error) => {
      expect(shouldRetryQuery(0, error)).toBe(true);
      expect(shouldRetryQuery(1, error)).toBe(true);
    }
  );

  it.each(RETRYABLE_ERRORS)(
    'stops retrying %s after two failures',
    (_label, error) => {
      expect(shouldRetryQuery(2, error)).toBe(false);
    }
  );

  it.each(NON_RETRYABLE_ERRORS)('never retries %s', (_label, error) => {
    expect(shouldRetryQuery(0, error)).toBe(false);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });
});
