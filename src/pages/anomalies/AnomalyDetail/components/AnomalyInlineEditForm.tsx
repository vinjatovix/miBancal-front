import { useState, type FormEvent } from 'react';

import { t } from '../../../../i18n/core/t';
import { CancelConfirmModal } from '../../../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import type { Anomaly } from '../../../../types/Anomaly/Anomaly';
import { AnomalyFormActions } from '../../components/AnomalyForm/AnomalyFormActions';
import { AnomalyFormFeedback } from '../../components/AnomalyForm/AnomalyFormFeedback';
import { AnomalyFormFields } from '../../components/AnomalyForm/AnomalyFormFields';
import { useAnomalyFormState } from '../../components/AnomalyForm/hooks/useAnomalyFormState';
import {
  anomalyToFormState,
  formStateToUpdateAnomalyRequest
} from '../../components/AnomalyForm/utils/anomalyFormMappers';
import { focusFirstFormError } from '../../components/AnomalyForm/utils/focusFirstFormError';
import { resolveAnomalySubmitError } from '../../components/AnomalyForm/utils/resolveAnomalySubmitError';
import { useUpdateAnomaly } from '../../hooks/useUpdateAnomaly';

import '../../components/AnomalyForm/anomalyForm.css';

interface Props {
  readonly anomaly: Anomaly;
  readonly etag: string;
  readonly onCancel: () => void;
  readonly onSuccess: (anomaly: Anomaly) => void;
  readonly onReload: () => void;
}

export function AnomalyInlineEditForm({
  anomaly,
  etag,
  onCancel,
  onSuccess,
  onReload
}: Props) {
  const [initialState] = useState(() => anomalyToFormState(anomaly));
  const { values, errors, isDirty, setField, validate, setErrors } =
    useAnomalyFormState(initialState, 'edit');
  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const updateMutation = useUpdateAnomaly();

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    onCancel();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setValidationSummary(t('anomaly.form.validation.summary'));
      focusFirstFormError();
      return;
    }

    const patch = formStateToUpdateAnomalyRequest(values, initialState);
    if (Object.keys(patch).length === 0) {
      onCancel();
      return;
    }

    setValidationSummary(null);
    setHasConflict(false);
    setIsSessionExpired(false);
    setGeneralError(null);
    try {
      const result = await updateMutation.mutateAsync({
        idOrSlug: anomaly.slug,
        patch,
        etag
      });
      onSuccess(result.anomaly);
    } catch (error: unknown) {
      const failure = resolveAnomalySubmitError(error);
      if (failure.kind === 'conflict') {
        setHasConflict(true);
      } else if (failure.kind === 'session') {
        setIsSessionExpired(true);
      } else {
        setErrors(failure.fieldErrors);
        setGeneralError(failure.message);
      }
    }
  };

  return (
    <form className="anomaly-form" onSubmit={handleSubmit} noValidate>
      <UnsavedChangesGuard
        when={isDirty && !updateMutation.isSuccess}
        prompt={t('anomaly.form.cancel_confirm')}
      />
      {hasConflict && (
        <div role="alert" className="anomaly-form__conflict-banner">
          <strong>{t('anomaly.form.conflict.title')}</strong>
          <p>{t('anomaly.form.conflict.message')}</p>
          <button
            type="button"
            className="anomaly-form__btn anomaly-form__btn--submit"
            onClick={onReload}
          >
            {t('anomaly.form.conflict.reload_button')}
          </button>
        </div>
      )}
      <AnomalyFormFeedback
        generalError={generalError}
        validationSummary={validationSummary}
        isSessionExpired={isSessionExpired}
      />

      <fieldset className="anomaly-form__section">
        <legend className="anomaly-form__section-title">
          {t('anomaly.form.title_edit')}
        </legend>
        <AnomalyFormFields
          mode="edit"
          values={values}
          errors={errors}
          setField={setField}
        />
      </fieldset>

      <AnomalyFormActions
        isPending={updateMutation.isPending}
        submitLabel={
          updateMutation.isPending
            ? t('common.saving')
            : t('common.save_changes')
        }
        onCancel={handleCancel}
      />

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('anomaly.form.cancel_confirm')}
        onConfirm={() => {
          setIsCancelModalOpen(false);
          onCancel();
        }}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </form>
  );
}
