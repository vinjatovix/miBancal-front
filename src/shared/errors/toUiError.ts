import { t } from '../../i18n/core/t';
import type { UiError } from '../components/ErrorResponse/types';
import { classifyFailure, type FailureKind } from './classifyFailure';

export type ToUiErrorOptions = {
  listFilters?: boolean;
};

function messageFor(kind: FailureKind, options: ToUiErrorOptions): string {
  if (kind === 'badRequest' && options.listFilters) {
    return t('errors.badRequest.listMessage');
  }
  return t(`errors.${kind}.message`);
}

export function toUiError(
  error: unknown,
  options: ToUiErrorOptions = {}
): UiError {
  const kind = classifyFailure(error);
  return { kind, message: messageFor(kind, options) };
}
