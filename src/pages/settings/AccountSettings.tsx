import { useCallback, useState, type FormEvent } from 'react';

import { t } from '../../i18n/core/t';
import { useAuth } from '../../shared/auth/useAuth';
import { validateUpdatePasswordForm } from '../../shared/auth/validation';
import { ApiError } from '../../shared/errors/ApiError';
import PasswordField from '../auth/components/PasswordField';
import PasswordStrengthBar from '../auth/components/PasswordStrengthBar';
import { resolveAuthErrorText } from '../auth/utils/authErrorText';
import './accountSettings.css';

interface FormValues {
  readonly oldPassword: string;
  readonly password: string;
  readonly repeatPassword: string;
}

const INITIAL_VALUES: FormValues = {
  oldPassword: '',
  password: '',
  repeatPassword: ''
};

const SAME_PASSWORD_ERROR_PATTERN =
  /different from (?:the )?(?:old|current) password/i;

function resolveError(errorKey?: string): string | null {
  if (!errorKey) return null;
  const translated = resolveAuthErrorText(errorKey);
  return translated ?? errorKey;
}

function isSamePasswordErrorMessage(message?: unknown): boolean {
  if (typeof message !== 'string') return false;
  const trimmed = message.trim();
  return trimmed === 'different' || SAME_PASSWORD_ERROR_PATTERN.test(trimmed);
}

export default function AccountSettings() {
  const { user, updatePassword, logout } = useAuth();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldInteraction = useCallback((field: keyof FormValues) => {
    setIsSuccess(false);
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (field: keyof FormValues, value: string) => {
      setValues((previous) => ({ ...previous, [field]: value }));
      handleFieldInteraction(field);
    },
    [handleFieldInteraction]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setServerError(null);

      const errors = validateUpdatePasswordForm(values);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setIsSubmitting(true);
      try {
        await updatePassword(values);
        setIsSuccess(true);
        setValues(INITIAL_VALUES);
        setFieldErrors({});
      } catch (error) {
        if (error instanceof ApiError && error.status === 400) {
          if (error.errors && Object.keys(error.errors).length > 0) {
            const mappedErrors: Record<string, string> = { ...error.errors };
            if (mappedErrors.oldPassword) {
              mappedErrors.oldPassword = t('settings.invalid_current_password');
            }
            if (
              mappedErrors.password &&
              isSamePasswordErrorMessage(mappedErrors.password)
            ) {
              mappedErrors.password = t('settings.password_must_be_different');
            }
            setFieldErrors(mappedErrors);
          } else {
            const isSamePassword = isSamePasswordErrorMessage(error.message);
            setServerError(
              isSamePassword
                ? t('settings.password_must_be_different')
                : error.message || t('settings.invalid_current_password')
            );
          }
        } else if (error instanceof ApiError && error.status === 401) {
          logout();
        } else {
          const message =
            error instanceof Error
              ? error.message
              : t('errors.unknown.message');
          setServerError(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, updatePassword, logout]
  );

  return (
    <main className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">{t('settings.title')}</h1>

        <section
          className="settings-section settings-profile-section"
          aria-labelledby="profile-heading"
        >
          <h2 id="profile-heading" className="settings-section-title">
            {t('settings.profile_section')}
          </h2>
          <div className="settings-profile-fields">
            <div className="settings-display-group">
              <span className="settings-display-label">
                {t('settings.profile_username')}
              </span>
              <span className="settings-display-value">{user?.username}</span>
            </div>
            <div className="settings-display-group">
              <span className="settings-display-label">
                {t('settings.profile_email')}
              </span>
              <span className="settings-display-value">{user?.email}</span>
            </div>
          </div>
        </section>

        <section
          className="settings-section settings-security-section"
          aria-labelledby="security-heading"
        >
          <h2 id="security-heading" className="settings-section-title">
            {t('settings.security_section')}
          </h2>

          {isSuccess && (
            <div className="settings-alert-success" role="status">
              {t('settings.success_message')}
            </div>
          )}

          {serverError && (
            <div className="settings-alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form className="settings-form" noValidate onSubmit={handleSubmit}>
            <PasswordField
              id="settings-old-password"
              name="oldPassword"
              label={t('settings.old_password')}
              value={values.oldPassword}
              onChange={(value) => handleChange('oldPassword', value)}
              onFocus={() => handleFieldInteraction('oldPassword')}
              autoComplete="current-password"
              error={resolveError(fieldErrors.oldPassword)}
              disabled={isSubmitting}
            />

            <PasswordField
              id="settings-password"
              name="password"
              label={t('settings.new_password')}
              value={values.password}
              onChange={(value) => handleChange('password', value)}
              onFocus={() => handleFieldInteraction('password')}
              autoComplete="new-password"
              error={resolveError(fieldErrors.password)}
              disabled={isSubmitting}
            >
              <PasswordStrengthBar password={values.password} />
            </PasswordField>

            <PasswordField
              id="settings-repeat-password"
              name="repeatPassword"
              label={t('settings.repeat_new_password')}
              value={values.repeatPassword}
              onChange={(value) => handleChange('repeatPassword', value)}
              onFocus={() => handleFieldInteraction('repeatPassword')}
              autoComplete="new-password"
              error={resolveError(fieldErrors.repeatPassword)}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              className="settings-submit-button"
              disabled={isSubmitting}
            >
              {t('settings.change_password_submit')}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
