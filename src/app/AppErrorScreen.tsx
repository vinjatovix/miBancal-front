import { t } from '../i18n/core/t';

import './appErrorScreen.css';

function reloadApp() {
  window.location.reload();
}

export function AppErrorScreen() {
  return (
    <div className="app-error">
      <h1 className="app-error__title">{t('errors.app.title')}</h1>
      <p role="alert" className="app-error__message">
        {t('errors.app.message')}
      </p>
      <div className="app-error__actions">
        <button type="button" className="app-error__reload" onClick={reloadApp}>
          {t('errors.actions.reload')}
        </button>
        <a href="/" className="app-error__home">
          {t('errors.actions.goHome')}
        </a>
      </div>
    </div>
  );
}
