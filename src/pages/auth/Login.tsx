import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent
} from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from '../../config/env';
import { t } from '../../i18n/core/t';
import { useAuth } from '../../shared/auth/useAuth';
import { validateLoginForm } from '../../shared/auth/validation';
import { ApiError } from '../../shared/errors/ApiError';
import { useToast } from '../../shared/toast/useToast';
import type { LoginNavigationState } from '../../types/auth';
import './authPages.css';
import GoogleAuthButton from './components/GoogleAuthButton';
import PasswordField from './components/PasswordField';
import './ssoButtons.css';
import GitHubAuthButton from './components/GitHubAuthButton';
import { resolveAuthErrorText } from './utils/authErrorText';
import { resolveRedirectDestination } from './utils/destination';
import { classifySsoError } from './utils/ssoError';

export default function Login() {
  const { isAuthenticated, login, googleLogin, isLoading } = useAuth();
  const { dismissAll, showErrorToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const navState = location.state as LoginNavigationState | null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const destination = resolveRedirectDestination(location.state);

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      dismissAll();
      try {
        await googleLogin({ idToken });
        navigate(destination, { replace: true });
      } catch (error) {
        showErrorToast(classifySsoError(error, 'google'));
      }
    },
    [googleLogin, destination, navigate, dismissAll, showErrorToast]
  );

  const purgedRef = useRef(false);
  useEffect(() => {
    const ssoErr = navState?.ssoError ?? navState?.error;
    if (!purgedRef.current && ssoErr) {
      purgedRef.current = true;
      showErrorToast(ssoErr);
      navigate(location.pathname, {
        replace: true,
        state: { from: navState?.from }
      });
    }
  }, [location.pathname, navState, navigate, showErrorToast]);

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    dismissAll();

    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login({ email, password });
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showErrorToast({
          title: t('auth.invalid_credentials'),
          message: t('auth.unverified_account_notice')
        });
        return;
      }
      showErrorToast(error);
    }
  };

  const emailErrorText = resolveAuthErrorText(fieldErrors.email);
  const passwordErrorText = resolveAuthErrorText(fieldErrors.password);

  const hasSso = Boolean(GOOGLE_CLIENT_ID || GITHUB_CLIENT_ID);

  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.login')}</h1>

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        method="post"
        noValidate
      >
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">
            {t('auth.email')}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`auth-input ${fieldErrors.email ? 'auth-input-error' : ''}`}
            autoComplete="email"
            inputMode="email"
          />
          {emailErrorText && (
            <span className="auth-error-text">{emailErrorText}</span>
          )}
        </div>

        <PasswordField
          id="login-password"
          name="password"
          label={t('auth.password')}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={passwordErrorText}
          labelRight={
            <Link to="/forgot-password" className="auth-label-row-link">
              {t('auth.forgot_link')}
            </Link>
          }
        />

        <button
          type="submit"
          className="auth-submit-button"
          disabled={isLoading}
        >
          {t('auth.login_submit')}
        </button>
      </form>

      {hasSso && (
        <>
          <div className="auth-sso-separator">
            <span>{t('auth.sso_separator')}</span>
          </div>
          <div
            className="auth-sso-buttons"
            onClick={() => {
              dismissAll();
            }}
          >
            <GoogleAuthButton
              onCredential={handleGoogleCredential}
              disabled={isLoading}
            />
            <GitHubAuthButton disabled={isLoading} />
          </div>
        </>
      )}

      <div className="auth-footer">
        <Link to="/register" className="auth-footer-link">
          {t('auth.no_account')}
        </Link>
      </div>
    </div>
  );
}
