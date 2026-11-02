import { t } from '../../../../i18n/core/t';
import { ConfirmModal } from '../../../../shared/components/Modal/ConfirmModal';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';

import './plantDeleteConfirmModal.css';

export interface PlantDeleteConfirmModalProps {
  readonly isOpen: boolean;
  readonly plantName: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly isDeleting?: boolean;
  readonly isConflict?: boolean;
  readonly onReload?: () => void;
}

export function PlantDeleteConfirmModal({
  isOpen,
  plantName,
  onConfirm,
  onCancel,
  isDeleting = false,
  isConflict = false,
  onReload
}: PlantDeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      title={t('plant.detail.delete_modal_title')}
      subtitle={t('plant.detail.delete_modal_subtitle')}
      prompt={t('plant.detail.delete_modal_prompt', {
        name: capitalizeFirstLetter(plantName)
      })}
      warningText={t('plant.detail.delete_modal_warning')}
      confirmText={t('plant.detail.delete_plant')}
      confirmIcon="delete"
      loadingText={t('common.deleting')}
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
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
              disabled={isDeleting}
            >
              {t('plant.form.conflict.reload_button')}
            </button>
          )}
        </div>
      )}
    </ConfirmModal>
  );
}
