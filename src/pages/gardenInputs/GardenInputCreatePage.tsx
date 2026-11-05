import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { ApiError } from '../../shared/errors/ApiError';
import GardenInputForm from './components/GardenInputForm';
import { useCreateGardenInput } from './hooks/useCreateGardenInput';
import {
  toCreateRequest,
  type GardenInputFormValues
} from './utils/gardenInputValidation';

import './gardenInputCreatePage.css';

export default function GardenInputCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateGardenInput();
  const [serverError, setServerError] = useState<string | undefined>();

  async function handleSubmit(values: GardenInputFormValues) {
    setServerError(undefined);
    try {
      const payload = toCreateRequest(values);
      const result = await createMutation.mutateAsync(payload);
      navigate(`/garden-inputs/${result.gardenInput.slug}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError(t('gardenInput.form.duplicate_error'));
          return;
        }
        setServerError(err.message || t('gardenInput.form.errors.save_error'));
        return;
      }
      setServerError(t('gardenInput.form.errors.save_error'));
    }
  }

  function handleCancel() {
    navigate('/garden-inputs');
  }

  return (
    <div className="garden-input-create-page">
      <div className="garden-input-create-page__header">
        <h1>{t('gardenInput.form.title_create')}</h1>
        <p className="garden-input-create-page__subtitle">
          {t('gardenInput.form.subtitle_create')}
        </p>
      </div>

      <GardenInputForm
        isCreate={true}
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        externalError={serverError}
      />
    </div>
  );
}
