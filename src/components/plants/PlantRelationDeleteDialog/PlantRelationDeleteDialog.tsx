import { useState } from 'react';
import { t } from '../../../i18n/core/t';
import { useDeletePlantRelation } from '../../../pages/plantRelations/hooks/useDeletePlantRelation';
import { ConfirmModal } from '../../../shared/components/Modal';
import { PreconditionFailedError } from '../../../shared/errors/PreconditionFailedError';
import type { PlantRelation } from '../../../types/Plants/PlantRelation';

export interface PlantRelationDeleteDialogProps {
  readonly isOpen: boolean;
  readonly relation: PlantRelation | null;
  readonly etag: string;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export default function PlantRelationDeleteDialog({
  isOpen,
  relation,
  etag,
  onClose,
  onSuccess
}: PlantRelationDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeletePlantRelation();

  if (!relation) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync({
        id: relation.id,
        etag: etag || `"${relation.version}"`,
        plantId: relation.sourcePlantId
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof PreconditionFailedError) {
        setError(t('toast.concurrent_modification'));
      } else {
        setError(t('plantRelation.curator.errorDelete'));
      }
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      title={t('plantRelation.curator.deleteConfirmTitle')}
      prompt={t('plantRelation.curator.deleteConfirmText')}
      confirmText={t('plantRelation.curator.deleteConfirmButton')}
      cancelText={t('plantRelation.curator.cancel')}
      isLoading={deleteMutation.isPending}
      loadingText={t('plantRelation.curator.deleting')}
      warningText={error ?? undefined}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
