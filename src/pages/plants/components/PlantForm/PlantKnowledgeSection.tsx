import { useState } from 'react';

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

export function PlantKnowledgeSection({ values, errors, onChange }: Props) {
  const [wateringConditionsText, setWateringConditionsText] = useState<string>(
    () => values.wateringConditions.join(', ')
  );
  const [strategicBenefitsText, setStrategicBenefitsText] = useState<string>(
    () => values.strategicBenefits.join(', ')
  );

  const handleWateringConditionsChange = (text: string) => {
    setWateringConditionsText(text);
    const list = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange('wateringConditions', list);
  };

  const handleStrategicBenefitsChange = (text: string) => {
    setStrategicBenefitsText(text);
    const list = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange('strategicBenefits', list);
  };

  return (
    <fieldset className="plant-form__section">
      <legend className="plant-form__section-title">
        {t('plant.form.sections.knowledge')}
      </legend>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.soil_ph')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            step="0.1"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.soilPhMin}
            onChange={(e) => onChange('soilPhMin', e.target.value)}
          />
          <input
            type="number"
            step="0.1"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.soilPhMax}
            onChange={(e) => onChange('soilPhMax', e.target.value)}
          />
        </div>
        {errors.soilPh && (
          <span role="alert" className="plant-form__error">
            {errors.soilPh}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.soil_depth')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.soilDepthMin}
            onChange={(e) => onChange('soilDepthMin', e.target.value)}
          />
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.soilDepthMax}
            onChange={(e) => onChange('soilDepthMax', e.target.value)}
          />
        </div>
        {errors.soilDepth && (
          <span role="alert" className="plant-form__error">
            {errors.soilDepth}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <label htmlFor="root-type-select" className="plant-form__label">
          {t('plant.form.fields.root_type')}
        </label>
        <select
          id="root-type-select"
          className="plant-form__select"
          value={values.rootType}
          onChange={(e) => onChange('rootType', e.target.value)}
        >
          <option value="fibrous">
            {t('plant.filters.rootSystemValues.fibrous')}
          </option>
          <option value="taproot">
            {t('plant.filters.rootSystemValues.taproot')}
          </option>
          <option value="rhizome">
            {t('plant.filters.rootSystemValues.rhizome')}
          </option>
          <option value="tuber">
            {t('plant.filters.rootSystemValues.tuber')}
          </option>
          <option value="adventitious">
            {t('plant.filters.rootSystemValues.adventitious')}
          </option>
          <option value="fasciculate">
            {t('plant.filters.rootSystemValues.fasciculate')}
          </option>
        </select>
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.root_depth')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.rootDepthMin}
            onChange={(e) => onChange('rootDepthMin', e.target.value)}
          />
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.rootDepthMax}
            onChange={(e) => onChange('rootDepthMax', e.target.value)}
          />
        </div>
        {errors.rootDepth && (
          <span role="alert" className="plant-form__error">
            {errors.rootDepth}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.root_spread')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.rootSpreadMin}
            onChange={(e) => onChange('rootSpreadMin', e.target.value)}
          />
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.rootSpreadMax}
            onChange={(e) => onChange('rootSpreadMax', e.target.value)}
          />
        </div>
        {errors.rootSpread && (
          <span role="alert" className="plant-form__error">
            {errors.rootSpread}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <label htmlFor="watering-freq-input" className="plant-form__label">
          {t('plant.form.fields.watering_frequency')}
        </label>
        <input
          id="watering-freq-input"
          type="text"
          className="plant-form__input"
          value={values.wateringFrequency}
          onChange={(e) => onChange('wateringFrequency', e.target.value)}
          placeholder={t('plant.form.fields.watering_frequency_placeholder')}
        />
      </div>

      <div className="plant-form__field">
        <label
          htmlFor="watering-conditions-input"
          className="plant-form__label"
        >
          {t('plant.form.fields.watering_conditions')}
        </label>
        <input
          id="watering-conditions-input"
          type="text"
          className="plant-form__input"
          value={wateringConditionsText}
          onChange={(e) => handleWateringConditionsChange(e.target.value)}
          placeholder={t('plant.form.fields.watering_conditions_placeholder')}
        />
      </div>

      <div className="plant-form__field">
        <label htmlFor="light-hours-input" className="plant-form__label">
          {t('plant.form.fields.light_hours_min')}
        </label>
        <input
          id="light-hours-input"
          type="number"
          min="0"
          max="24"
          className="plant-form__input"
          value={values.lightHoursMin}
          onChange={(e) => onChange('lightHoursMin', e.target.value)}
        />
      </div>

      <div className="plant-form__field">
        <label htmlFor="light-type-select" className="plant-form__label">
          {t('plant.form.fields.light_type')}
        </label>
        <select
          id="light-type-select"
          className="plant-form__select"
          value={values.lightType}
          onChange={(e) => onChange('lightType', e.target.value)}
        >
          <option value="full_sun">
            {t('plant.filters.lightTypeValues.full_sun')}
          </option>
          <option value="partial_shade">
            {t('plant.filters.lightTypeValues.partial_shade')}
          </option>
        </select>
      </div>

      <div className="plant-form__field">
        <label htmlFor="light-preference-select" className="plant-form__label">
          {t('plant.form.fields.light_preference')}
        </label>
        <select
          id="light-preference-select"
          className="plant-form__select"
          value={values.lightPreference}
          onChange={(e) => onChange('lightPreference', e.target.value)}
        >
          <option value="">
            {t('plant.form.light_preference_options.none')}
          </option>
          <option value="morning">
            {t('plant.form.light_preference_options.morning')}
          </option>
          <option value="afternoon">
            {t('plant.form.light_preference_options.afternoon')}
          </option>
          <option value="all_day">
            {t('plant.form.light_preference_options.all_day')}
          </option>
        </select>
      </div>

      <div className="plant-form__field">
        <label htmlFor="strategic-benefits-input" className="plant-form__label">
          {t('plant.form.fields.strategic_benefits')}
        </label>
        <input
          id="strategic-benefits-input"
          type="text"
          className="plant-form__input"
          value={strategicBenefitsText}
          onChange={(e) => handleStrategicBenefitsChange(e.target.value)}
          placeholder={t('plant.form.fields.strategic_benefits_placeholder')}
        />
      </div>
    </fieldset>
  );
}
