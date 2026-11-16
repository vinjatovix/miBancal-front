import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import { ConfirmModal } from '../../../../shared/components/Modal/ConfirmModal';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import { useToast } from '../../../../shared/toast/useToast';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import { useDeleteGardenInput } from '../../hooks/useDeleteGardenInput';

import './gardenInputDeleteDialog.css';

export interface GardenInputDeleteDialogProps {
  readonly isOpen: boolean;
  readonly slug: string;
  readonly name: string;
  readonly resolveEtag: () => Promise<string | undefined>;
  readonly onClose: () => void;
  readonly onDeleted: () => void;
  readonly onReload: () => void;
}

export default function GardenInputDeleteDialog({
  isOpen,
  slug,
  name,
  resolveEtag,
  onClose,
  onDeleted,
  onReload
}: GardenInputDeleteDialogProps) {
  const deleteMutation = useDeleteGardenInput();
  const { dismissAll, showErrorToast } = useToast();
  const [isConflict, setIsConflict] = useState<boolean>(false);

  function handleClose() {
    if (deleteMutation.isPending) return;
    setIsConflict(false);
    onClose();
  }

  async function handleConfirm() {
    dismissAll();
    setIsConflict(false);
    const etag = await resolveEtag().catch(() => undefined);
    if (!etag) {
      showErrorToast(t('gardenInput.detail.delete_etag_error'));
      return;
    }
    try {
      await deleteMutation.mutateAsync({ idOrSlug: slug, etag });
      onDeleted();
    } catch (err: unknown) {
      if (err instanceof PreconditionFailedError) {
        setIsConflict(true);
      }
      showErrorToast(
        err instanceof Error
          ? err.message
          : t('gardenInput.detail.delete_error')
      );
    }
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      title={t('gardenInput.detail.delete_confirm_title')}
      subtitle={capitalizeFirstLetter(name)}
      prompt={t('gardenInput.detail.delete_confirm_message')}
      confirmText={t('gardenInput.detail.delete_confirm_action')}
      cancelText={t('gardenInput.detail.delete_cancel_action')}
      loadingText={t('gardenInput.detail.deleting')}
      isLoading={deleteMutation.isPending}
      onConfirm={() => void handleConfirm()}
      onCancel={handleClose}
    >
      {isConflict && (
        <div role="alert" className="garden-input-delete-dialog__conflict">
          <p>{t('gardenInput.form.conflict_message')}</p>
          <button
            type="button"
            className="garden-input-delete-dialog__reload-btn"
            onClick={onReload}
          >
            {t('gardenInput.form.conflict_reload')}
          </button>
        </div>
      )}
    </ConfirmModal>
  );
}
