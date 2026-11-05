import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';

import './notFound.css';

type NotFoundProps = {
  readonly titleKey: I18nKey;
  readonly messageKey: I18nKey;
  readonly backTo: string;
  readonly backLabelKey: I18nKey;
};

export function NotFound({
  titleKey,
  messageKey,
  backTo,
  backLabelKey
}: NotFoundProps) {
  return (
    <div className="not-found">
      <h1 className="not-found__title">{t(titleKey)}</h1>
      <p role="status" className="not-found__message">
        {t(messageKey)}
      </p>
      <Link to={backTo} className="not-found__back">
        {t(backLabelKey)}
      </Link>
    </div>
  );
}
