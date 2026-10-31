import { IS_DEV } from '../../../config/env';
import { t } from '../../../i18n/core/t';
import './devBanner.css';

export default function DevBanner() {
  if (!IS_DEV) {
    return null;
  }

  return (
    <aside className="dev-banner" aria-label={t('common.env_dev')}>
      <span>{t('common.env_dev')}</span>
    </aside>
  );
}
