import { type FormEvent, useState } from 'react';

import { t } from '../../../../../i18n/core/t';
import Button from '../../../../../shared/components/Button/Button';
import { ErrorResponse } from '../../../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../../../shared/components/Loader/Loader';
import Modal from '../../../../../shared/components/Modal/Modal';
import { useToast } from '../../../../../shared/toast/useToast';
import type { Location } from '../../../../../types/Location/Location';
import { useLocationForEdit } from '../../hooks/useLocationForEdit';
import { useLocationMutations } from '../../hooks/useLocationMutations';
import { buildLocationPatch } from '../../utils/buildLocationPatch';
import { mapLocationError } from '../../utils/mapLocationError';
import {
  type LocationFormErrors,
  type LocationFormValues,
  validateLocationForm
} from '../../utils/validateLocationForm';
import LocationFormFields from '../LocationFormFields/LocationFormFields';

import './locationFormModal.css';

export interface LocationFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly locationIdToEdit?: string | null;
  readonly onSaved?: () => void;
}

const EMPTY_VALUES: LocationFormValues = {
  name: '',
  latitude: '',
  longitude: ''
};

interface LocationFormBodyProps {
  readonly locationToEdit?: Location | null;
  readonly etag?: string | null;
  readonly isEditMode: boolean;
  readonly locationIdToEdit?: string | null;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
  readonly onConflict: () => void;
}

function LocationFormBody({
  locationToEdit,
  etag,
  isEditMode,
  locationIdToEdit,
  onClose,
  onSaved,
  onConflict
}: LocationFormBodyProps) {
  const { showSuccessToast, showErrorToast } = useToast();
  const { create, update } = useLocationMutations();

  const [values, setValues] = useState<LocationFormValues>(() =>
    locationToEdit
      ? {
          name: locationToEdit.name,
          latitude: String(locationToEdit.latitude),
          longitude: String(locationToEdit.longitude)
        }
      : EMPTY_VALUES
  );
  const [errors, setErrors] = useState<LocationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFieldChange<K extends keyof LocationFormValues>(
    field: K,
    val: LocationFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleApiError(err: unknown) {
    const mapped = mapLocationError(err);
    if (mapped.isConflict) {
      onConflict();
      return;
    }

    if (mapped.fieldErrors.name === 'duplicate') {
      setErrors((prev) => ({ ...prev, name: 'duplicate' }));
      showErrorToast(t('location.form.duplicate_error'));
      return;
    }

    if (mapped.isHandled && Object.keys(mapped.fieldErrors).length > 0) {
      setErrors(mapped.fieldErrors);
      showErrorToast(t('toast.form_validation_check'));
      return;
    }

    showErrorToast(
      isEditMode
        ? t('location.form.errors.update_error')
        : t('location.form.errors.save_error')
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateLocationForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showErrorToast(t('toast.form_validation_check'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        if (!locationIdToEdit || !locationToEdit) {
          return;
        }
        const patch = buildLocationPatch(locationToEdit, values);
        if (Object.keys(patch).length > 0) {
          await update.mutateAsync({
            id: locationIdToEdit,
            patch,
            etag: etag ?? ''
          });
        }
        showSuccessToast(t('location.form.success_edit'));
      } else {
        await create.mutateAsync({
          id: crypto.randomUUID(),
          name: values.name.trim(),
          latitude: Number(values.latitude.trim()),
          longitude: Number(values.longitude.trim())
        });
        showSuccessToast(t('location.form.success_create'));
      }
      onSaved?.();
      onClose();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="location-form-modal__body"
    >
      <LocationFormFields
        values={values}
        errors={errors}
        disabled={isSubmitting}
        onChange={handleFieldChange}
      />
      <div className="location-form-modal__footer">
        <Button variant="neutral" disabled={isSubmitting} onClick={onClose}>
          {t('location.form.cancel')}
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('location.form.submitting')
            : isEditMode
              ? t('location.form.submit_edit')
              : t('location.form.submit_create')}
        </Button>
      </div>
    </form>
  );
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
    void refetch();
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
      {isEditMode && isFetchingDetail ? (
        <div className="location-form-modal__loading">
          <Loader />
        </div>
      ) : isEditMode && isError ? (
        <div className="location-form-modal__loading">
          <ErrorResponse error={error} onRetry={() => void refetch()} />
        </div>
      ) : (
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
      )}
    </Modal>
  );
}
