import { useState, type FormEvent } from 'react';

import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Icon from '../../../shared/components/Icon/Icon';
import {
  GARDEN_INPUT_ACTIONS,
  GARDEN_INPUT_CATEGORIES,
  type GardenInputAction,
  type GardenInputCategory
} from '../../../types/GardenInput/GardenInput';
import {
  validateGardenInputForm,
  type GardenInputFormErrors,
  type GardenInputFormValues
} from '../utils/gardenInputValidation';
import RecipeFormSection from './RecipeFormSection';

import './gardenInputForm.css';

export interface GardenInputFormProps {
  readonly initialValues?: Partial<GardenInputFormValues>;
  readonly isCreate: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: GardenInputFormValues) => Promise<void>;
  readonly onCancel: () => void;
  readonly externalError?: string;
}

const defaultValues: GardenInputFormValues = {
  slug: '',
  name: '',
  category: 'defense',
  description: '',
  actions: [],
  activeIngredientsText: '',
  nutrientsText: '',
  targetsText: '',
  recipes: []
};

export default function GardenInputForm({
  initialValues,
  isCreate,
  isSubmitting,
  onSubmit,
  onCancel,
  externalError
}: GardenInputFormProps) {
  const [values, setValues] = useState<GardenInputFormValues>({
    ...defaultValues,
    ...initialValues
  });
  const [errors, setErrors] = useState<GardenInputFormErrors>({});

  function handleActionToggle(action: GardenInputAction) {
    const current = values.actions;
    const exists = current.includes(action);
    const updated = exists
      ? current.filter((a) => a !== action)
      : [...current, action];
    setValues((prev) => ({ ...prev, actions: updated }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateGardenInputForm(values, { isCreate });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit(values);
  }

  return (
    <form className="garden-input-form" onSubmit={handleSubmit} noValidate>
      {externalError && (
        <div className="garden-input-form__alert" role="alert">
          <Icon name="warning" decorative />
          <span>{externalError}</span>
        </div>
      )}

      <div className="garden-input-form__group">
        <label htmlFor="garden-input-name" className="garden-input-form__label">
          {t('gardenInput.form.name')} *
        </label>
        <input
          id="garden-input-name"
          type="text"
          className="garden-input-form__input"
          value={values.name}
          placeholder={t('gardenInput.form.name_placeholder')}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        {errors.name && (
          <span className="garden-input-form__error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="garden-input-form__group">
        <label htmlFor="garden-input-slug" className="garden-input-form__label">
          {t('gardenInput.form.slug')} *
        </label>
        <input
          id="garden-input-slug"
          type="text"
          className="garden-input-form__input"
          value={values.slug}
          disabled={!isCreate}
          placeholder={t('gardenInput.form.slug_placeholder')}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, slug: e.target.value }))
          }
        />
        <span className="garden-input-form__hint">
          {isCreate
            ? t('gardenInput.form.slug_hint')
            : t('gardenInput.form.slug_locked_hint')}
        </span>
        {errors.slug && (
          <span className="garden-input-form__error" role="alert">
            {errors.slug}
          </span>
        )}
      </div>

      <div className="garden-input-form__group">
        <label
          htmlFor="garden-input-category"
          className="garden-input-form__label"
        >
          {t('gardenInput.form.category')} *
        </label>
        <select
          id="garden-input-category"
          className="garden-input-form__select"
          value={values.category}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              category: e.target.value as GardenInputCategory
            }))
          }
        >
          {GARDEN_INPUT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {tValue('gardenInput.categoryValues', cat)}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="garden-input-form__error" role="alert">
            {errors.category}
          </span>
        )}
      </div>

      <fieldset className="garden-input-form__group">
        <legend className="garden-input-form__label">
          {t('gardenInput.form.actions')}
        </legend>
        <div className="garden-input-form__chips">
          {GARDEN_INPUT_ACTIONS.map((act) => {
            const isSelected = values.actions.includes(act);
            return (
              <button
                key={act}
                type="button"
                className={`garden-input-form-chip ${
                  isSelected ? 'garden-input-form-chip--active' : ''
                }`}
                aria-pressed={isSelected}
                onClick={() => handleActionToggle(act)}
              >
                {tValue('gardenInput.actionValues', act)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="garden-input-form__group">
        <label
          htmlFor="garden-input-description"
          className="garden-input-form__label"
        >
          {t('gardenInput.form.description')}
        </label>
        <textarea
          id="garden-input-description"
          className="garden-input-form__textarea"
          value={values.description ?? ''}
          placeholder={t('gardenInput.form.description_placeholder')}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        {errors.description && (
          <span className="garden-input-form__error" role="alert">
            {errors.description}
          </span>
        )}
      </div>

      <div className="garden-input-form__group">
        <label
          htmlFor="garden-input-activeIngredients"
          className="garden-input-form__label"
        >
          {t('gardenInput.form.active_ingredients')}
        </label>
        <input
          id="garden-input-activeIngredients"
          type="text"
          className="garden-input-form__input"
          value={values.activeIngredientsText ?? ''}
          placeholder={t('gardenInput.form.active_ingredients_placeholder')}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              activeIngredientsText: e.target.value
            }))
          }
        />
      </div>

      <div className="garden-input-form__group">
        <label
          htmlFor="garden-input-nutrients"
          className="garden-input-form__label"
        >
          {t('gardenInput.form.nutrients')}
        </label>
        <input
          id="garden-input-nutrients"
          type="text"
          className="garden-input-form__input"
          value={values.nutrientsText ?? ''}
          placeholder={t('gardenInput.form.nutrients_placeholder')}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              nutrientsText: e.target.value
            }))
          }
        />
      </div>

      <div className="garden-input-form__group">
        <label
          htmlFor="garden-input-targets"
          className="garden-input-form__label"
        >
          {t('gardenInput.form.targets')}
        </label>
        <input
          id="garden-input-targets"
          type="text"
          className="garden-input-form__input"
          value={values.targetsText ?? ''}
          placeholder={t('gardenInput.form.targets_placeholder')}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              targetsText: e.target.value
            }))
          }
        />
      </div>

      <RecipeFormSection
        recipes={values.recipes}
        errors={errors}
        onChange={(recipes) => setValues((prev) => ({ ...prev, recipes }))}
      />

      <div className="garden-input-form__actions">
        <button
          type="button"
          className="garden-input-form__cancel-btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('gardenInput.form.cancel')}
        </button>
        <button
          type="submit"
          className="garden-input-form__submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t('gardenInput.form.submitting')
            : isCreate
              ? t('gardenInput.form.submit_create')
              : t('gardenInput.form.submit_edit')}
        </button>
      </div>
    </form>
  );
}
