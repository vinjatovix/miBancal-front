import { t } from '../../i18n/core/t';
import { ApiError } from '../errors/ApiError';
import { NetworkError } from '../errors/NetworkError';
import { PreconditionFailedError } from '../errors/PreconditionFailedError';

export interface ErrorToastPayload {
  readonly title: string;
  readonly message: string;
}

function resolveApiErrorPayload(error: ApiError): ErrorToastPayload {
  if (error.status === 429) {
    return {
      title: t('errors.tooManyRequests.title'),
      message: t('errors.tooManyRequests.message')
    };
  }

  if (error.status === 412) {
    return {
      title: t('errors.conflict.title'),
      message: t('toast.concurrent_modification')
    };
  }

  if (
    error.status === 400 &&
    error.errors &&
    Object.keys(error.errors).length > 0
  ) {
    return {
      title: t('admin.toast_error_title'),
      message: t('toast.form_validation_check')
    };
  }

  if (error.status === 401) {
    return {
      title: t('auth.invalid_credentials'),
      message: error.message
    };
  }

  return {
    title: t('admin.toast_error_title'),
    message: error.message
  };
}

function resolveStructuredPayload(error: object): ErrorToastPayload | null {
  if ('message' in error && typeof error.message === 'string') {
    const title =
      'title' in error && typeof error.title === 'string'
        ? error.title
        : t('admin.toast_error_title');
    return {
      title,
      message: error.message
    };
  }
  return null;
}

export function resolveErrorToastPayload(
  error: unknown,
  fallbackMessage?: string
): ErrorToastPayload {
  if (typeof error === 'string') {
    return {
      title: t('admin.toast_error_title'),
      message: error
    };
  }

  if (error instanceof PreconditionFailedError) {
    return {
      title: t('errors.conflict.title'),
      message: t('toast.concurrent_modification')
    };
  }

  if (error instanceof ApiError) {
    return resolveApiErrorPayload(error);
  }

  if (error instanceof NetworkError) {
    return {
      title: t('errors.offline.title'),
      message: t('errors.offline.message')
    };
  }

  if (error instanceof Error) {
    return {
      title: t('admin.toast_error_title'),
      message: error.message
    };
  }

  if (typeof error === 'object' && error !== null) {
    const structured = resolveStructuredPayload(error);
    if (structured) return structured;
  }

  return {
    title: t('admin.toast_error_title'),
    message: fallbackMessage || t('errors.unknown.message')
  };
}
