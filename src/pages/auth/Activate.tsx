import { useState } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { extractAndSanitizeToken } from '../../shared/auth/tokenUrl';
import { useAuth } from '../../shared/auth/useAuth';
import { ApiError } from '../../shared/errors/ApiError';
import './authPages.css';

export default function Activate() {
  const { activate } = useAuth();
  const [token] = useState<string | null>(extractAndSanitizeToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await activate({ token });
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setErrorMessage(t('auth.rate_limit_notice'));
        return;
      }
      setErrorMessage(t('auth.activate_error_text'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <h1 className="auth-title">{t('auth.activate_success')}</h1>
        <div className="auth-alert-success">
          {t('auth.activate_success_text')}
        </div>
        <div className="auth-footer">
          <Link to="/login" className="auth-submit-button">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (!token || errorMessage) {
    return (
      <div className="auth-container">
        <h1 className="auth-title">{t('auth.activate_error')}</h1>
        <div className="auth-alert-error" role="alert">
          {errorMessage ?? t('auth.activate_error_text')}
        </div>
        <div className="auth-footer">
          <Link to="/login" className="auth-footer-link">
            {t('auth.has_account')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.activate_title')}</h1>
      <p className="auth-notice">{t('auth.activate_ready_text')}</p>

      <button
        type="button"
        className="auth-submit-button"
        onClick={handleActivate}
        disabled={isSubmitting}
      >
        {t('auth.activate_submit')}
      </button>

      <div className="auth-footer">
        <Link to="/login" className="auth-footer-link">
          {t('auth.has_account')}
        </Link>
      </div>
    </div>
  );
}
