import { type SubmitEvent, useState } from 'react';

import { t } from '../../../../../i18n/core/t';
import Button from '../../../../../shared/components/Button/Button';
import { useToast } from '../../../../../shared/toast/useToast';
import type { Location } from '../../../../../types/Location/Location';
import { useLocationMutations } from '../../hooks/useLocationMutations';
import { buildLocationPatch } from '../../utils/buildLocationPatch';
import { mapLocationError } from '../../utils/mapLocationError';
import {
  type LocationFormErrors,
  type LocationFormValues,
  validateLocationForm
} from '../../utils/validateLocationForm';
import LocationFormFields from '../LocationFormFields/LocationFormFields';

export interface LocationFormBodyProps {
  readonly locationToEdit?: Location | null;
  readonly etag?: string | null;
  readonly isEditMode: boolean;
  readonly locationIdToEdit?: string | null;
  readonly onClose: () => void;
  readonly onSaved?: (locationId?: string) => void;
  readonly onConflict: () => void;
}

const EMPTY_VALUES: LocationFormValues = {
  name: '',
  latitude: '',
  longitude: ''
};

function resolveLocationSubmitLabel(
  isSubmitting: boolean,
  isEditMode: boolean
): string {
  if (isSubmitting) {
    return t('location.form.submitting');
  }
  if (isEditMode) {
    return t('location.form.submit_edit');
  }
  return t('location.form.submit_create');
}

export function LocationFormBody({
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

  async function handleSubmit(event: SubmitEvent) {
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
        onSaved?.(locationIdToEdit);
      } else {
        const newLocationId = crypto.randomUUID();
        const created = await create.mutateAsync({
          id: newLocationId,
          name: values.name.trim(),
          latitude: Number(values.latitude.trim()),
          longitude: Number(values.longitude.trim())
        });
        showSuccessToast(t('location.form.success_create'));
        onSaved?.(created?.location?.id ?? newLocationId);
      }
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
        <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
          {t('location.form.cancel')}
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {resolveLocationSubmitLabel(isSubmitting, isEditMode)}
        </Button>
      </div>
    </form>
  );
}
