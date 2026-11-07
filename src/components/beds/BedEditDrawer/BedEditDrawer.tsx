import { useState, type FormEvent, type ReactElement } from 'react';

import { t } from '../../../i18n/core/t';
import { useBedForEdit } from '../../../pages/beds/hooks/useBedForEdit';
import { useBedMutations } from '../../../pages/beds/hooks/useBedMutations';
import { buildBedPatch } from '../../../pages/beds/utils/buildBedPatch';
import { mapBedError } from '../../../pages/beds/utils/mapBedError';
import {
  validateBedForm,
  type BedFormErrors
} from '../../../pages/beds/utils/validateBedForm';
import Button from '../../../shared/components/Button/Button';
import Drawer from '../../../shared/components/Drawer/Drawer';
import { Loader } from '../../../shared/components/Loader/Loader';
import { useToast } from '../../../shared/toast/useToast';
import type { Bed } from '../../../types/Bed/Bed';

import '../BedCreateDrawer/bedCreateDrawer.css';

export interface BedEditDrawerProps {
  readonly isOpen: boolean;
  readonly bedId: string | null;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
}

interface BedEditFormProps {
  readonly bed: Bed;
  readonly etag: string;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
  readonly onConflict: () => void;
}

function BedEditForm({
  bed,
  etag,
  onClose,
  onSaved,
  onConflict
}: BedEditFormProps): ReactElement {
  const { update } = useBedMutations();
  const { showSuccessToast, showErrorToast } = useToast();

  const [name, setName] = useState(bed.name);
  const [width, setWidth] = useState(String(bed.width));
  const [height, setHeight] = useState(String(bed.height));
  const [depth, setDepth] = useState(String(bed.depth));
  const [errors, setErrors] = useState<BedFormErrors>({});

  const clearError = (field: keyof BedFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const values = {
      name,
      width,
      height,
      depth,
      locationId: bed.locationId ?? ''
    };
    const result = validateBedForm(values);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const patch = buildBedPatch(bed, values);
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    try {
      await update.mutateAsync({
        id: bed.id,
        patch,
        etag,
        locationId: bed.locationId
      });
      showSuccessToast(t('bed.edit.success'));
      onSaved?.();
      onClose();
    } catch (error) {
      const mapped = mapBedError(error);
      if (mapped.isConflict) {
        showErrorToast(error, t('bed.edit.conflict'));
        onConflict();
        return;
      }
      if (mapped.isHandled) {
        setErrors(mapped.fieldErrors);
        return;
      }
      showErrorToast(error, t('bed.edit.error'));
    }
  };

  return (
    <div
      className="bed-create-drawer__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bed-edit-title"
    >
      <div className="bed-create-drawer__header">
        <div className="bed-create-drawer__title-group">
          <h2 id="bed-edit-title" className="bed-create-drawer__title">
            {t('bed.edit.title')}
          </h2>
          <p className="bed-create-drawer__subtitle">
            {t('bed.edit.subtitle', { name: bed.name })}
          </p>
        </div>
        <Button
          variant="neutral"
          size="sm"
          icon="close"
          aria-label={t('bed.edit.close')}
          onClick={onClose}
        />
      </div>

      <form
        id="bed-edit-form"
        className="bed-create-drawer__form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="bed-create-drawer__field">
          <label htmlFor="bed-edit-name" className="bed-create-drawer__label">
            {t('bed.form.name_label')}
          </label>
          <input
            id="bed-edit-name"
            type="text"
            className={`bed-create-drawer__input ${
              errors.name ? 'bed-create-drawer__input--error' : ''
            }`}
            placeholder={t('bed.form.name_placeholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
          />
          {errors.name && (
            <span className="bed-create-drawer__error-text">
              {t(errors.name as Parameters<typeof t>[0])}
            </span>
          )}
        </div>

        <div className="bed-create-drawer__field">
          <label htmlFor="bed-edit-width" className="bed-create-drawer__label">
            {t('bed.form.width_label')}
          </label>
          <input
            id="bed-edit-width"
            type="number"
            step="any"
            className={`bed-create-drawer__input ${
              errors.width ? 'bed-create-drawer__input--error' : ''
            }`}
            placeholder={t('bed.form.width_placeholder')}
            value={width}
            onChange={(e) => {
              setWidth(e.target.value);
              clearError('width');
            }}
          />
          {errors.width && (
            <span className="bed-create-drawer__error-text">
              {t(errors.width as Parameters<typeof t>[0])}
            </span>
          )}
        </div>

        <div className="bed-create-drawer__field">
          <label htmlFor="bed-edit-height" className="bed-create-drawer__label">
            {t('bed.form.height_label')}
          </label>
          <input
            id="bed-edit-height"
            type="number"
            step="any"
            className={`bed-create-drawer__input ${
              errors.height ? 'bed-create-drawer__input--error' : ''
            }`}
            placeholder={t('bed.form.height_placeholder')}
            value={height}
            onChange={(e) => {
              setHeight(e.target.value);
              clearError('height');
            }}
          />
          {errors.height && (
            <span className="bed-create-drawer__error-text">
              {t(errors.height as Parameters<typeof t>[0])}
            </span>
          )}
        </div>

        <div className="bed-create-drawer__field">
          <label htmlFor="bed-edit-depth" className="bed-create-drawer__label">
            {t('bed.form.depth_label')}
          </label>
          <input
            id="bed-edit-depth"
            type="number"
            step="any"
            className={`bed-create-drawer__input ${
              errors.depth ? 'bed-create-drawer__input--error' : ''
            }`}
            placeholder={t('bed.form.depth_placeholder')}
            value={depth}
            onChange={(e) => {
              setDepth(e.target.value);
              clearError('depth');
            }}
          />
          {errors.depth && (
            <span className="bed-create-drawer__error-text">
              {t(errors.depth as Parameters<typeof t>[0])}
            </span>
          )}
        </div>
      </form>

      <div className="bed-create-drawer__footer">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('bed.form.cancel')}
        </Button>
        <Button
          type="submit"
          form="bed-edit-form"
          variant="primary"
          disabled={update.isPending}
        >
          {update.isPending ? t('bed.edit.submitting') : t('bed.edit.submit')}
        </Button>
      </div>
    </div>
  );
}

export default function BedEditDrawer({
  isOpen,
  bedId,
  onClose,
  onSaved
}: BedEditDrawerProps): ReactElement | null {
  const { bed, etag, isLoading, refetch } = useBedForEdit(
    isOpen ? bedId : null
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="right" width={480}>
      {isOpen && (isLoading || !bed) && (
        <div className="bed-create-drawer__dialog">
          <Loader labelKey="bed.edit.loading" />
        </div>
      )}
      {isOpen && !isLoading && bed && (
        <BedEditForm
          key={`${bed.id}:${bed.version}`}
          bed={bed}
          etag={etag ?? ''}
          onClose={onClose}
          onSaved={onSaved}
          onConflict={() => {
            void refetch();
          }}
        />
      )}
    </Drawer>
  );
}
