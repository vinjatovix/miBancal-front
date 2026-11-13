import type { ReactNode } from 'react';

import { t } from '../../../i18n/core/t';
import { ConfirmModal } from './ConfirmModal';

export interface CancelConfirmModalProps {
  readonly isOpen: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly prompt?: ReactNode;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly className?: string;
}

export function CancelConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  subtitle,
  prompt,
  confirmText,
  cancelText,
  className
}: CancelConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title={title ?? t('common.modal.cancel_title')}
      subtitle={subtitle ?? t('common.modal.cancel_subtitle')}
      prompt={prompt ?? t('common.modal.cancel_prompt')}
      confirmText={confirmText ?? t('common.modal.discard')}
      cancelText={cancelText ?? t('common.modal.keep_editing')}
      variant="warning"
      icon="warning"
      role="alertdialog"
      className={className}
    />
  );
}
