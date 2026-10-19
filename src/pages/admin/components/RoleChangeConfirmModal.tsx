import { useEffect, useRef } from 'react';
import Icon from '../../../shared/components/Icon/Icon';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { t } from '../../../i18n/core/t';
import { calculateRolesDelta } from '../utils/calculateRolesDelta';
import type { UserRole } from '../../../types/auth';
import type { ManageableRole } from '../../../types/users';

const ROLE_ORDER: Record<UserRole, number> = {
  admin: 1,
  collaborator: 2,
  user: 3
};

const sortRoles = (roles: readonly UserRole[]): UserRole[] => {
  return [...new Set(roles)].sort(
    (a, b) => (ROLE_ORDER[a] ?? 99) - (ROLE_ORDER[b] ?? 99)
  );
};

interface Props {
  readonly isOpen: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly username: string;
  readonly currentRoles?: readonly UserRole[];
  readonly targetRoles?: readonly UserRole[];
  readonly action?: 'grant' | 'revoke';
  readonly role?: ManageableRole;
  readonly isLoading?: boolean;
}

export function RoleChangeConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  username,
  currentRoles,
  targetRoles,
  action,
  role,
  isLoading = false
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, dialogRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  const resolvedCurrent = sortRoles(
    currentRoles ?? (action === 'revoke' ? ['user', role ?? 'admin'] : ['user'])
  );
  const resolvedTarget = sortRoles(
    targetRoles ?? (action === 'grant' ? ['user', role ?? 'admin'] : ['user'])
  );

  const delta = calculateRolesDelta(resolvedCurrent, resolvedTarget);
  const isGrantAdmin = Boolean(delta.add?.includes('admin'));
  const isRevokeAdmin = Boolean(delta.remove?.includes('admin'));
  const isGrantCollab = Boolean(delta.add?.includes('collaborator'));
  const isRevokeCollab = Boolean(delta.remove?.includes('collaborator'));

  const roleLabel = (r: UserRole) => {
    if (r === 'admin') return t('admin.role_admin_label_with_code');
    if (r === 'collaborator') return t('admin.role_collab_label_with_code');
    return t('admin.role_user_label_with_code');
  };

  const promptText = () => {
    if (isGrantAdmin && !isRevokeAdmin && !isRevokeCollab) {
      return t('admin.confirm_modal_grant_desc', { username });
    }
    if (isRevokeAdmin && !isGrantAdmin && !isGrantCollab) {
      return t('admin.confirm_modal_revoke_desc', { username });
    }
    if (isGrantCollab && !isRevokeCollab && !isRevokeAdmin) {
      return t('admin.confirm_modal_grant_collab_desc', { username });
    }
    if (isRevokeCollab && !isGrantCollab && !isGrantAdmin) {
      return t('admin.confirm_modal_revoke_collab_desc', { username });
    }
    return t('admin.confirm_modal_modify_roles_desc', { username });
  };

  const warningText = () => {
    if (isGrantAdmin) {
      return t('admin.modal_security_warning_grant');
    }
    if (isRevokeAdmin) {
      return t('admin.modal_security_warning_revoke');
    }
    if (isGrantCollab) {
      return t('admin.modal_security_warning_grant_collab');
    }
    if (isRevokeCollab) {
      return t('admin.modal_security_warning_revoke_collab');
    }
    return t('admin.modal_security_warning_modify');
  };

  const modalIcon =
    isGrantAdmin || isRevokeAdmin ? 'admin_panel_settings' : 'eco';

  return (
    <div
      className="admin-modal-overlay"
      onClick={isLoading ? undefined : onCancel}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-accent" />

        <div className="admin-modal-header">
          <div className="admin-modal-header-left">
            <div className="admin-modal-shield">
              <Icon name={modalIcon} decorative />
            </div>
            <div>
              <span className="admin-modal-subtitle">
                {t('admin.modal_security_review')}
              </span>
              <h2 id="modal-title" className="admin-modal-title">
                {t('admin.confirm_modal_title')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onCancel}
            aria-label={t('admin.modal_close')}
            disabled={isLoading}
          >
            <Icon name="close" decorative />
          </button>
        </div>

        <div className="admin-modal-body">
          <p className="admin-modal-prompt">{promptText()}</p>

          <div className="admin-modal-comparison">
            <div className="admin-modal-comparison-header">
              <span className="admin-modal-comparison-tag">
                {t('admin.modal_privilege_transition')}
              </span>
            </div>
            <div className="admin-modal-comparison-box">
              <span className="admin-modal-role-label admin-modal-role-label--current">
                {t('admin.modal_current_role')}
              </span>
              <div className="admin-modal-roles-list admin-modal-roles-list--current">
                {resolvedCurrent.map((r) => (
                  <span
                    key={r}
                    className={`admin-modal-role-pill admin-modal-role-pill--current-slot admin-modal-role-pill--${r}`}
                  >
                    {roleLabel(r)}
                  </span>
                ))}
              </div>

              <div className="admin-modal-arrow">
                <Icon name="arrow_forward" decorative />
              </div>

              <span className="admin-modal-role-label admin-modal-role-label--target">
                {t('admin.modal_requested_role')}
              </span>
              <div className="admin-modal-roles-list admin-modal-roles-list--target">
                {resolvedTarget.map((r) => (
                  <span
                    key={r}
                    className={`admin-modal-role-pill admin-modal-role-pill--target-slot admin-modal-role-pill--${r}`}
                  >
                    {roleLabel(r)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-modal-warning">
            <div className="admin-modal-warning-icon">
              <Icon name="warning" decorative />
            </div>
            <p className="admin-modal-warning-text">
              <strong>{t('admin.modal_security_warning_title')}</strong>{' '}
              {warningText()}
            </p>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-btn-secondary admin-modal-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('admin.cancel_button')}
          </button>
          <button
            type="button"
            className="admin-btn-primary admin-modal-confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            <Icon name={modalIcon} decorative />
            <span>{t('admin.confirm_button')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
