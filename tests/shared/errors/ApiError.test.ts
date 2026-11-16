import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/shared/errors/ApiError';

describe('ApiError', () => {
  it('stores message, status and errors', () => {
    const error = new ApiError('fail', 404, { id: 'not found' });

    expect(error.message).toBe('fail');
    expect(error.status).toBe(404);
    expect(error.errors).toEqual({ id: 'not found' });
  });
});
