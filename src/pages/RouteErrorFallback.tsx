import { useEffect } from 'react';
import { Link, useRouteError } from 'react-router-dom';

import { t } from '../i18n/core/t';
import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from '../shared/observability/reportUnexpectedError';

import './routeErrorFallback.css';

export default function RouteErrorFallback() {
  const error = useRouteError();

  useEffect(() => {
    reportUnexpectedError(
      toUnexpectedErrorReport(error, { kind: 'render', section: 'page' }),
      error
    );
  }, [error]);

  return (
    <div className="route-error">
      <h1 className="route-error__title">{t('errors.page.title')}</h1>
      <p role="alert" className="route-error__message">
        {t('errors.page.message')}
      </p>
      <Link to="/" className="route-error__action">
        {t('errors.actions.goHome')}
      </Link>
    </div>
  );
}
