import { Link } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import Icon from '../../shared/components/Icon/Icon';

import './insufficientPermissionsPage.css';

export default function InsufficientPermissionsPage() {
  return (
    <div className="insufficient-permissions">
      <Icon name="lock" decorative />
      <h1 className="insufficient-permissions__title">
        {t('auth.insufficient_permissions.title')}
      </h1>
      <p className="insufficient-permissions__message">
        {t('auth.insufficient_permissions.message')}
      </p>
      <div className="insufficient-permissions__actions">
        <Link to="/plants" className="insufficient-permissions__link">
          {t('auth.insufficient_permissions.back_to_plants')}
        </Link>
        <Link to="/families" className="insufficient-permissions__link">
          {t('auth.insufficient_permissions.back_to_families')}
        </Link>
        <Link to="/anomalies" className="insufficient-permissions__link">
          {t('auth.insufficient_permissions.back_to_anomalies')}
        </Link>
      </div>
    </div>
  );
}
