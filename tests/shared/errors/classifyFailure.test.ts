import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { classifyFailure } from '../../../src/shared/errors/classifyFailure';

function apiError(status: number) {
  return new ApiError('Internal Server Error', status);
}

describe('classifyFailure', () => {
  it('classifies a NetworkError as offline', () => {
    expect(classifyFailure(new NetworkError(new TypeError()))).toBe('offline');
  });

  it('classifies a 404 as notFound', () => {
    expect(classifyFailure(apiError(404))).toBe('notFound');
  });

  it('classifies a 400 as badRequest', () => {
    expect(classifyFailure(apiError(400))).toBe('badRequest');
  });

  it('classifies a 400 as notFound when badRequestMeansNotFound', () => {
    expect(
      classifyFailure(apiError(400), { badRequestMeansNotFound: true })
    ).toBe('notFound');
  });

  it.each([401, 403])('classifies a %i as forbidden', (status) => {
    expect(classifyFailure(apiError(status))).toBe('forbidden');
  });

  it('classifies a 429 as tooManyRequests', () => {
    expect(classifyFailure(apiError(429))).toBe('tooManyRequests');
  });

  it.each([500, 502, 503])('classifies a %i as unavailable', (status) => {
    expect(classifyFailure(apiError(status))).toBe('unavailable');
  });

  it.each([409, 412])('classifies a %i as unknown', (status) => {
    expect(classifyFailure(apiError(status))).toBe('unknown');
  });

  it.each([
    ['a SyntaxError', new SyntaxError('Unexpected token')],
    ['a plain Error', new Error('x')],
    ['a string', 'texto'],
    ['undefined', undefined],
    ['null', null]
  ])('classifies %s as unknown', (_label, error) => {
    expect(classifyFailure(error)).toBe('unknown');
  });
});
