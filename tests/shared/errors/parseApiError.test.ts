import { describe, expect, it } from 'vitest';

import { t } from '../../../src/i18n/core/t';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { getParsedErrorMessage } from '../../../src/shared/errors/parseApiError';

describe('getParsedErrorMessage', () => {
  it.each([
    [new ApiError('Conflict', 409), t('errors.conflict.message')],
    [
      new ApiError('Cannot remove the last administrator of the platform', 400),
      t('errors.conflict.message')
    ],
    [new ApiError('Not found', 404), t('admin.user_not_found')],
    [new ApiError('User not found: hortelano', 400), t('admin.user_not_found')],
    [
      new ApiError('Precondition Failed', 412),
      t('admin.concurrent_modification_warning')
    ],
    [new ApiError('Forbidden', 403), t('errors.forbidden.message')],
    [
      new ApiError('Validation error', 400, { email: 'Invalid email address' }),
      t('errors.validation.email')
    ],
    [
      new ApiError('Validation error', 400, {
        username: 'Too short',
        age: 'Invalid'
      }),
      'username: Too short, age: Invalid'
    ],
    [new ApiError('Custom backend message', 500), 'Custom backend message'],
    [new Error('Standard JS error'), 'Standard JS error'],
    ['Unknown string error', t('errors.unknown.message')]
  ])('parses error %o into expected message %s', (error, expected) => {
    const result = getParsedErrorMessage(error);

    expect(result).toBe(expected);
  });
});
