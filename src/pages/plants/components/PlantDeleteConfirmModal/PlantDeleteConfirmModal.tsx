import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import Modal from '../../../../shared/components/Modal/Modal';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';

import './plantDeleteConfirmModal.css';

export interface PlantDeleteConfirmModalProps {
  readonly isOpen: boolean;
  readonly plantName: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly isDeleting?: boolean;
  readonly error?: string | null;
  readonly isConflict?: boolean;
  readonly onReload?: () => void;
}

export function PlantDeleteConfirmModal({
  isOpen,
  plantName,
  onConfirm,
  onCancel,
  isDeleting = false,
  error = null,
  isConflict = false,
  onReload
}: PlantDeleteConfirmModalProps) {
  const footer = (
    <div className="plant-delete-modal-actions">
      <button
        type="button"
        className="plant-delete-modal-btn plant-delete-modal-btn--cancel"
        onClick={onCancel}
        disabled={isDeleting}
      >
        {t('common.cancel')}
      </button>
      <button
        type="button"
        className="plant-delete-modal-btn plant-delete-modal-btn--confirm"
        onClick={onConfirm}
        disabled={isDeleting}
      >
        <Icon name="delete" decorative />
        <span>
          {isDeleting ? t('common.deleting') : t('plant.detail.delete_plant')}
        </span>
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('plant.detail.delete_modal_title')}
      subtitle={t('plant.detail.delete_modal_subtitle')}
      icon="delete"
      variant="danger"
      role="dialog"
      ariaLabelledBy="plant-delete-modal-title"
      closeLabel={t('common.drawer.close')}
      preventClose={isDeleting}
      overlayClassName="plant-delete-modal-overlay"
      className="plant-delete-modal-card"
      footer={footer}
    >
      <p className="plant-delete-modal-prompt">
        {t('plant.detail.delete_modal_prompt', {
          name: capitalizeFirstLetter(plantName)
        })}
      </p>

      <div className="plant-delete-modal-warning">
        <div className="plant-delete-modal-warning-icon">
          <Icon name="warning" decorative />
        </div>
        <p className="plant-delete-modal-warning-text">
          {t('plant.detail.delete_modal_warning')}
        </p>
      </div>

      {isConflict && (
        <div
          role="alert"
          className="plant-delete-modal-alert plant-delete-modal-alert--conflict"
        >
          <span>{t('plant.form.conflict.message')}</span>
          {onReload && (
            <button
              type="button"
              className="plant-delete-modal-alert-btn"
              onClick={onReload}
            >
              {t('plant.form.conflict.reload_button')}
            </button>
          )}
        </div>
      )}

      {error && !isConflict && (
        <div
          role="alert"
          className="plant-delete-modal-alert plant-delete-modal-alert--error"
        >
          {error}
        </div>
      )}
    </Modal>
  );
}
