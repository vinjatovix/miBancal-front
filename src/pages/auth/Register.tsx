import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent
} from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { GITHUB_CLIENT_ID, GOOGLE_CLIENT_ID } from '../../config/env';
import { t } from '../../i18n/core/t';
import { useAuth } from '../../shared/auth/useAuth';
import { validateRegisterForm } from '../../shared/auth/validation';
import { ApiError } from '../../shared/errors/ApiError';
import type { LoginNavigationState } from '../../types/auth';
import './authPages.css';
import './ssoButtons.css';
import GitHubAuthButton from './components/GitHubAuthButton';
import GoogleAuthButton from './components/GoogleAuthButton';
import PasswordField from './components/PasswordField';
import PasswordStrengthBar from './components/PasswordStrengthBar';
import RegisterSuccess from './components/RegisterSuccess';
import { resolveAuthErrorText } from './utils/authErrorText';
import { classifySsoError } from './utils/ssoError';

type FormField = 'email' | 'username' | 'password' | 'repeatPassword';

export default function Register() {
  const { isAuthenticated, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navState = location.state as LoginNavigationState | null;
  const initialSsoError = navState?.ssoError ?? navState?.error;

  const [formData, setFormData] = useState<Record<FormField, string>>({
    email: '',
    username: '',
    password: '',
    repeatPassword: ''
  });
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>(
    {}
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState<string | null>(
    () => initialSsoError ?? null
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = Object.keys(validateRegisterForm(formData)).length === 0;

  const purgedRef = useRef(false);
  useEffect(() => {
    if (!purgedRef.current && (navState?.ssoError || navState?.error)) {
      purgedRef.current = true;
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, navState, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFieldErrors(validateRegisterForm(formData));
    }, 250);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setGeneralError(null);
      setSsoError(null);
      try {
        await googleLogin({ idToken });
        navigate('/', { replace: true });
      } catch (error) {
        setSsoError(classifySsoError(error, 'google'));
      }
    },
    [googleLogin, navigate]
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const updateField = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const markTouched = (field: FormField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setGeneralError(null);
    setSsoError(null);

    const errors = validateRegisterForm(formData);
    setFieldErrors(errors);
    setTouched({
      email: true,
      username: true,
      password: true,
      repeatPassword: true
    });

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const id = crypto.randomUUID();
      await register({ id, ...formData });
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setFieldErrors((prev) => ({ ...prev, username: 'taken' }));
          return;
        }
        if (error.status === 429) {
          setGeneralError(t('auth.rate_limit_notice'));
          return;
        }
      }
      setGeneralError(
        error instanceof Error ? error.message : t('errors.app.title')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldErrorText = (field: FormField): string | null => {
    if (!touched[field]) return null;
    const errorKey = fieldErrors[field];
    if (field === 'password' && errorKey !== 'required') return null;
    if (errorKey === 'required' && formData[field].trim() !== '') return null;
    return resolveAuthErrorText(errorKey);
  };

  const renderFieldError = (field: FormField) => {
    const errorText = getFieldErrorText(field);
    return errorText ? (
      <span className="auth-error-text">{errorText}</span>
    ) : null;
  };

  if (isSubmitted) {
    return <RegisterSuccess />;
  }

  const hasSso = Boolean(GOOGLE_CLIENT_ID || GITHUB_CLIENT_ID);

  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.register')}</h1>

      {generalError && (
        <div className="auth-alert-error" role="alert">
          {generalError}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        method="post"
        noValidate
      >
        <div className="auth-field">
          <label htmlFor="reg-email" className="auth-label">
            {t('auth.email')}
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => markTouched('email')}
            className={`auth-input ${getFieldErrorText('email') ? 'auth-input-error' : ''}`}
            autoComplete="email"
            inputMode="email"
          />
          {renderFieldError('email')}
        </div>

        <div className="auth-field">
          <label htmlFor="reg-username" className="auth-label">
            {t('auth.username')}
          </label>
          <input
            id="reg-username"
            name="username"
            type="text"
            value={formData.username}
            onChange={(e) => updateField('username', e.target.value)}
            onBlur={() => markTouched('username')}
            className={`auth-input ${getFieldErrorText('username') ? 'auth-input-error' : ''}`}
            autoComplete="nickname"
          />
          {renderFieldError('username')}
        </div>

        <PasswordField
          id="reg-password"
          name="password"
          label={t('auth.password')}
          value={formData.password}
          onChange={(value) => updateField('password', value)}
          onBlur={() => markTouched('password')}
          autoComplete="new-password"
          error={getFieldErrorText('password')}
        >
          <PasswordStrengthBar password={formData.password} />
          <span className="auth-field-hint">
            {t('auth.password_requirements')}
          </span>
        </PasswordField>

        <PasswordField
          id="reg-repeat-password"
          name="repeatPassword"
          label={t('auth.repeat_password')}
          value={formData.repeatPassword}
          onChange={(value) => updateField('repeatPassword', value)}
          onBlur={() => markTouched('repeatPassword')}
          autoComplete="new-password"
          error={getFieldErrorText('repeatPassword')}
        />

        <button
          type="submit"
          className="auth-submit-button"
          disabled={!isFormValid || isSubmitting}
        >
          {t('auth.register_submit')}
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
              setGeneralError(null);
              setSsoError(null);
            }}
          >
            <GoogleAuthButton
              onCredential={handleGoogleCredential}
              disabled={isSubmitting}
            />
            <GitHubAuthButton disabled={isSubmitting} />
          </div>
        </>
      )}

      {ssoError && (
        <div className="auth-alert-error auth-sso-alert-error" role="alert">
          <div>{ssoError}</div>
        </div>
      )}

      <div className="auth-footer">
        <Link to="/login" className="auth-footer-link">
          {t('auth.has_account')}
        </Link>
      </div>
    </div>
  );
}
