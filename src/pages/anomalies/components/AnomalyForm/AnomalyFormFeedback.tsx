import { Link, useLocation } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';

interface Props {
  readonly generalError: string | null;
  readonly validationSummary: string | null;
  readonly isSessionExpired: boolean;
}

export function AnomalyFormFeedback({
  generalError,
  validationSummary,
  isSessionExpired
}: Props) {
  const location = useLocation();

  return (
    <>
      {isSessionExpired && (
        <div role="alert" className="anomaly-form__conflict-banner">
          <p>{t('anomaly.form.session_expired')}</p>
          <Link to="/login" state={{ from: location }}>
            {t('anomaly.form.login_again')}
          </Link>
        </div>
      )}
      {generalError && (
        <div role="alert" className="anomaly-form__error">
          {generalError}
        </div>
      )}
      {validationSummary && (
        <div role="alert" className="anomaly-form__validation-summary">
          {validationSummary}
        </div>
      )}
    </>
  );
}
