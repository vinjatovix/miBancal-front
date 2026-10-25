import { useState, type FormEvent } from 'react';

import { t } from '../../../../i18n/core/t';
import { CancelConfirmModal } from '../../../../shared/components/Modal/CancelConfirmModal';
import { ApiError } from '../../../../shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import { useToast } from '../../../../shared/toast/useToast';
import type { Family } from '../../../../types/Family';
import { FamilyFormFields } from '../../components/FamilyForm/FamilyFormFields';
import { useFamilyFormState } from '../../components/FamilyForm/hooks/useFamilyFormState';
import {
  canonicalFamilyToFormState,
  formStateToUpdateFamilyRequest,
  normalizeFamilyApiErrors
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dismissAll();

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
      } else if (err instanceof ApiError) {
        if (err.errors) {
          const { fieldErrors, unmappedErrors } = normalizeFamilyApiErrors(
            err.errors
          );
          setErrors(fieldErrors);
          if (unmappedErrors.length > 0) {
            showErrorToast(unmappedErrors.join('; '));
          } else if (Object.keys(fieldErrors).length === 0) {
            showErrorToast({
              title: t('admin.toast_error_title'),
              message:
                err.status === 409
                  ? t('family.form.duplicate_error')
                  : err.message
            });
          } else {
            showErrorToast({
              title: t('admin.toast_error_title'),
              message: t('toast.form_validation_check')
            });
          }
        } else if (err.status === 409) {
          showErrorToast({
            title: t('admin.toast_error_title'),
            message: t('family.form.duplicate_error')
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
    <form className="family-form" onSubmit={handleSubmit}>
      {hasConflict && (
        <div role="alert" className="family-form__conflict-banner">
          <strong>{t('family.form.conflict.title')}</strong>
          <p>{t('family.form.conflict.message')}</p>
          <button
            type="button"
            className="family-form__btn family-form__btn--submit"
            onClick={onReload}
          >
            {t('family.form.conflict.reload_button')}
          </button>
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
        <button
          type="button"
          className="family-form__btn family-form__btn--cancel"
          onClick={handleCancel}
          disabled={updateMutation.isPending}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="family-form__btn family-form__btn--submit"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending
            ? t('common.saving')
            : t('common.save_changes')}
        </button>
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
