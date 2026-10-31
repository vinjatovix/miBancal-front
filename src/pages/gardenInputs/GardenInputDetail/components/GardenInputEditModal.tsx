import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import Modal from '../../../../shared/components/Modal/Modal';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import type { GardenInput } from '../../../../types/GardenInput/GardenInput';
import GardenInputForm from '../../components/GardenInputForm';
import { useUpdateGardenInput } from '../../hooks/useUpdateGardenInput';
import {
  fromGardenInputEntity,
  toUpdateRequest,
  type GardenInputFormValues
} from '../../utils/gardenInputValidation';

import './gardenInputEditModal.css';

export interface GardenInputEditModalProps {
  readonly isOpen: boolean;
  readonly gardenInput: GardenInput;
  readonly etag: string;
  readonly resolveEtag?: () => Promise<string | undefined>;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly onReload: () => void;
}

export default function GardenInputEditModal({
  isOpen,
  gardenInput,
  etag,
  resolveEtag,
  onClose,
  onSuccess,
  onReload
}: GardenInputEditModalProps) {
  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | undefined>();
  const updateMutation = useUpdateGardenInput();

  async function handleSubmit(values: GardenInputFormValues) {
    setServerError(undefined);
    setHasConflict(false);

    try {
      const effectiveEtag = etag || (await resolveEtag?.());
      if (!effectiveEtag) {
        setServerError(t('gardenInput.detail.delete_etag_error'));
        return;
      }

      const patch = toUpdateRequest(values);
      await updateMutation.mutateAsync({
        idOrSlug: gardenInput.slug,
        patch,
        etag: effectiveEtag
      });
      onSuccess();
    } catch (err) {
      if (err instanceof PreconditionFailedError) {
        setHasConflict(true);
        return;
      }
      setServerError(t('gardenInput.form.errors.update_error'));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('gardenInput.form.title_edit')}
      maxWidth="850px"
    >
      <div className="garden-input-edit-modal">
        {hasConflict && (
          <div
            role="alert"
            className="garden-input-edit-modal__conflict-banner"
          >
            <strong>{t('gardenInput.form.conflict_title')}</strong>
            <p>{t('gardenInput.form.conflict_message')}</p>
            <button
              type="button"
              className="garden-input-edit-modal__reload-btn"
              onClick={onReload}
            >
              {t('gardenInput.form.conflict_reload')}
            </button>
          </div>
        )}

        <GardenInputForm
          key={`${gardenInput.id}-${etag}`}
          initialValues={fromGardenInputEntity(gardenInput)}
          isCreate={false}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={onClose}
          externalError={serverError}
        />
      </div>
    </Modal>
  );
}
