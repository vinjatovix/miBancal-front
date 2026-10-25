import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';
import { CancelConfirmModal } from '../../../../shared/components/Modal/CancelConfirmModal';
import { ApiError } from '../../../../shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import { useToast } from '../../../../shared/toast/useToast';
import type { Plant } from '../../../../types/Plants/Plant';
import { PlantDeleteConfirmModal } from '../../components/PlantDeleteConfirmModal/PlantDeleteConfirmModal';
import { usePlantFormState } from '../../components/PlantForm/hooks/usePlantFormState';
import { PlantIdentitySection } from '../../components/PlantForm/PlantIdentitySection';
import { PlantKnowledgeSection } from '../../components/PlantForm/PlantKnowledgeSection';
import { PlantNotesSection } from '../../components/PlantForm/PlantNotesSection';
import { PlantPhenologySection } from '../../components/PlantForm/PlantPhenologySection';
import { PlantResourcesSection } from '../../components/PlantForm/PlantResourcesSection';
import { PlantTraitsSection } from '../../components/PlantForm/PlantTraitsSection';
import {
  canonicalPlantToFormState,
  formStateToUpdatePlantRequest,
  normalizePlantApiErrors
} from '../../components/PlantForm/utils/plantFormMappers';
import { useDeletePlant } from '../../hooks/useDeletePlant';
import { useUpdatePlant } from '../../hooks/useUpdatePlant';

import '../../components/PlantForm/plantForm.css';

interface Props {
  readonly plant: Plant;
  readonly etag: string;
  readonly onCancel: () => void;
  readonly onSuccess: (updated: Plant, newEtag: string) => void;
  readonly onReload: () => void;
}

export function PlantInlineEditForm({
  plant,
  etag,
  onCancel,
  onSuccess,
  onReload
}: Props) {
  const navigate = useNavigate();
  const { values, errors, isDirty, setField, validate, setErrors } =
    usePlantFormState(canonicalPlantToFormState(plant));
  const { dismissAll, showErrorToast } = useToast();

  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const updateMutation = useUpdatePlant();
  const deleteMutation = useDeletePlant();

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    onCancel();
  };

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    onCancel();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: plant.id, etag });
      setIsDeleteModalOpen(false);
      navigate('/plants');
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      if (err instanceof PreconditionFailedError) {
        setHasConflict(true);
      }
      showErrorToast(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dismissAll();

    if (!validate()) {
      setValidationSummary(t('plant.form.validation.summary'));
      setTimeout(() => {
        const firstErrorElement = document.querySelector<HTMLElement>(
          '.plant-form [aria-invalid="true"], .plant-form [role="alert"]'
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView?.({
            behavior: 'smooth',
            block: 'center'
          });
          firstErrorElement.focus?.();
        }
      }, 0);
      return;
    }

    setValidationSummary(null);
    setHasConflict(false);
    try {
      const patch = formStateToUpdatePlantRequest(values, plant);
      const result = await updateMutation.mutateAsync({
        id: plant.id,
        patch,
        etag
      });
      onSuccess(result.plant, result.etag);
    } catch (err: unknown) {
      if (err instanceof PreconditionFailedError) {
        setHasConflict(true);
        showErrorToast(err);
      } else if (err instanceof ApiError) {
        if (err.errors) {
          const { fieldErrors, unmappedErrors } = normalizePlantApiErrors(
            err.errors
          );
          setErrors(fieldErrors);
          if (unmappedErrors.length > 0) {
            showErrorToast(unmappedErrors.join('; '));
          } else {
            showErrorToast({
              title: t('admin.toast_error_title'),
              message: t('toast.form_validation_check')
            });
          }
        } else if (err.status === 409) {
          showErrorToast({
            title: t('admin.toast_error_title'),
            message: t('plant.form.duplicate_error')
          });
        } else {
          showErrorToast(err);
        }
      } else {
        showErrorToast(err);
      }
    }
  };

  return (
    <form className="plant-form" onSubmit={handleSubmit}>
      {hasConflict && (
        <div role="alert" className="plant-form__conflict-banner">
          <strong>{t('plant.form.conflict.title')}</strong>
          <p>{t('plant.form.conflict.message')}</p>
          <button
            type="button"
            className="plant-form__btn plant-form__btn--submit"
            onClick={onReload}
          >
            {t('plant.form.conflict.reload_button')}
          </button>
        </div>
      )}

      <PlantIdentitySection
        values={values}
        errors={errors}
        onChange={setField}
      />
      <PlantTraitsSection values={values} errors={errors} onChange={setField} />
      <PlantPhenologySection
        values={values}
        errors={errors}
        onChange={setField}
      />
      <PlantKnowledgeSection
        values={values}
        errors={errors}
        onChange={setField}
      />
      <PlantNotesSection values={values} errors={errors} onChange={setField} />
      <PlantResourcesSection
        values={values}
        errors={errors}
        onChange={setField}
      />

      {validationSummary && (
        <div role="alert" className="plant-form__validation-summary">
          {validationSummary}
        </div>
      )}

      <div className="plant-form__actions">
        <button
          type="button"
          className="plant-form__btn plant-form__btn--delete"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={updateMutation.isPending || deleteMutation.isPending}
        >
          {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
        </button>
        <button
          type="button"
          className="plant-form__btn plant-form__btn--cancel"
          onClick={handleCancel}
          disabled={updateMutation.isPending || deleteMutation.isPending}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="plant-form__btn plant-form__btn--submit"
          disabled={updateMutation.isPending || deleteMutation.isPending}
        >
          {updateMutation.isPending
            ? t('common.saving')
            : t('common.save_changes')}
        </button>
      </div>

      <PlantDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        plantName={plant.identity.name.primary}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDeleting={deleteMutation.isPending}
      />

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('plant.form.cancel_confirm')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </form>
  );
}
