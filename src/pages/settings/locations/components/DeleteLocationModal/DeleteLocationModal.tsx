import { t } from '../../../../../i18n/core/t';
import { ConfirmModal } from '../../../../../shared/components/Modal/ConfirmModal';
import type { Location } from '../../../../../types/Location/Location';

export interface DeleteLocationModalProps {
  readonly isOpen: boolean;
  readonly location: Location | null;
  readonly isDeleting?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (location: Location) => void;
}

export default function DeleteLocationModal({
  isOpen,
  location,
  isDeleting = false,
  onClose,
  onConfirm
}: DeleteLocationModalProps) {
  if (!location) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      role="dialog"
      title={t('location.delete.title')}
      prompt={t('location.delete.message', { name: location.name })}
      confirmText={t('location.delete.confirm')}
      cancelText={t('location.delete.cancel')}
      loadingText={t('location.delete.deleting')}
      isLoading={isDeleting}
      onConfirm={() => onConfirm(location)}
      onCancel={onClose}
    />
  );
}
