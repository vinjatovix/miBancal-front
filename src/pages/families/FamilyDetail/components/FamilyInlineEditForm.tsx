import { useState, type SubmitEvent } from 'react';

import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
import { CancelConfirmModal } from '../../../../shared/components/Modal/CancelConfirmModal';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import { useToast } from '../../../../shared/toast/useToast';
import type { Family } from '../../../../types/Family';
import { FamilyFormFields } from '../../components/FamilyForm/FamilyFormFields';
import { useFamilyFormState } from '../../components/FamilyForm/hooks/useFamilyFormState';
import {
  canonicalFamilyToFormState,
  focusFirstFamilyError,
  formStateToUpdateFamilyRequest,
  handleFamilySubmitError
} from '../../components/FamilyForm/utils/familyFormMappers';
import { useUpdateFamily } from '../../hooks/useUpdateFamily';

import '../../components/FamilyForm/familyForm.css';

interface Props {
  readonly family: Family;
  readonly etag: string;
  readonly onCancel: () => void;
  readonly onSuccess: (updated: Family, newEtag: string) => void;
  readonly onReload: () => void;
}

export function FamilyInlineEditForm({
  family,
  etag,
  onCancel,
  onSuccess,
  onReload
}: Props) {
  const { values, errors, isDirty, setField, validate, setErrors } =
    useFamilyFormState(canonicalFamilyToFormState(family));
  const { dismissAll, showErrorToast } = useToast();

  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [validationSummary, setValidationSummary] = useState<string | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const updateMutation = useUpdateFamily();

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

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    dismissAll();

    if (!validate()) {
      setValidationSummary(t('family.form.validation.summary'));
      focusFirstFamilyError();
      return;
    }

    setValidationSummary(null);
    setHasConflict(false);
    try {
      const patch = formStateToUpdateFamilyRequest(values);
      const result = await updateMutation.mutateAsync({
        idOrSlug: family.slug || family.id,
        patch,
        etag
      });
      onSuccess(result.family, result.etag);
    } catch (err: unknown) {
      if (err instanceof PreconditionFailedError) {
        setHasConflict(true);
        showErrorToast(err);
      } else {
        handleFamilySubmitError(err, { setErrors, showErrorToast });
      }
    }
  };

  return (
    <form className="family-form" onSubmit={handleSubmit}>
      {hasConflict && (
        <div role="alert" className="family-form__conflict-banner">
          <strong>{t('family.form.conflict.title')}</strong>
          <p>{t('family.form.conflict.message')}</p>
          <Button variant="primary" onClick={onReload}>
            {t('family.form.conflict.reload_button')}
          </Button>
        </div>
      )}

      <fieldset className="family-form__section">
        <legend className="family-form__section-title">
          {t('family.form.title_edit')}
        </legend>
        <FamilyFormFields values={values} errors={errors} setField={setField} />
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
          disabled={updateMutation.isPending}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending
            ? t('common.saving')
            : t('common.save_changes')}
        </Button>
      </div>

      <CancelConfirmModal
        isOpen={isCancelModalOpen}
        prompt={t('family.form.cancel_confirm')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </form>
  );
}
