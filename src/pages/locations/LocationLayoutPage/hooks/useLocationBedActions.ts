import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { useBedForEdit } from '../../../beds/hooks/useBedForEdit';
import { useBedMutations } from '../../../beds/hooks/useBedMutations';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';
import { useToast } from '../../../../shared/toast/useToast';
import { t } from '../../../../i18n/core/t';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';

export interface UseLocationBedActionsParams {
  readonly locationId: string;
  readonly isPosition: boolean;
  readonly selectedBed?: ResolvedBed;
  readonly onDeselectBed: () => void;
}

export function useLocationBedActions({
  locationId,
  isPosition,
  selectedBed,
  onDeselectBed
}: UseLocationBedActionsParams) {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();
  const { remove } = useBedMutations();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const selectedBedId = selectedBed?.id ?? null;

  const { bed: selectedBedDetail, etag: selectedBedEtag } = useBedForEdit(
    !isPosition ? selectedBedId : null
  );

  const canDeleteSelectedBed =
    selectedBedDetail !== undefined &&
    selectedBedDetail.plantInstances.length === 0;

  const handleDeselectBed = useCallback(() => {
    onDeselectBed();
    if (searchParams.has('bed')) {
      setSearchParams(
        (prev) => {
          prev.delete('bed');
          return prev;
        },
        { replace: true }
      );
    }
  }, [onDeselectBed, searchParams, setSearchParams]);

  const handleBedCreated = useCallback(
    (newBedId: string) => {
      void queryClient.invalidateQueries({
        queryKey: locationKeys.layout(locationId)
      });
      setIsCreateOpen(false);
      setSearchParams(
        (prev) => {
          prev.set('bed', newBedId);
          return prev;
        },
        { replace: true }
      );
    },
    [locationId, queryClient, setSearchParams]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedBedId || !selectedBedEtag) return;
    try {
      await remove.mutateAsync({
        id: selectedBedId,
        etag: selectedBedEtag,
        locationId
      });
      showSuccessToast(
        t('bed.delete.success', { name: selectedBed?.name ?? '' })
      );
      setIsDeleteOpen(false);
      handleDeselectBed();
    } catch (error) {
      showErrorToast(error, t('bed.delete.error'));
    }
  }, [
    selectedBedId,
    selectedBedEtag,
    locationId,
    selectedBed,
    remove,
    showSuccessToast,
    showErrorToast,
    handleDeselectBed
  ]);

  return {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    canDeleteSelectedBed,
    isDeletingBed: remove.isPending,
    handleDeselectBed,
    handleBedCreated,
    handleConfirmDelete,
    dialogProps: {
      isCreateOpen,
      isEditOpen,
      isDeleteOpen,
      isDeleting: remove.isPending,
      onCloseCreate: () => setIsCreateOpen(false),
      onCloseEdit: () => setIsEditOpen(false),
      onCloseDelete: () => setIsDeleteOpen(false),
      onCreated: handleBedCreated,
      onConfirmDelete: () => void handleConfirmDelete()
    }
  };
}
