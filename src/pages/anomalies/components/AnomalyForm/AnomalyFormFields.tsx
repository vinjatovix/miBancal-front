import { t } from '../../../../i18n/core/t';
import type { I18nKey } from '../../../../i18n/core/types';
import { tValue } from '../../../../i18n/core/tValue';
import {
  ANOMALY_CATEGORIES,
  ANOMALY_TEXT_LIST_FIELDS,
  type AnomalyTextListField
} from '../../../../types/Anomaly/Anomaly';
import type { AnomalyFormMode, AnomalyFormState } from './types';

interface Props {
  readonly mode: AnomalyFormMode;
  readonly values: AnomalyFormState;
  readonly errors: Record<string, string>;
  readonly setField: <K extends keyof AnomalyFormState>(
    field: K,
    value: AnomalyFormState[K]
  ) => void;
}

const LIST_PLACEHOLDER_KEYS: Record<AnomalyTextListField, I18nKey> = {
  symptoms: 'anomaly.form.fields.symptoms_placeholder',
  damage: 'anomaly.form.fields.damage_placeholder',
  causes: 'anomaly.form.fields.causes_placeholder',
  affectedCrops: 'anomaly.form.fields.affectedCrops_placeholder',
  prevention: 'anomaly.form.fields.prevention_placeholder',
  treatment: 'anomaly.form.fields.treatment_placeholder',
  naturalEnemies: 'anomaly.form.fields.naturalEnemies_placeholder'
};

const LIST_LABEL_KEYS: Record<AnomalyTextListField, I18nKey> = {
  symptoms: 'anomaly.sections.symptoms',
  damage: 'anomaly.sections.damage',
  causes: 'anomaly.sections.causes',
  affectedCrops: 'anomaly.sections.affectedCrops',
  prevention: 'anomaly.sections.prevention',
  treatment: 'anomaly.sections.treatment',
  naturalEnemies: 'anomaly.sections.naturalEnemies'
};

function FieldError({ message }: { readonly message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="anomaly-form__error">
      {message}
    </span>
  );
}

function TextInput({
  id,
  label,
  value,
  error,
  placeholder,
  required,
  disabled,
  hint,
  onChange
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly hint?: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className="anomaly-form__field">
      <label htmlFor={id} className="anomaly-form__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        className="anomaly-form__input"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        placeholder={placeholder}
      />
      {hint && <span className="anomaly-form__hint">{hint}</span>}
      <FieldError message={error} />
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  error,
  placeholder,
  rows = 3,
  onChange
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className="anomaly-form__field">
      <label htmlFor={id} className="anomaly-form__label">
        {label}
      </label>
      <textarea
        id={id}
        className="anomaly-form__textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        placeholder={placeholder}
      />
      <FieldError message={error} />
    </div>
  );
}

export function AnomalyFormFields({ mode, values, errors, setField }: Props) {
  const isCreate = mode === 'create';

  return (
    <>
      <TextInput
        id="anomaly-name-input"
        label={t('anomaly.form.fields.name')}
        value={values.name}
        error={errors.name}
        placeholder={t('anomaly.form.fields.name_placeholder')}
        required
        onChange={(value) => setField('name', value)}
      />

      <TextInput
        id="anomaly-slug-input"
        label={t('anomaly.form.fields.slug')}
        value={values.slug}
        error={errors.slug}
        placeholder={t('anomaly.form.fields.slug_placeholder')}
        hint={t(
          isCreate
            ? 'anomaly.form.fields.slug_hint'
            : 'anomaly.form.fields.slug_locked_hint'
        )}
        required={isCreate}
        disabled={!isCreate}
        onChange={(value) => setField('slug', value)}
      />

      <div className="anomaly-form__field">
        <label htmlFor="anomaly-category-input" className="anomaly-form__label">
          {t('anomaly.form.fields.category')}
          <span aria-hidden="true"> *</span>
        </label>
        <select
          id="anomaly-category-input"
          className="anomaly-form__input"
          value={values.category}
          onChange={(e) =>
            setField('category', e.target.value as AnomalyFormState['category'])
          }
          aria-invalid={errors.category ? 'true' : 'false'}
        >
          <option value="">
            {t('anomaly.form.fields.category_placeholder')}
          </option>
          {ANOMALY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {tValue('anomaly.categoryValues', category)}
            </option>
          ))}
        </select>
        <FieldError message={errors.category} />
      </div>

      <TextInput
        id="anomaly-scientific-name-input"
        label={t('anomaly.form.fields.scientific_name')}
        value={values.scientificName}
        error={errors.scientificName}
        placeholder={t('anomaly.form.fields.scientific_name_placeholder')}
        onChange={(value) => setField('scientificName', value)}
      />

      <TextArea
        id="anomaly-description-input"
        label={t('anomaly.form.fields.description')}
        value={values.description}
        error={errors.description}
        placeholder={t('anomaly.form.fields.description_placeholder')}
        onChange={(value) => setField('description', value)}
      />

      {ANOMALY_TEXT_LIST_FIELDS.map((field) => (
        <TextArea
          key={field}
          id={`anomaly-${field}-input`}
          label={t(LIST_LABEL_KEYS[field])}
          value={values[field]}
          error={errors[field]}
          placeholder={t(LIST_PLACEHOLDER_KEYS[field])}
          onChange={(value) => setField(field, value)}
        />
      ))}
    </>
  );
}
