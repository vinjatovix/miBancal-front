import { useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { CancelConfirmModal } from '../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { useToast } from '../../shared/toast/useToast';
import { AnomalyFormActions } from './components/AnomalyForm/AnomalyFormActions';
import { AnomalyFormFeedback } from './components/AnomalyForm/AnomalyFormFeedback';
import { AnomalyFormFields } from './components/AnomalyForm/AnomalyFormFields';
import { useAnomalyFormState } from './components/AnomalyForm/hooks/useAnomalyFormState';
import {
  clearAnomalyDraft,
  loadAnomalyDraft,
  saveAnomalyDraft
} from './components/AnomalyForm/utils/anomalyDraft';
import {
  formStateToCreateAnomalyRequest,
  initialAnomalyFormState
} from './components/AnomalyForm/utils/anomalyFormMappers';
import { focusFirstFormError } from './components/AnomalyForm/utils/focusFirstFormError';
import { resolveAnomalySubmitError } from './components/AnomalyForm/utils/resolveAnomalySubmitError';
import { useCreateAnomaly } from './hooks/useCreateAnomaly';

import './anomalyCreatePage.css';
import './components/AnomalyForm/anomalyForm.css';

const CATALOG_PATH = '/anomalies';

export default function AnomalyCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateAnomaly();
  const { dismissAll, showErrorToast } = useToast();
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  const [restoredDraft] = useState(loadAnomalyDraft);
  const { values, errors, isDirty, setField, validate, setErrors } =
    useAnomalyFormState(
      restoredDraft ?? initialAnomalyFormState(),
      'create',
      restoredDraft !== null
    );

  const leaveTo = (path: string) => {
    clearAnomalyDraft();
    flushSync(() => setIsLeaving(true));
    navigate(path);
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    leaveTo(CATALOG_PATH);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    dismissAll();

    if (!validate()) {
      setValidationSummary(t('anomaly.form.validation.summary'));
      focusFirstFormError();
      return;
    }

    setValidationSummary(null);
    setIsSessionExpired(false);
    try {
      const result = await createMutation.mutateAsync(
        formStateToCreateAnomalyRequest(values)
      );
      leaveTo(`${CATALOG_PATH}/${result.anomaly.slug}`);
    } catch (error: unknown) {
      const failure = resolveAnomalySubmitError(error);
      if (failure.kind === 'session') {
        saveAnomalyDraft(values);
        setIsSessionExpired(true);
      } else if (failure.kind === 'general') {
        setErrors(failure.fieldErrors);
        if (failure.message) {
          showErrorToast(failure.message);
        } else if (Object.keys(failure.fieldErrors).length > 0) {
          showErrorToast({
            title: t('admin.toast_error_title'),
            message: t('toast.form_validation_check')
          });
        } else {
          showErrorToast(error);
        }
      }
    }
  };

  return (
    <div className="anomaly-create-page">
      <header className="anomaly-create-page__header">
        <h1 className="anomaly-create-page__title">
          {t('anomaly.form.title_create')}
        </h1>
        <p className="anomaly-create-page__subtitle">
          {t('anomaly.form.subtitle_create')}
        </p>
      </header>

      <form className="anomaly-form" onSubmit={handleSubmit} noValidate>
        <UnsavedChangesGuard
          when={isDirty && !isLeaving}
          prompt={t('anomaly.form.cancel_confirm')}
        />
        <AnomalyFormFeedback
          validationSummary={validationSummary}
          isSessionExpired={isSessionExpired}
        />

        <fieldset className="anomaly-form__section">
          <legend className="anomaly-form__section-title">
            {t('anomaly.form.title_create')}
          </legend>
          <AnomalyFormFields
            mode="create"
            values={values}
            errors={errors}
            setField={setField}
          />
        </fieldset>

        <AnomalyFormActions
          isPending={createMutation.isPending}
          submitLabel={
            createMutation.isPending ? t('common.creating') : t('common.save')
          }
          onCancel={handleCancel}
        />
      </form>

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('anomaly.form.cancel_confirm')}
        onConfirm={() => leaveTo(CATALOG_PATH)}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
