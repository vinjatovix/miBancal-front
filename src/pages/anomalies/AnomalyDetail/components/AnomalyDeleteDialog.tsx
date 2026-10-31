import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import { ConfirmModal } from '../../../../shared/components/Modal/ConfirmModal';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import { useToast } from '../../../../shared/toast/useToast';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import { useDeleteAnomaly } from '../../hooks/useDeleteAnomaly';

interface Props {
  readonly isOpen: boolean;
  readonly slug: string;
  readonly name: string;
  readonly resolveEtag: () => Promise<string | undefined>;
  readonly onClose: () => void;
  readonly onDeleted: () => void;
  readonly onReload: () => void;
}

export function AnomalyDeleteDialog({
  isOpen,
  slug,
  name,
  resolveEtag,
  onClose,
  onDeleted,
  onReload
}: Props) {
  const deleteMutation = useDeleteAnomaly();
  const { dismissAll, showErrorToast } = useToast();
  const [isConflict, setIsConflict] = useState<boolean>(false);

  const close = () => {
    if (deleteMutation.isPending) return;
    setIsConflict(false);
    onClose();
  };

  const confirm = async () => {
    dismissAll();
    setIsConflict(false);
    const etag = await resolveEtag().catch(() => undefined);
    if (!etag) {
      showErrorToast(t('anomaly.detail.delete_error'));
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
        err instanceof Error ? err.message : t('anomaly.detail.delete_error')
      );
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      title={t('anomaly.detail.delete_confirm_title')}
      subtitle={capitalizeFirstLetter(name)}
      prompt={t('anomaly.detail.delete_confirm_message')}
      confirmText={t('anomaly.detail.delete_confirm_action')}
      loadingText={t('anomaly.detail.deleting')}
      isLoading={deleteMutation.isPending}
      onConfirm={() => void confirm()}
      onCancel={close}
    >
      {isConflict && (
        <div role="alert" className="anomaly-delete__conflict">
          <p>{t('anomaly.detail.delete_conflict')}</p>
          <button type="button" onClick={onReload}>
            {t('anomaly.detail.delete_reload')}
          </button>
        </div>
      )}
    </ConfirmModal>
  );
}
