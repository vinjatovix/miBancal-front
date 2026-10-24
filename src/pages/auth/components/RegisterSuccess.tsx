import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';

export default function RegisterSuccess() {
  return (
    <div className="auth-container">
      <h1 className="auth-title">{t('auth.register_success')}</h1>
      <div className="auth-alert-success">
        {t('auth.register_success_text')}
      </div>
      <div className="auth-footer">
        <Link to="/login" className="auth-footer-link">
          {t('auth.has_account')}
        </Link>
      </div>
    </div>
  );
}
