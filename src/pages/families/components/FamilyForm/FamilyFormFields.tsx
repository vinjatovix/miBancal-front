import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import type { FamilyFormState } from './types';

interface Props {
  readonly values: FamilyFormState;
  readonly errors: Record<string, string>;
  readonly setField: <K extends keyof FamilyFormState>(
    field: K,
    value: FamilyFormState[K]
  ) => void;
}

export function FamilyFormFields({ values, errors, setField }: Props) {
  const [highlightsText, setHighlightsText] = useState<string>(() =>
    values.highlights.join('\n')
  );
  const [aliasesText, setAliasesText] = useState<string>(() =>
    values.aliases.join(', ')
  );

  const handleHighlightsChange = (text: string) => {
    setHighlightsText(text);
    const list = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    setField('highlights', list);
  };

  const handleAliasesChange = (text: string) => {
    setAliasesText(text);
    const list = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setField('aliases', list);
  };

  return (
    <>
      <div className="family-form__field">
        <label htmlFor="family-name-input" className="family-form__label">
          {t('family.form.fields.name')}
          <span aria-hidden="true"> *</span>
        </label>
        <input
          id="family-name-input"
          type="text"
          className="family-form__input"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          aria-invalid={errors.name ? 'true' : 'false'}
          placeholder={t('family.form.fields.name_placeholder')}
        />
        {errors.name && (
          <span role="alert" className="family-form__error">
            {errors.name}
          </span>
        )}
      </div>

      <div className="family-form__field">
        <label
          htmlFor="family-scientific-name-input"
          className="family-form__label"
        >
          {t('family.form.fields.scientific_name')}
          <span aria-hidden="true"> *</span>
        </label>
        <input
          id="family-scientific-name-input"
          type="text"
          className="family-form__input"
          value={values.scientificName}
          onChange={(e) => setField('scientificName', e.target.value)}
          aria-invalid={errors.scientificName ? 'true' : 'false'}
          placeholder={t('family.form.fields.scientific_name_placeholder')}
        />
        {errors.scientificName && (
          <span role="alert" className="family-form__error">
            {errors.scientificName}
          </span>
        )}
      </div>

      <div className="family-form__field">
        <label htmlFor="family-slug-input" className="family-form__label">
          {t('family.form.fields.slug')}
          <span aria-hidden="true"> *</span>
        </label>
        <input
          id="family-slug-input"
          type="text"
          className="family-form__input"
          value={values.slug}
          onChange={(e) => setField('slug', e.target.value)}
          aria-invalid={errors.slug ? 'true' : 'false'}
          placeholder={t('family.form.fields.slug_placeholder')}
        />
        <span className="family-form__hint">
          {t('family.form.fields.slug_hint')}
        </span>
        {errors.slug && (
          <span role="alert" className="family-form__error">
            {errors.slug}
          </span>
        )}
      </div>

      <div className="family-form__field">
        <label
          htmlFor="family-short-description-input"
          className="family-form__label"
        >
          {t('family.form.fields.short_description')}
          <span aria-hidden="true"> *</span>
        </label>
        <textarea
          id="family-short-description-input"
          className="family-form__textarea"
          rows={3}
          value={values.shortDescription}
          onChange={(e) => setField('shortDescription', e.target.value)}
          aria-invalid={errors.shortDescription ? 'true' : 'false'}
          placeholder={t('family.form.fields.short_description_placeholder')}
        />
        {errors.shortDescription && (
          <span role="alert" className="family-form__error">
            {errors.shortDescription}
          </span>
        )}
      </div>

      <div className="family-form__field">
        <label htmlFor="family-highlights-input" className="family-form__label">
          {t('family.form.fields.highlights')}
          <span aria-hidden="true"> *</span>
        </label>
        <textarea
          id="family-highlights-input"
          className="family-form__textarea"
          rows={3}
          value={highlightsText}
          onChange={(e) => handleHighlightsChange(e.target.value)}
          aria-invalid={errors.highlights ? 'true' : 'false'}
          placeholder={t('family.form.fields.highlights_placeholder')}
        />
        {errors.highlights && (
          <span role="alert" className="family-form__error">
            {errors.highlights}
          </span>
        )}
      </div>

      <div className="family-form__field">
        <label htmlFor="family-aliases-input" className="family-form__label">
          {t('family.form.fields.aliases')}
        </label>
        <input
          id="family-aliases-input"
          type="text"
          className="family-form__input"
          value={aliasesText}
          onChange={(e) => handleAliasesChange(e.target.value)}
          placeholder={t('family.form.fields.aliases_placeholder')}
        />
      </div>

      <div className="family-form__row">
        <div className="family-form__field">
          <label htmlFor="family-order-input" className="family-form__label">
            {t('family.form.fields.order')}
          </label>
          <input
            id="family-order-input"
            type="text"
            className="family-form__input"
            value={values.order}
            onChange={(e) => setField('order', e.target.value)}
            placeholder={t('family.form.fields.order_placeholder')}
            aria-invalid={errors.order ? 'true' : 'false'}
          />
          {errors.order && (
            <span role="alert" className="family-form__error">
              {errors.order}
            </span>
          )}
        </div>

        <div className="family-form__field">
          <label
            htmlFor="family-species-count-input"
            className="family-form__label"
          >
            {t('family.form.fields.species_count')}
          </label>
          <input
            id="family-species-count-input"
            type="number"
            className="family-form__input"
            value={values.speciesCount}
            onChange={(e) => setField('speciesCount', e.target.value)}
            aria-invalid={errors.speciesCount ? 'true' : 'false'}
          />
          {errors.speciesCount && (
            <span role="alert" className="family-form__error">
              {errors.speciesCount}
            </span>
          )}
        </div>
      </div>

      <div className="family-form__field">
        <label
          htmlFor="family-distribution-input"
          className="family-form__label"
        >
          {t('family.form.fields.distribution')}
        </label>
        <input
          id="family-distribution-input"
          type="text"
          className="family-form__input"
          value={values.distribution}
          onChange={(e) => setField('distribution', e.target.value)}
          placeholder={t('family.form.fields.distribution_placeholder')}
          aria-invalid={errors.distribution ? 'true' : 'false'}
        />
        {errors.distribution && (
          <span role="alert" className="family-form__error">
            {errors.distribution}
          </span>
        )}
      </div>
    </>
  );
}
