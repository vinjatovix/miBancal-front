import type { JSX } from 'react';

import BedCreateDrawer from '../../../../components/beds/BedCreateDrawer/BedCreateDrawer';
import BedEditDrawer from '../../../../components/beds/BedEditDrawer/BedEditDrawer';
import DeleteBedModal from '../../../../components/beds/DeleteBedModal/DeleteBedModal';
import { CancelConfirmModal } from '../../../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { t } from '../../../../i18n/core/t';

export interface LocationLayoutDialogsProps {
  readonly locationId: string;
  readonly selectedBedId: string | null;
  readonly selectedBedName: string;
  readonly isCreateOpen: boolean;
  readonly isEditOpen: boolean;
  readonly isDeleteOpen: boolean;
  readonly isDeleting: boolean;
  readonly discardOpen: boolean;
  readonly dirty: boolean;
  readonly onCloseCreate: () => void;
  readonly onCloseEdit: () => void;
  readonly onCloseDelete: () => void;
  readonly onCreated: (bedId: string) => void;
  readonly onUpdated: () => void;
  readonly onConfirmDelete: () => void;
  readonly onConfirmDiscard: () => void;
  readonly onCancelDiscard: () => void;
}

export default function LocationLayoutDialogs({
  locationId,
  selectedBedId,
  selectedBedName,
  isCreateOpen,
  isEditOpen,
  isDeleteOpen,
  isDeleting,
  discardOpen,
  dirty,
  onCloseCreate,
  onCloseEdit,
  onCloseDelete,
  onCreated,
  onUpdated,
  onConfirmDelete,
  onConfirmDiscard,
  onCancelDiscard
}: LocationLayoutDialogsProps): JSX.Element {
  return (
    <>
      <BedCreateDrawer
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onCreated={onCreated}
        initialLocationId={locationId}
      />

      <BedEditDrawer
        isOpen={isEditOpen}
        bedId={selectedBedId}
        onClose={onCloseEdit}
        onSaved={onUpdated}
      />

      <DeleteBedModal
        isOpen={isDeleteOpen}
        bedName={selectedBedName}
        isDeleting={isDeleting}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
      />

      <CancelConfirmModal
        isOpen={discardOpen}
        onConfirm={onConfirmDiscard}
        onCancel={onCancelDiscard}
        title={t('bed.layout.discard_title')}
        prompt={t('bed.layout.discard_message')}
        confirmText={t('bed.layout.discard_confirm')}
        cancelText={t('bed.layout.discard_cancel')}
      />

      <UnsavedChangesGuard
        when={dirty}
        prompt={t('bed.layout.discard_message')}
      />
    </>
  );
}
