import { useEffect, useState } from 'react';
import { t } from '../../i18n/core/t';
import Icon from '../../shared/components/Icon/Icon';
import { useToast } from '../../shared/toast/useToast';
import type { UserRole } from '../../types/auth';
import { RoleChangeConfirmModal } from './components/RoleChangeConfirmModal';
import { RoleManagementForm } from './components/RoleManagementForm';
import { UserDetailsCard } from './components/UserDetailsCard';
import { UserSearchForm } from './components/UserSearchForm';
import { useUserRolesManagement } from './hooks/useUserRolesManagement';
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
  const { showToast, showErrorToast, dismissAll } = useToast();

  const [targetRoles, setTargetRoles] = useState<UserRole[]>([]);
  const [submitCount, setSubmitCount] = useState(0);
  const username = user?.username || '';

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error, submitCount, showErrorToast]);

  useEffect(() => {
    if (successMessage) {
      showToast({
        title: t('admin.toast_success_title'),
        message: t('admin.role_change_success_message'),
        variant: 'success',
        duration: 4000
      });
    }
  }, [successMessage, showToast]);

  const handleSearch = (term: string) => {
    dismissAll();
    search(term);
  };

  const handleOpenModal = (roles: UserRole[]) => {
    dismissAll();
    setTargetRoles(roles);
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = () => {
    dismissAll();
    setSubmitCount((c) => c + 1);
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
    </div>
  );
}
