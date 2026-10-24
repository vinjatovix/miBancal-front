import { useState } from 'react';
import Icon from '../../../shared/components/Icon/Icon';
import { t } from '../../../i18n/core/t';
import type { UserLookupView } from '../../../types/users';

interface Props {
  readonly user: UserLookupView;
}

export function UserDetailsCard({ user }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article aria-labelledby="user-details-title" className="admin-user-card">
      <div className="admin-user-card-header">
        <h2 id="user-details-title" className="admin-user-card-title">
          <Icon name="person" decorative />
          <span>{t('admin.account_card_title')}</span>
        </h2>
      </div>

      <div className="admin-user-profile-row">
        <div className="admin-user-profile-info">
          <h3 className="admin-user-username">{user.username}</h3>
        </div>
      </div>

      <div className="admin-details-box">
        <div className="admin-detail-row">
          <div className="admin-detail-left">
            <div className="admin-detail-texts">
              <span className="admin-detail-label">
                <Icon name="label" decorative />
                <span>{t('admin.field_id')}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyId}
            className="admin-btn-copy"
            aria-label={t('admin.copy_id_aria')}
            title={t('admin.copy_id_aria')}
          >
            <Icon name="content_copy" decorative />
            <span>{copied ? t('admin.copied_id') : t('admin.copy_id')}</span>
          </button>
        </div>

        <div className="admin-detail-row">
          <div className="admin-detail-left">
            <div className="admin-detail-texts">
              <span className="admin-detail-label">
                <Icon name="mail" decorative />
                <span>{t('admin.field_email')}</span>
              </span>
              <span className="admin-detail-value">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="admin-detail-row admin-detail-row--roles">
          <div className="admin-detail-left">
            <div className="admin-detail-texts">
              <span className="admin-detail-label">
                <Icon name="shield" decorative />
                <span>{t('admin.field_roles')}</span>
              </span>
              <div className="admin-roles-tag-list">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={`admin-role-tag admin-role-tag--${role}`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
