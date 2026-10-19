import { useState } from 'react';
import Icon from '../../../shared/components/Icon/Icon';
import { t } from '../../../i18n/core/t';
import type { UserRole } from '../../../types/auth';

interface Props {
  readonly roles: readonly UserRole[];
  readonly onSave: (roles: UserRole[]) => void;
}

export function RoleManagementForm({ roles, onSave }: Props) {
  const [isAdmin, setIsAdmin] = useState(() => roles.includes('admin'));
  const [isCollaborator, setIsCollaborator] = useState(() =>
    roles.includes('collaborator')
  );

  const isDirty =
    isAdmin !== roles.includes('admin') ||
    isCollaborator !== roles.includes('collaborator');

  const handleToggleAdmin = () => {
    setIsAdmin((prev) => !prev);
  };

  const handleToggleCollaborator = () => {
    setIsCollaborator((prev) => !prev);
  };

  const handleReset = () => {
    setIsAdmin(roles.includes('admin'));
    setIsCollaborator(roles.includes('collaborator'));
  };

  const handleSave = () => {
    const nextRoles: UserRole[] = ['user'];
    if (isAdmin) {
      nextRoles.push('admin');
    }
    if (isCollaborator) {
      nextRoles.push('collaborator');
    }
    onSave(nextRoles);
  };

  return (
    <section className="admin-roles-card">
      <div className="admin-roles-header">
        <div className="admin-roles-header-left">
          <span className="admin-roles-tag">
            {t('admin.roles_access_management')}
          </span>
          <div className="admin-roles-title-bar">
            <h2 className="admin-roles-title">
              {t('admin.roles_matrix_title')}
            </h2>
          </div>
          <p className="admin-roles-desc">{t('admin.roles_matrix_desc')}</p>
        </div>
      </div>

      <div className="admin-roles-list">
        <label
          htmlFor="chkAdminRole"
          className={`admin-role-toggle-item ${isAdmin ? 'admin-role-toggle-item--active' : ''}`}
        >
          <div className="admin-role-toggle-left">
            <div className="admin-role-toggle-icon">
              <Icon name="admin_panel_settings" decorative />
            </div>
            <div className="admin-role-toggle-texts">
              <div className="admin-role-title-row">
                <span className="admin-role-toggle-name">
                  {t('admin.role_admin_title')}
                </span>
                <span className="admin-role-code-tag admin-role-code-tag--admin">
                  {t('admin.role_admin_code')}
                </span>
              </div>
              <p className="admin-role-toggle-description">
                {t('admin.role_admin_desc')}
              </p>
            </div>
          </div>

          <div className="admin-switch-container">
            <input
              id="chkAdminRole"
              type="checkbox"
              checked={isAdmin}
              onChange={handleToggleAdmin}
              className="admin-switch-input"
            />
            <span
              className={`admin-switch-track ${isAdmin ? 'admin-switch-track--checked' : ''}`}
            >
              <span
                className={`admin-switch-thumb ${isAdmin ? 'admin-switch-thumb--checked' : ''}`}
              />
            </span>
          </div>
        </label>

        <label
          htmlFor="chkCollaboratorRole"
          className={`admin-role-toggle-item admin-role-toggle-item--collab ${isCollaborator ? 'admin-role-toggle-item--active' : ''}`}
        >
          <div className="admin-role-toggle-left">
            <div className="admin-role-toggle-icon admin-role-toggle-icon--collab">
              <Icon name="eco" decorative />
            </div>
            <div className="admin-role-toggle-texts">
              <div className="admin-role-title-row">
                <span className="admin-role-toggle-name">
                  {t('admin.role_collab_title')}
                </span>
                <span className="admin-role-code-tag admin-role-code-tag--collab">
                  {t('admin.role_collab_code')}
                </span>
              </div>
              <p className="admin-role-toggle-description">
                {t('admin.role_collab_desc')}
              </p>
            </div>
          </div>

          <div className="admin-switch-container">
            <input
              id="chkCollaboratorRole"
              type="checkbox"
              checked={isCollaborator}
              onChange={handleToggleCollaborator}
              className="admin-switch-input"
            />
            <span
              className={`admin-switch-track ${isCollaborator ? 'admin-switch-track--checked' : ''}`}
            >
              <span
                className={`admin-switch-thumb ${isCollaborator ? 'admin-switch-thumb--checked' : ''}`}
              />
            </span>
          </div>
        </label>
      </div>

      <div
        className={`admin-tracker-box ${isDirty ? 'admin-tracker-box--pending' : ''}`}
      >
        <div className="admin-tracker-info">
          <span className="admin-tracker-icon">
            <Icon name="pending_actions" decorative />
          </span>
          <div className="admin-tracker-texts">
            <span className="admin-tracker-title">
              {isDirty
                ? t('admin.roles_pending_changes')
                : t('admin.roles_no_pending_changes')}
            </span>
          </div>
        </div>
        <span
          className={`admin-tracker-pill ${isDirty ? 'admin-tracker-pill--pending' : ''}`}
        >
          {isDirty
            ? t('admin.roles_status_pending')
            : t('admin.roles_status_stable')}
        </span>
      </div>

      <div className="admin-roles-actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className="admin-btn-primary admin-roles-save-btn"
        >
          <Icon name="save" decorative />
          <span>{t('admin.save_changes_button')}</span>
        </button>
        {isDirty && (
          <button
            type="button"
            onClick={handleReset}
            className="admin-btn-secondary admin-roles-reset-btn"
          >
            {t('admin.roles_reset_button')}
          </button>
        )}
      </div>
    </section>
  );
}
