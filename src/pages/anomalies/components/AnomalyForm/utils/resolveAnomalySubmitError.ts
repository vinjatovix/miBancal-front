import { t } from '../../../../../i18n/core/t';
import { ApiError } from '../../../../../shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../../shared/errors/PreconditionFailedError';
import { normalizeAnomalyApiErrors } from './anomalyFormMappers';

export type AnomalySubmitFailure =
  | { readonly kind: 'conflict' }
  | { readonly kind: 'session' }
  | {
      readonly kind: 'general';
      readonly fieldErrors: Record<string, string>;
      readonly message: string | null;
    };

const SESSION_STATUSES: readonly number[] = [401, 403];
const CONFLICT_STATUS = 409;

function generalMessage(
  error: ApiError,
  hasFieldErrors: boolean
): string | null {
  if (error.status === CONFLICT_STATUS) {
    return t('anomaly.form.duplicate_error');
  }
  return hasFieldErrors ? null : error.message;
}

function resolveApiError(error: ApiError): AnomalySubmitFailure {
  if (SESSION_STATUSES.includes(error.status)) return { kind: 'session' };

  const { fieldErrors, unmappedErrors } = normalizeAnomalyApiErrors(
    error.errors ?? {}
  );
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const message =
    unmappedErrors.length > 0
      ? unmappedErrors.join('; ')
      : generalMessage(error, hasFieldErrors);

  return { kind: 'general', fieldErrors, message };
}

export function resolveAnomalySubmitError(
  error: unknown
): AnomalySubmitFailure {
  if (error instanceof PreconditionFailedError) return { kind: 'conflict' };
  if (error instanceof ApiError) return resolveApiError(error);
  return {
    kind: 'general',
    fieldErrors: {},
    message: error instanceof Error ? error.message : t('errors.app.title')
  };
}
