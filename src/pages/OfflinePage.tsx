import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../i18n/core/t';

import './offlinePage.css';

export default function OfflinePage(): ReactElement {
  return (
    <div className="offline-page">
      <h1 className="offline-page__title">{t('offline.title')}</h1>
      <output className="offline-page__message">{t('offline.message')}</output>
      <Link to="/plants" className="offline-page__link">
        {t('offline.link')}
      </Link>
    </div>
  );
}
