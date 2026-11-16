import { t } from '../../../i18n/core/t';
import { ApiError } from '../../../shared/errors/ApiError';
import { resolveAuthErrorText } from '../../auth/utils/authErrorText';

const SAME_PASSWORD_ERROR_PATTERN =
  /different from (?:the )?(?:old|current) password/i;

export function resolveError(errorKey?: string): string | null {
  if (!errorKey) return null;
  const translated = resolveAuthErrorText(errorKey);
  return translated ?? errorKey;
}

export function isSamePasswordErrorMessage(message?: unknown): boolean {
  if (typeof message !== 'string') return false;
  const trimmed = message.trim();
  return trimmed === 'different' || SAME_PASSWORD_ERROR_PATTERN.test(trimmed);
}

function mapPasswordErrors(
  errors: Record<string, string>
): Record<string, string> {
  const mappedErrors: Record<string, string> = { ...errors };
  if (mappedErrors.oldPassword) {
    mappedErrors.oldPassword = t('settings.invalid_current_password');
  }
  if (
    mappedErrors.password &&
    isSamePasswordErrorMessage(mappedErrors.password)
  ) {
    mappedErrors.password = t('settings.password_must_be_different');
  }
  return mappedErrors;
}

function resolvePasswordErrorMessage(message: string): string {
  if (isSamePasswordErrorMessage(message)) {
    return t('settings.password_must_be_different');
  }
  return message || t('settings.invalid_current_password');
}

function handlePasswordBadRequest(
  error: ApiError,
  setFieldErrors: (errors: Record<string, string>) => void,
  showErrorToast: (msg: unknown) => void
): void {
  if (error.errors && Object.keys(error.errors).length > 0) {
    setFieldErrors(mapPasswordErrors(error.errors));
    showErrorToast({
      title: t('admin.toast_error_title'),
      message: t('toast.form_validation_check')
    });
    return;
  }
  showErrorToast(resolvePasswordErrorMessage(error.message));
}

export function handlePasswordUpdateError(
  error: unknown,
  actions: {
    setFieldErrors: (errors: Record<string, string>) => void;
    showErrorToast: (msg: unknown) => void;
    logout: () => void;
  }
): void {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      handlePasswordBadRequest(
        error,
        actions.setFieldErrors,
        actions.showErrorToast
      );
      return;
    }
    if (error.status === 401) {
      actions.logout();
      return;
    }
  }
  actions.showErrorToast(error);
}
