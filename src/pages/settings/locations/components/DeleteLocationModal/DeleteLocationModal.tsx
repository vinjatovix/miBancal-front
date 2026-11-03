import { t } from '../../../../../i18n/core/t';
import Modal from '../../../../../shared/components/Modal/Modal';
import type { Location } from '../../../../../types/Location/Location';

import './deleteLocationModal.css';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('location.delete.title')}
      role="dialog"
      variant="danger"
    >
      <div className="delete-location-modal__body">
        <p className="delete-location-modal__message">
          {t('location.delete.message', { name: location.name })}
        </p>
        <div className="delete-location-modal__footer">
          <button
            type="button"
            className="delete-location-modal__btn delete-location-modal__btn--cancel"
            disabled={isDeleting}
            onClick={onClose}
          >
            {t('location.delete.cancel')}
          </button>
          <button
            type="button"
            className="delete-location-modal__btn delete-location-modal__btn--confirm"
            disabled={isDeleting}
            onClick={() => onConfirm(location)}
          >
            {isDeleting
              ? t('location.delete.deleting')
              : t('location.delete.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
