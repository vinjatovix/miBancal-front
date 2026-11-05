import type { ReactNode } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';
import Modal, { type ModalVariant } from './Modal';

import './confirmModal.css';

export interface ConfirmModalProps {
  readonly isOpen: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly prompt?: ReactNode;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly confirmIcon?: IconName;
  readonly variant?: ModalVariant;
  readonly icon?: IconName;
  readonly isLoading?: boolean;
  readonly loadingText?: string;
  readonly warningText?: string;
  readonly children?: ReactNode;
  readonly role?: 'dialog' | 'alertdialog';
  readonly maxWidth?: string;
  readonly className?: string;
}

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  subtitle,
  prompt,
  confirmText,
  cancelText,
  confirmIcon,
  variant = 'default',
  icon,
  isLoading = false,
  loadingText,
  warningText,
  children,
  role = 'dialog',
  maxWidth,
  className
}: ConfirmModalProps) {
  const resolvedIcon =
    icon ??
    (variant === 'danger'
      ? 'delete'
      : variant === 'warning'
        ? 'warning'
        : undefined);

  const resolvedConfirmText = isLoading
    ? (loadingText ??
      (variant === 'danger' ? t('common.deleting') : t('common.saving')))
    : (confirmText ?? t('common.modal.confirm'));

  const resolvedCancelText = cancelText ?? t('common.cancel');

  const footer = (
    <div className="confirm-modal-actions">
      <button
        type="button"
        className="modal-btn modal-btn--cancel"
        onClick={onCancel}
        disabled={isLoading}
      >
        {resolvedCancelText}
      </button>
      <button
        type="button"
        className={`modal-btn modal-btn--confirm modal-btn--${variant}`}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {confirmIcon && <Icon name={confirmIcon} decorative />}
        <span>{resolvedConfirmText}</span>
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onCancel}
      title={title}
      subtitle={subtitle}
      icon={resolvedIcon}
      variant={variant}
      footer={footer}
      preventClose={isLoading}
      role={role}
      maxWidth={maxWidth}
      className={className}
    >
      <div className="confirm-modal-body">
        {prompt && <p className="confirm-modal-prompt">{prompt}</p>}

        {warningText && (
          <div
            className={`confirm-modal-warning ${
              variant === 'danger' ? 'confirm-modal-warning--danger' : ''
            }`}
          >
            <div className="confirm-modal-warning-icon">
              <Icon name="warning" decorative />
            </div>
            <p className="confirm-modal-warning-text">{warningText}</p>
          </div>
        )}

        {children}
      </div>
    </Modal>
  );
}
