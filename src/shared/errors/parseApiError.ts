import { t } from '../../i18n/core/t';
import { ApiError } from './ApiError';

export function getParsedErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (
      error.status === 409 ||
      error.message === 'Cannot remove the last administrator of the platform'
    ) {
      return t('errors.conflict.message');
    }

    if (error.status === 404 || error.message.startsWith('User not found')) {
      return t('admin.user_not_found');
    }

    if (error.status === 412) {
      return t('admin.concurrent_modification_warning');
    }

    if (error.status === 403) {
      return t('errors.forbidden.message');
    }

    if (error.errors && Object.keys(error.errors).length > 0) {
      return Object.entries(error.errors)
        .map(([field, message]) => {
          if (field === 'email' && message === 'Invalid email address') {
            return t('errors.validation.email');
          }
          return `${field}: ${message}`;
        })
        .join(', ');
    }

    return error.message || t('errors.unknown.message');
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t('errors.unknown.message');
}
