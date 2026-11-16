import { useState, type SubmitEvent } from 'react';
import { useReportedNavigate } from '../../shared/observability/useReportedNavigate';

import { t } from '../../i18n/core/t';
import Button from '../../shared/components/Button/Button';
import { CancelConfirmModal } from '../../shared/components/Modal/CancelConfirmModal';
import { useToast } from '../../shared/toast/useToast';
import { FamilyFormFields } from './components/FamilyForm/FamilyFormFields';
import { useFamilyFormState } from './components/FamilyForm/hooks/useFamilyFormState';
import {
  focusFirstFamilyError,
  formStateToCreateFamilyRequest,
  handleFamilySubmitError,
  initialFamilyFormState
} from './components/FamilyForm/utils/familyFormMappers';
import { useCreateFamily } from './hooks/useCreateFamily';

import './familyCreatePage.css';
import './components/FamilyForm/familyForm.css';

export default function FamilyCreatePage() {
  const navigate = useReportedNavigate('family-create');
  const createMutation = useCreateFamily();
  const { dismissAll, showErrorToast } = useToast();
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

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    dismissAll();

    if (!validate()) {
      setValidationSummary(t('family.form.validation.summary'));
      focusFirstFamilyError();
      return;
    }

    setValidationSummary(null);
    try {
      const request = formStateToCreateFamilyRequest(values);
      const result = await createMutation.mutateAsync(request);
      navigate(`/families/${result.family.slug || result.family.id}`);
    } catch (err: unknown) {
      handleFamilySubmitError(err, { setErrors, showErrorToast });
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
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={createMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('common.creating') : t('common.save')}
          </Button>
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
