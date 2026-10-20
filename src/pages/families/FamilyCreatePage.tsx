import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { CancelConfirmModal } from '../../shared/components/Modal/CancelConfirmModal';
import { ApiError } from '../../shared/errors/ApiError';
import { FamilyFormFields } from './components/FamilyForm/FamilyFormFields';
import { useFamilyFormState } from './components/FamilyForm/hooks/useFamilyFormState';
import {
  formStateToCreateFamilyRequest,
  initialFamilyFormState,
  normalizeFamilyApiErrors
} from './components/FamilyForm/utils/familyFormMappers';
import { useCreateFamily } from './hooks/useCreateFamily';

import './familyCreatePage.css';
import './components/FamilyForm/familyForm.css';

export default function FamilyCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateFamily();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const { values, errors, isDirty, setField, validate, setErrors } =
    useFamilyFormState(initialFamilyFormState());

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    navigate('/families');
  };

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    navigate('/families');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setValidationSummary(t('family.form.validation.summary'));
      setTimeout(() => {
        const firstErrorElement = document.querySelector<HTMLElement>(
          '.family-form [aria-invalid="true"], .family-form [role="alert"]'
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
      const request = formStateToCreateFamilyRequest(values);
      const result = await createMutation.mutateAsync(request);
      navigate(`/families/${result.family.slug || result.family.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const { fieldErrors, unmappedErrors } = normalizeFamilyApiErrors(
            err.errors
          );
          setErrors(fieldErrors);
          if (unmappedErrors.length > 0) {
            setGeneralError(unmappedErrors.join('; '));
          }
        } else if (err.status === 409) {
          setGeneralError(t('family.form.duplicate_error'));
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
    <div className="family-create-page">
      <header className="family-create-page__header">
        <h1 className="family-create-page__title">
          {t('family.form.title_create')}
        </h1>
        <p className="family-create-page__subtitle">
          {t('family.form.subtitle_create')}
        </p>
      </header>

      {generalError && (
        <div role="alert" className="family-form__error">
          {generalError}
        </div>
      )}

      <form className="family-form" onSubmit={handleSubmit}>
        <fieldset className="family-form__section">
          <legend className="family-form__section-title">
            {t('family.form.title_create')}
          </legend>
          <FamilyFormFields
            values={values}
            errors={errors}
            setField={setField}
          />
        </fieldset>

        {validationSummary && (
          <div role="alert" className="family-form__validation-summary">
            {validationSummary}
          </div>
        )}

        <div className="family-form__actions">
          <button
            type="button"
            className="family-form__btn family-form__btn--cancel"
            onClick={handleCancel}
            disabled={createMutation.isPending}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="family-form__btn family-form__btn--submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('common.creating') : t('common.save')}
          </button>
        </div>
      </form>

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('family.form.cancel_confirm')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
