import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { extractAndSanitizeToken } from '../../../shared/auth/tokenUrl';
import { useAuth } from '../../../shared/auth/useAuth';
import { validateResetPasswordForm } from '../../../shared/auth/validation';
import { ApiError } from '../../../shared/errors/ApiError';
import PasswordField from '../components/PasswordField';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import '../authPages.css';
import { resolveAuthErrorText } from '../utils/authErrorText';

type FormField = 'password' | 'repeatPassword';

type SubmitFailure =
  | { readonly kind: 'fields'; readonly errors: Record<string, string> }
  | { readonly kind: 'tokenError' }
  | { readonly kind: 'rateLimited' }
  | { readonly kind: 'serverError'; readonly message: string };

function classifyResetError(error: unknown): SubmitFailure {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return error.errors
        ? { kind: 'fields', errors: error.errors }
        : { kind: 'tokenError' };
    }
    if (error.status === 429) {
      return { kind: 'rateLimited' };
    }
  }
  return {
    kind: 'serverError',
    message: error instanceof Error ? error.message : t('errors.app.title')
  };
}

function InvalidLink() {
  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.reset_invalid_link')}</h1>
      <div className="auth-alert-error" role="alert">
        {t('auth.reset_invalid_link_text')}
      </div>
      <div className="auth-footer">
        <Link to="/forgot-password" className="auth-submit-button">
          {t('auth.reset_request_again')}
        </Link>
        <Link to="/login" className="auth-footer-link">
          {t('auth.has_account')}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [token] = useState<string | null>(extractAndSanitizeToken);

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>(
    {}
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFieldErrors(validateResetPasswordForm(password, repeatPassword));
    }, 250);

    return () => clearTimeout(timer);
  }, [password, repeatPassword]);

  const updateField = (field: FormField, value: string) => {
    if (field === 'password') setPassword(value);
    else setRepeatPassword(value);
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setTouched({ password: true, repeatPassword: true });

    const errors = validateResetPasswordForm(password, repeatPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!token) {
      setTokenError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, password, repeatPassword });
      setIsSuccess(true);
    } catch (error) {
      const failure = classifyResetError(error);
      if (failure.kind === 'fields') setFieldErrors(failure.errors);
      else if (failure.kind === 'tokenError') setTokenError(true);
      else if (failure.kind === 'rateLimited')
        setServerError(t('auth.rate_limit_notice'));
      else setServerError(failure.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || tokenError) {
    return <InvalidLink />;
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <h1 className="auth-title">{t('auth.reset_success')}</h1>
        <div className="auth-alert-success">{t('auth.reset_success_text')}</div>
        <div className="auth-footer">
          <Link to="/login" className="auth-submit-button">
            {t('auth.reset_go_to_login')}
          </Link>
        </div>
      </div>
    );
  }

  const passwordErrorText = touched.password
    ? resolveAuthErrorText(fieldErrors.password)
    : null;
  const repeatPasswordErrorText = touched.repeatPassword
    ? resolveAuthErrorText(fieldErrors.repeatPassword)
    : null;

  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.reset_title')}</h1>

      {serverError && (
        <div className="auth-alert-error" role="alert">
          {serverError}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        method="post"
        noValidate
      >
        <PasswordField
          id="reset-password"
          name="password"
          label={t('auth.reset_password')}
          value={password}
          onChange={(value) => updateField('password', value)}
          autoComplete="new-password"
          error={passwordErrorText}
        >
          <PasswordStrengthBar password={password} />
        </PasswordField>

        <PasswordField
          id="reset-repeat-password"
          name="repeatPassword"
          label={t('auth.reset_repeat_password')}
          value={repeatPassword}
          onChange={(value) => updateField('repeatPassword', value)}
          autoComplete="new-password"
          error={repeatPasswordErrorText}
        />

        <button
          type="submit"
          className="auth-submit-button"
          disabled={isSubmitting}
        >
          {t('auth.reset_submit')}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="auth-footer-link">
          {t('auth.has_account')}
        </Link>
      </div>
    </div>
  );
}
