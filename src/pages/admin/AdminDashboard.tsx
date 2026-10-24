import { useState, useEffect } from 'react';
import { useUserRolesManagement } from './hooks/useUserRolesManagement';
import { UserSearchForm } from './components/UserSearchForm';
import { UserDetailsCard } from './components/UserDetailsCard';
import { RoleManagementForm } from './components/RoleManagementForm';
import { RoleChangeConfirmModal } from './components/RoleChangeConfirmModal';
import { getParsedErrorMessage } from '../../shared/errors/parseApiError';
import Icon from '../../shared/components/Icon/Icon';
import { t } from '../../i18n/core/t';
import type { UserRole } from '../../types/auth';
import './adminDashboard.css';

export default function AdminDashboard() {
  const {
    search,
    user,
    isLoading,
    error,
    isModalOpen,
    setIsModalOpen,
    saveRoles,
    successMessage
  } = useUserRolesManagement();

  const [targetRoles, setTargetRoles] = useState<UserRole[]>([]);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [dismissedSuccess, setDismissedSuccess] = useState<string | null>(null);

  const errorMessage = error ? getParsedErrorMessage(error) : null;
  const username = user?.username || '';

  const activeError =
    errorMessage && dismissedError !== errorMessage ? errorMessage : null;

  const successToastVisible = Boolean(
    successMessage && dismissedSuccess !== successMessage
  );

  useEffect(() => {
    if (!successToastVisible || !successMessage) return;
    const timer = setTimeout(() => {
      setDismissedSuccess(successMessage);
    }, 4000);
    return () => clearTimeout(timer);
  }, [successToastVisible, successMessage]);

  const handleSearch = (term: string) => {
    setDismissedError(null);
    search(term);
  };

  const handleOpenModal = (roles: UserRole[]) => {
    setDismissedError(null);
    setTargetRoles(roles);
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = () => {
    setDismissedError(null);
    saveRoles(targetRoles);
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div className="admin-header-badge">
          <Icon name="admin_panel_settings" decorative />
          <span>{t('admin.control_module_badge')}</span>
        </div>
        <h1 className="admin-page-title">{t('admin.heading')}</h1>
        <p className="admin-page-subtitle">{t('admin.subtitle')}</p>
      </header>

      <div className="admin-workspace-grid">
        <div className="admin-col-main">
          <section className="admin-card admin-search-section">
            <UserSearchForm onSearch={handleSearch} isLoading={isLoading} />
          </section>

          {user && (
            <section className="admin-card admin-user-section">
              <UserDetailsCard user={user} />
            </section>
          )}
        </div>

        {user && (
          <div className="admin-col-side">
            <section className="admin-card admin-roles-section">
              <RoleManagementForm
                key={`${user.id}-${user.roles.join(',')}`}
                roles={user.roles}
                onSave={handleOpenModal}
              />
            </section>
          </div>
        )}
      </div>

      <RoleChangeConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setIsModalOpen(false)}
        username={username}
        currentRoles={user?.roles ?? ['user']}
        targetRoles={targetRoles}
        isLoading={isLoading}
      />

      {successToastVisible && (
        <div
          className="admin-toast-notification admin-toast-notification--success"
          role="status"
        >
          <span className="admin-toast-icon admin-toast-icon--success">
            <Icon name="tick" decorative />
          </span>
          <div className="admin-toast-texts">
            <span className="admin-toast-title">
              {t('admin.toast_success_title')}
            </span>
            <span className="admin-toast-subtitle">
              {t('admin.role_change_success_message')}
            </span>
          </div>
        </div>
      )}

      {activeError && (
        <div
          className="admin-toast-notification admin-toast-notification--error"
          role="alert"
        >
          <span className="admin-toast-icon admin-toast-icon--error">
            <Icon name="warning" decorative />
          </span>
          <div className="admin-toast-texts">
            <span className="admin-toast-title">
              {t('admin.toast_error_title')}
            </span>
            <span className="admin-toast-subtitle">{activeError}</span>
          </div>
          <button
            type="button"
            className="admin-toast-close"
            onClick={() => setDismissedError(activeError)}
            aria-label={t('admin.modal_close')}
          >
            <Icon name="close" decorative />
          </button>
        </div>
      )}
    </div>
  );
}
