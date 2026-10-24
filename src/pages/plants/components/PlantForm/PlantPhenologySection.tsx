import { useState } from 'react';

import { monthNames } from '../../../../i18n/core/monthNames';
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

export function PlantPhenologySection({ values, errors, onChange }: Props) {
  const months = monthNames();
  const [pollinationAgentsText, setPollinationAgentsText] = useState<string>(
    () => values.pollinationAgents.join(', ')
  );

  const handlePollinationAgentsChange = (text: string) => {
    setPollinationAgentsText(text);
    const list = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange('pollinationAgents', list);
  };

  const toggleMonth = (
    listField: 'sowingMonths' | 'floweringMonths' | 'harvestMonths',
    m: number
  ) => {
    const current = values[listField];
    const next = current.includes(m)
      ? current.filter((x) => x !== m)
      : [...current, m].sort((a, b) => a - b);
    onChange(listField, next);
  };

  return (
    <fieldset className="plant-form__section">
      <legend className="plant-form__section-title">
        {t('plant.form.sections.phenology')}
      </legend>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.sowing_months')}
          <span aria-hidden="true"> *</span>
        </span>
        <div
          id="plant-sowing-months-grid"
          tabIndex={errors.sowingMonths ? -1 : undefined}
          aria-invalid={errors.sowingMonths ? 'true' : 'false'}
          className={`plant-form__month-grid ${
            errors.sowingMonths ? 'plant-form__month-grid--invalid' : ''
          }`}
        >
          {months.map(({ displayMonth, short }) => {
            const isSelected = values.sowingMonths.includes(displayMonth);
            return (
              <button
                key={displayMonth}
                type="button"
                className={`plant-form__month-btn ${
                  isSelected ? 'plant-form__month-btn--selected' : ''
                }`}
                onClick={() => toggleMonth('sowingMonths', displayMonth)}
              >
                {short}
              </button>
            );
          })}
        </div>
        {errors.sowingMonths && (
          <span role="alert" className="plant-form__error">
            {errors.sowingMonths}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.seeds_per_hole')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.seedsPerHoleMin}
            onChange={(e) => onChange('seedsPerHoleMin', e.target.value)}
          />
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.seedsPerHoleMax}
            onChange={(e) => onChange('seedsPerHoleMax', e.target.value)}
          />
        </div>
        {errors.seedsPerHole && (
          <span role="alert" className="plant-form__error">
            {errors.seedsPerHole}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.germination_days')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.germinationDaysMin}
            onChange={(e) => onChange('germinationDaysMin', e.target.value)}
          />
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.germinationDaysMax}
            onChange={(e) => onChange('germinationDaysMax', e.target.value)}
          />
        </div>
        {errors.germinationDays && (
          <span role="alert" className="plant-form__error">
            {errors.germinationDays}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.direct_depth')}
        </span>
        <div className="plant-form__row">
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.min')}
            value={values.directDepthMin}
            onChange={(e) => onChange('directDepthMin', e.target.value)}
          />
          <input
            type="number"
            className="plant-form__input"
            placeholder={t('plant.form.fields.max')}
            value={values.directDepthMax}
            onChange={(e) => onChange('directDepthMax', e.target.value)}
          />
        </div>
        {errors.directDepth && (
          <span role="alert" className="plant-form__error">
            {errors.directDepth}
          </span>
        )}
      </div>

      <label className="plant-form__checkbox-group">
        <input
          type="checkbox"
          checked={values.starterEnabled}
          onChange={(e) => onChange('starterEnabled', e.target.checked)}
        />
        <span className="plant-form__label">
          {t('plant.form.fields.starter_enabled')}
        </span>
      </label>

      {values.starterEnabled && (
        <div className="plant-form__field">
          <span className="plant-form__label">
            {t('plant.form.fields.starter_depth')}
          </span>
          <div className="plant-form__row">
            <input
              type="number"
              className="plant-form__input"
              placeholder={t('plant.form.fields.min')}
              value={values.starterDepthMin}
              onChange={(e) => onChange('starterDepthMin', e.target.value)}
            />
            <input
              type="number"
              className="plant-form__input"
              placeholder={t('plant.form.fields.max')}
              value={values.starterDepthMax}
              onChange={(e) => onChange('starterDepthMax', e.target.value)}
            />
          </div>
          {errors.starterDepth && (
            <span role="alert" className="plant-form__error">
              {errors.starterDepth}
            </span>
          )}
        </div>
      )}

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.flowering_months')}
        </span>
        <div className="plant-form__month-grid">
          {months.map(({ displayMonth, short }) => {
            const isSelected = values.floweringMonths.includes(displayMonth);
            return (
              <button
                key={displayMonth}
                type="button"
                className={`plant-form__month-btn ${
                  isSelected ? 'plant-form__month-btn--selected' : ''
                }`}
                onClick={() => toggleMonth('floweringMonths', displayMonth)}
              >
                {short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="plant-form__field">
        <label htmlFor="pollination-type-select" className="plant-form__label">
          {t('plant.form.fields.pollination_type')}
        </label>
        <select
          id="pollination-type-select"
          className="plant-form__select"
          value={values.pollinationType}
          onChange={(e) => onChange('pollinationType', e.target.value)}
        >
          <option value="">
            {t('plant.form.pollination_type_options.none')}
          </option>
          <option value="insect">
            {t('plant.form.pollination_type_options.insect')}
          </option>
          <option value="wind">
            {t('plant.form.pollination_type_options.wind')}
          </option>
          <option value="self">
            {t('plant.form.pollination_type_options.self')}
          </option>
          <option value="water">
            {t('plant.form.pollination_type_options.water')}
          </option>
          <option value="bird">
            {t('plant.form.pollination_type_options.bird')}
          </option>
          <option value="bat">
            {t('plant.form.pollination_type_options.bat')}
          </option>
        </select>
      </div>

      {values.pollinationType && (
        <div className="plant-form__field">
          <label
            htmlFor="pollination-agents-input"
            className="plant-form__label"
          >
            {t('plant.form.fields.pollination_agents')}
          </label>
          <input
            id="pollination-agents-input"
            type="text"
            className="plant-form__input"
            value={pollinationAgentsText}
            onChange={(e) => handlePollinationAgentsChange(e.target.value)}
            placeholder={t('plant.form.fields.pollination_agents_placeholder')}
          />
        </div>
      )}

      <div className="plant-form__field">
        <span className="plant-form__label">
          {t('plant.form.fields.harvest_months')}
        </span>
        <div className="plant-form__month-grid">
          {months.map(({ displayMonth, short }) => {
            const isSelected = values.harvestMonths.includes(displayMonth);
            return (
              <button
                key={displayMonth}
                type="button"
                className={`plant-form__month-btn ${
                  isSelected ? 'plant-form__month-btn--selected' : ''
                }`}
                onClick={() => toggleMonth('harvestMonths', displayMonth)}
              >
                {short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="plant-form__field">
        <label
          htmlFor="harvest-description-input"
          className="plant-form__label"
        >
          {t('plant.form.fields.harvest_description')}
        </label>
        <textarea
          id="harvest-description-input"
          className="plant-form__textarea"
          rows={2}
          value={values.harvestDescription}
          onChange={(e) => onChange('harvestDescription', e.target.value)}
          placeholder={t('plant.form.fields.harvest_description_placeholder')}
        />
      </div>
    </fieldset>
  );
}
