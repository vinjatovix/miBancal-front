import { t } from '../../../../i18n/core/t';
import type { PlantFormState } from './types';

interface Props {
  readonly values: PlantFormState;
  readonly errors: Record<string, string>;
  readonly onChange: <K extends keyof PlantFormState>(
    field: K,
    value: PlantFormState[K]
  ) => void;
}

export function PlantTraitsSection({ values, errors, onChange }: Props) {
  return (
    <fieldset className="plant-form__section">
      <legend className="plant-form__section-title">
        {t('plant.form.sections.traits')}
      </legend>

      <div className="plant-form__field">
        <label htmlFor="lifecycle-select" className="plant-form__label">
          {t('plant.form.fields.lifecycle')}
        </label>
        <select
          id="lifecycle-select"
          className="plant-form__select"
          value={values.lifecycle}
          onChange={(e) =>
            onChange('lifecycle', e.target.value as PlantFormState['lifecycle'])
          }
        >
          <option value="annual">
            {t('plant.filters.lifeCycleValues.annual')}
          </option>
          <option value="biennial">
            {t('plant.filters.lifeCycleValues.biennial')}
          </option>
          <option value="perennial">
            {t('plant.filters.lifeCycleValues.perennial')}
          </option>
        </select>
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.height')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            aria-label={`${t('plant.form.fields.height')}: ${t('plant.form.fields.min')}`}
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.heightMin}
            onChange={(e) => onChange('heightMin', e.target.value)}
          />
          <input
            type="number"
            aria-label={`${t('plant.form.fields.height')}: ${t('plant.form.fields.max')}`}
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.heightMax}
            onChange={(e) => onChange('heightMax', e.target.value)}
          />
        </div>
        {errors.height && (
          <span role="alert" className="plant-form__error">
            {errors.height}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.spread')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            aria-label={`${t('plant.form.fields.spread')}: ${t('plant.form.fields.min')}`}
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.spreadMin}
            onChange={(e) => onChange('spreadMin', e.target.value)}
          />
          <input
            type="number"
            aria-label={`${t('plant.form.fields.spread')}: ${t('plant.form.fields.max')}`}
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.spreadMax}
            onChange={(e) => onChange('spreadMax', e.target.value)}
          />
        </div>
        {errors.spread && (
          <span role="alert" className="plant-form__error">
            {errors.spread}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.spacing')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            aria-label={`${t('plant.form.fields.spacing')}: ${t('plant.form.fields.min')}`}
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.spacingMin}
            onChange={(e) => onChange('spacingMin', e.target.value)}
          />
          <input
            type="number"
            aria-label={`${t('plant.form.fields.spacing')}: ${t('plant.form.fields.max')}`}
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.spacingMax}
            onChange={(e) => onChange('spacingMax', e.target.value)}
          />
        </div>
        {errors.spacing && (
          <span role="alert" className="plant-form__error">
            {errors.spacing}
          </span>
        )}
      </div>

      <div className="plant-form__row">
        <label className="plant-form__checkbox-group">
          <input
            type="checkbox"
            checked={Boolean(values.edible)}
            onChange={(e) => onChange('edible', e.target.checked)}
          />
          <span className="plant-form__label">
            {t('plant.form.fields.edible')}
          </span>
        </label>
        <label className="plant-form__checkbox-group">
          <input
            type="checkbox"
            checked={Boolean(values.toxic)}
            onChange={(e) => onChange('toxic', e.target.checked)}
          />
          <span className="plant-form__label">
            {t('plant.form.fields.toxic')}
          </span>
        </label>
      </div>

      {Boolean(values.toxic) && (
        <div className="plant-form__field">
          <label htmlFor="toxicity-notes-input" className="plant-form__label">
            {t('plant.form.fields.toxicity_notes')}
          </label>
          <textarea
            id="toxicity-notes-input"
            className="plant-form__textarea"
            rows={2}
            value={values.toxicityNotes}
            onChange={(e) => onChange('toxicityNotes', e.target.value)}
            placeholder={t('plant.form.fields.toxicity_notes_placeholder')}
          />
        </div>
      )}
    </fieldset>
  );
}
