import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
import { CancelConfirmModal } from '../../../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { useToast } from '../../../../shared/toast/useToast';
import type { GardenInput } from '../../../../types/GardenInput/GardenInput';
import GardenInputForm from '../../components/GardenInputForm';
import { useUpdateGardenInput } from '../../hooks/useUpdateGardenInput';
import {
  fromGardenInputEntity,
  toUpdateRequest,
  type GardenInputFormValues
} from '../../utils/gardenInputValidation';

import '../../components/gardenInputForm.css';

interface Props {
  readonly gardenInput: GardenInput;
  readonly etag: string;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
  readonly onReload: () => void;
}

export function GardenInputInlineEditForm({
  gardenInput,
  etag,
  onCancel,
  onSuccess,
  onReload
}: Props) {
  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const updateMutation = useUpdateGardenInput();
  const { dismissAll, showErrorToast } = useToast();

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    onCancel();
  };

  async function handleSubmit(values: GardenInputFormValues) {
    dismissAll();
    setServerError(undefined);
    setHasConflict(false);

    try {
      const patch = toUpdateRequest(values);
      await updateMutation.mutateAsync({
        idOrSlug: gardenInput.slug,
        patch,
        etag
      });
      onSuccess();
    } catch (err) {
      if (err instanceof Error && err.name === 'PreconditionFailedError') {
        setHasConflict(true);
        return;
      }
      setServerError(t('gardenInput.form.errors.update_error'));
      showErrorToast(t('gardenInput.form.errors.update_error'));
    }
  }

  return (
    <div className="garden-input-inline-edit-form">
      <UnsavedChangesGuard
        when={isDirty && !updateMutation.isSuccess}
        prompt={t('gardenInput.form.cancel_confirm')}
      />
      {hasConflict && (
        <div role="alert" className="garden-input-form__conflict-banner">
          <strong>{t('gardenInput.form.conflict_title')}</strong>
          <p>{t('gardenInput.form.conflict_message')}</p>
          <Button variant="primary" onClick={onReload}>
            {t('gardenInput.form.conflict_reload')}
          </Button>
        </div>
      )}

      <GardenInputForm
        initialValues={fromGardenInputEntity(gardenInput)}
        isCreate={false}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDirtyChange={setIsDirty}
        externalError={serverError}
      />

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('gardenInput.form.cancel_confirm')}
        onConfirm={() => {
          setIsCancelModalOpen(false);
          onCancel();
        }}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
