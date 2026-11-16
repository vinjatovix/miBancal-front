import { describe, it, expect } from 'vitest';
import { NetworkError } from '../../../src/shared/errors/NetworkError';

describe('NetworkError', () => {
  it('is an Error named NetworkError that keeps its cause', () => {
    const cause = new TypeError('Failed to fetch');

    const error = new NetworkError(cause);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error.name).toBe('NetworkError');
    expect(error.cause).toBe(cause);
  });

  it('keeps a non-Error cause as it is', () => {
    const error = new NetworkError('offline');

    expect(error.cause).toBe('offline');
  });
});
