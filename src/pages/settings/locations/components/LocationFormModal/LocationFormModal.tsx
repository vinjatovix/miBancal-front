import type { ReactNode } from 'react';

import { t } from '../../../../../i18n/core/t';
import { ErrorResponse } from '../../../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../../../shared/components/Loader/Loader';
import Modal from '../../../../../shared/components/Modal/Modal';
import { reportRejection } from '../../../../../shared/observability/reportRejection';
import { useToast } from '../../../../../shared/toast/useToast';
import { useLocationForEdit } from '../../hooks/useLocationForEdit';
import { LocationFormBody } from './LocationFormBody';

import './locationFormModal.css';

export interface LocationFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly locationIdToEdit?: string | null;
  readonly onSaved?: (locationId?: string) => void;
}

export default function LocationFormModal({
  isOpen,
  onClose,
  locationIdToEdit,
  onSaved
}: LocationFormModalProps) {
  const isEditMode = Boolean(locationIdToEdit);
  const { showToast } = useToast();

  const {
    location: locationForEdit,
    etag,
    isLoading: isFetchingDetail,
    isError,
    error,
    refetch
  } = useLocationForEdit(locationIdToEdit ?? null);

  function handleConflict() {
    showToast({
      title: t('location.form.conflict_title'),
      message: t('location.form.conflict_message'),
      variant: 'warning'
    });
    refetch().catch(reportRejection('location-form-modal'));
  }

  function handleRetry() {
    refetch().catch(reportRejection('location-form-modal'));
  }

  let modalContent: ReactNode;
  if (isEditMode && isFetchingDetail) {
    modalContent = (
      <div className="location-form-modal__loading">
        <Loader />
      </div>
    );
  } else if (isEditMode && isError) {
    modalContent = (
      <div className="location-form-modal__loading">
        <ErrorResponse error={error} onRetry={handleRetry} />
      </div>
    );
  } else {
    modalContent = (
      <LocationFormBody
        key={`${locationIdToEdit ?? 'create'}-${etag ?? ''}`}
        locationToEdit={locationForEdit}
        etag={etag}
        isEditMode={isEditMode}
        locationIdToEdit={locationIdToEdit}
        onClose={onClose}
        onSaved={onSaved}
        onConflict={handleConflict}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? t('location.form.title_edit')
          : t('location.form.title_create')
      }
      subtitle={
        isEditMode
          ? t('location.form.subtitle_edit')
          : t('location.form.subtitle_create')
      }
    >
      {modalContent}
    </Modal>
  );
}
