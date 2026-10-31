import { t } from '../../../i18n/core/t';
import { ApiError } from '../../../shared/errors/ApiError';
import { NetworkError } from '../../../shared/errors/NetworkError';

export type SsoProvider = 'google' | 'github';

export type SsoErrorKind =
  | 'rate_limit'
  | 'access_denied'
  | 'invalid_grant'
  | 'security_error'
  | 'conflict'
  | 'unavailable';

function classifyApiError(status: number, provider: SsoProvider): string {
  if (status === 429) {
    return t('auth.rate_limit_notice');
  }
  if (status === 400 || status === 401) {
    return provider === 'google'
      ? t('auth.sso_google_invalid')
      : t('auth.sso_github_invalid');
  }
  if (status === 409) {
    return t('auth.sso_conflict');
  }
  return t('auth.sso_unavailable');
}

function classifyNamedCondition(
  condition: string,
  provider: SsoProvider
): string | null {
  switch (condition) {
    case 'access_denied':
      return t('auth.sso_access_denied');
    case 'security_error':
      return t('auth.sso_security_error');
    case 'rate_limit':
      return t('auth.rate_limit_notice');
    case 'invalid_grant':
      return provider === 'google'
        ? t('auth.sso_google_invalid')
        : t('auth.sso_github_invalid');
    case 'conflict':
      return t('auth.sso_conflict');
    case 'unavailable':
      return t('auth.sso_unavailable');
    default:
      return null;
  }
}

function extractErrorProperty(error: object): string | null {
  const record = error as { error?: unknown; type?: unknown };
  if (typeof record.error === 'string') {
    return record.error;
  }
  if (typeof record.type === 'string') {
    return record.type;
  }
  return null;
}

export function classifySsoError(
  error: unknown,
  provider: SsoProvider = 'github'
): string {
  if (typeof error === 'string') {
    return classifyNamedCondition(error, provider) ?? t('auth.sso_unavailable');
  }

  if (error instanceof ApiError) {
    return classifyApiError(error.status, provider);
  }

  if (error instanceof NetworkError) {
    return t('auth.sso_unavailable');
  }

  if (typeof error === 'object' && error !== null) {
    const errorProp = extractErrorProperty(error);
    if (errorProp) {
      const named = classifyNamedCondition(errorProp, provider);
      if (named) {
        return named;
      }
    }
  }

  return t('auth.sso_unavailable');
}
