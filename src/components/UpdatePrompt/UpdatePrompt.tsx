import type { ReactElement } from 'react';

import { t } from '../../i18n/core/t';
import { useSWUpdate } from '../../shared/sw/registration';

import './updatePrompt.css';

export default function UpdatePrompt(): ReactElement | null {
  const { needRefresh, updateServiceWorker } = useSWUpdate();

  if (!needRefresh) {
    return null;
  }

  const handleUpdate = () => {
    void updateServiceWorker(true);
  };

  return (
    <div className="update-prompt" role="alert">
      <span className="update-prompt__message">{t('sw.update.title')}</span>
      <button
        type="button"
        className="update-prompt__button"
        onClick={handleUpdate}
      >
        {t('sw.update.action')}
      </button>
    </div>
  );
}
