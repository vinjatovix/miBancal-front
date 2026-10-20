import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { CancelConfirmModal } from '../../shared/components/Modal/CancelConfirmModal';
import { ApiError } from '../../shared/errors/ApiError';
import { usePlantFormState } from './components/PlantForm/hooks/usePlantFormState';
import { PlantIdentitySection } from './components/PlantForm/PlantIdentitySection';
import { PlantKnowledgeSection } from './components/PlantForm/PlantKnowledgeSection';
import { PlantNotesSection } from './components/PlantForm/PlantNotesSection';
import { PlantPhenologySection } from './components/PlantForm/PlantPhenologySection';
import { PlantResourcesSection } from './components/PlantForm/PlantResourcesSection';
import { PlantTraitsSection } from './components/PlantForm/PlantTraitsSection';
import {
  formStateToCreatePlantRequest,
  initialPlantFormState,
  normalizePlantApiErrors
} from './components/PlantForm/utils/plantFormMappers';
import { useCreatePlant } from './hooks/useCreatePlant';

import './plantCreatePage.css';
import './components/PlantForm/plantForm.css';

export default function PlantCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreatePlant();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const { values, errors, isDirty, setField, validate, setErrors } =
    usePlantFormState(initialPlantFormState());

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    navigate('/plants');
  };

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    navigate('/plants');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    setGeneralError(null);
    try {
      const request = formStateToCreatePlantRequest(values);
      const result = await createMutation.mutateAsync(request);
      navigate(`/plants/${result.plant.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const { fieldErrors, unmappedErrors } = normalizePlantApiErrors(
            err.errors
          );
          setErrors(fieldErrors);
          if (unmappedErrors.length > 0) {
            setGeneralError(unmappedErrors.join('; '));
          } else if (Object.keys(fieldErrors).length === 0) {
            setGeneralError(err.message);
          }
        } else if (err.status === 409) {
          setGeneralError(t('plant.form.duplicate_error'));
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError(
          err instanceof Error ? err.message : t('errors.app.title')
        );
      }
    }
  };

  return (
    <div className="plant-create-page">
      <header className="plant-create-page__header">
        <h1 className="plant-create-page__title">
          {t('plant.form.title_create')}
        </h1>
        <p className="plant-create-page__subtitle">
          {t('plant.form.subtitle_create')}
        </p>
      </header>

      {generalError && (
        <div role="alert" className="plant-form__error">
          {generalError}
        </div>
      )}

      <form className="plant-form" onSubmit={handleSubmit}>
        <PlantIdentitySection
          values={values}
          errors={errors}
          onChange={setField}
        />
        <PlantTraitsSection
          values={values}
          errors={errors}
          onChange={setField}
        />
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
        <PlantNotesSection
          values={values}
          errors={errors}
          onChange={setField}
        />
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
            className="plant-form__btn plant-form__btn--cancel"
            onClick={handleCancel}
            disabled={createMutation.isPending}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="plant-form__btn plant-form__btn--submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('common.creating') : t('common.save')}
          </button>
        </div>
      </form>

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('plant.form.cancel_confirm')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
