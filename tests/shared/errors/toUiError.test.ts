import { describe, it, expect } from 'vitest';
import { t } from '../../../src/i18n/core/t';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { toUiError } from '../../../src/shared/errors/toUiError';

describe('toUiError', () => {
  it.each([
    ['offline', new NetworkError(new TypeError('Failed to fetch'))],
    ['unavailable', new ApiError('Internal Server Error', 500)],
    ['badRequest', new ApiError('Invalid sort key', 400)],
    ['forbidden', new ApiError('Forbidden', 403)],
    ['tooManyRequests', new ApiError('Too Many Requests', 429)],
    ['notFound', new ApiError('Plant not found', 404)],
    ['unknown', new Error('boom')]
  ] as const)('maps a %s failure to its translated message', (kind, error) => {
    expect(toUiError(error)).toEqual({
      kind,
      message: t(`errors.${kind}.message`)
    });
  });

  it('never exposes the message sent by the back', () => {
    const result = toUiError(new ApiError('Internal Server Error', 500));

    expect(result.message).not.toContain('Internal Server Error');
    expect(result.message).not.toContain('500');
  });

  it('uses the list message for a 400 on a filtered list', () => {
    const result = toUiError(new ApiError('Invalid filter', 400), {
      listFilters: true
    });

    expect(result).toEqual({
      kind: 'badRequest',
      message: t('errors.badRequest.listMessage')
    });
  });

  it('keeps the regular message for other kinds on a filtered list', () => {
    const result = toUiError(new ApiError('x', 500), { listFilters: true });

    expect(result.message).toBe(t('errors.unavailable.message'));
  });

  it('maps a thrown non-Error value to the unknown message without details', () => {
    const result = toUiError('boom');

    expect(result).toEqual({
      kind: 'unknown',
      message: t('errors.unknown.message')
    });
    expect(result).not.toHaveProperty('details');
  });
});
