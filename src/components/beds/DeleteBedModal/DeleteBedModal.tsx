import { t } from '../../../i18n/core/t';
import { ConfirmModal } from '../../../shared/components/Modal/ConfirmModal';

export interface DeleteBedModalProps {
  readonly isOpen: boolean;
  readonly bedName: string;
  readonly isDeleting?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export default function DeleteBedModal({
  isOpen,
  bedName,
  isDeleting = false,
  onClose,
  onConfirm
}: DeleteBedModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      role="alertdialog"
      title={t('bed.delete.title')}
      prompt={t('bed.delete.message', { name: bedName })}
      confirmText={t('bed.delete.confirm')}
      cancelText={t('bed.delete.cancel')}
      loadingText={t('bed.delete.deleting')}
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
