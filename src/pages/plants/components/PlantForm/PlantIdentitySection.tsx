import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import { PlantFamilySelect } from './PlantFamilySelect';
import type { PlantFormState } from './types';

interface Props {
  readonly values: PlantFormState;
  readonly errors: Record<string, string>;
  readonly onChange: <K extends keyof PlantFormState>(
    field: K,
    value: PlantFormState[K]
  ) => void;
}

export function PlantIdentitySection({ values, errors, onChange }: Props) {
  const [aliasesText, setAliasesText] = useState<string>(() =>
    values.aliases.join(', ')
  );

  const handleAliasesChange = (text: string) => {
    setAliasesText(text);
    const list = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange('aliases', list);
  };

  return (
    <fieldset className="plant-form__section">
      <legend className="plant-form__section-title">
        {t('plant.form.sections.identity')}
      </legend>
      <div className="plant-form__field">
        <label htmlFor="primary-name-input" className="plant-form__label">
          {t('plant.form.fields.primary_name')}
          <span aria-hidden="true"> *</span>
        </label>
        <input
          id="primary-name-input"
          type="text"
          className="plant-form__input"
          value={values.primaryName}
          onChange={(e) => onChange('primaryName', e.target.value)}
          aria-invalid={errors.primaryName ? 'true' : 'false'}
          placeholder={t('plant.form.fields.primary_name_placeholder')}
        />
        {errors.primaryName && (
          <span role="alert" className="plant-form__error">
            {errors.primaryName}
          </span>
        )}
      </div>

      <div className="plant-form__field">
        <label htmlFor="scientific-name-input" className="plant-form__label">
          {t('plant.form.fields.scientific_name')}
          <span aria-hidden="true"> *</span>
        </label>
        <input
          id="scientific-name-input"
          type="text"
          className="plant-form__input"
          value={values.scientificName}
          onChange={(e) => onChange('scientificName', e.target.value)}
          aria-invalid={errors.scientificName ? 'true' : 'false'}
          placeholder={t('plant.form.fields.scientific_name_placeholder')}
        />
        {errors.scientificName && (
          <span role="alert" className="plant-form__error">
            {errors.scientificName}
          </span>
        )}
      </div>

      <PlantFamilySelect
        value={values.familyId}
        onChange={(famId) => onChange('familyId', famId)}
        error={errors.familyId}
      />

      <div className="plant-form__field">
        <label htmlFor="aliases-input" className="plant-form__label">
          {t('plant.form.fields.aliases')}
        </label>
        <input
          id="aliases-input"
          type="text"
          className="plant-form__input"
          value={aliasesText}
          onChange={(e) => handleAliasesChange(e.target.value)}
          placeholder={t('plant.form.fields.aliases_placeholder')}
        />
      </div>
    </fieldset>
  );
}
