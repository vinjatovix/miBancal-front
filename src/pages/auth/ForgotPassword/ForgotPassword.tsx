import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { useAuth } from '../../../shared/auth/useAuth';
import { validateEmail } from '../../../shared/auth/validation';
import { ApiError } from '../../../shared/errors/ApiError';
import '../authPages.css';
import { resolveAuthErrorText } from '../utils/authErrorText';

export default function ForgotPassword() {
  const { isAuthenticated, forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }
    setFieldError(null);

    setIsSubmitting(true);
    try {
      await forgotPassword({ email });
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 && error.errors?.email) {
          setFieldError(error.errors.email);
          return;
        }
        if (error.status === 429) {
          setServerError(t('auth.rate_limit_notice'));
          return;
        }
      }
      setServerError(
        error instanceof Error ? error.message : t('errors.app.title')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <h1 className="auth-title">{t('auth.forgot_title')}</h1>
        <div className="auth-alert-success">
          {t('auth.forgot_uniform_notice')}
        </div>
        <div className="auth-footer">
          <Link to="/login" className="auth-footer-link">
            {t('auth.has_account')}
          </Link>
        </div>
      </div>
    );
  }

  const emailErrorText = resolveAuthErrorText(fieldError ?? undefined);

  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.forgot_title')}</h1>

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
        <div className="auth-field">
          <label htmlFor="forgot-email" className="auth-label">
            {t('auth.forgot_email')}
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`auth-input ${fieldError ? 'auth-input-error' : ''}`}
            autoComplete="email"
            inputMode="email"
          />
          {emailErrorText && (
            <span className="auth-error-text">{emailErrorText}</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-submit-button"
          disabled={isSubmitting}
        >
          {t('auth.forgot_submit')}
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
