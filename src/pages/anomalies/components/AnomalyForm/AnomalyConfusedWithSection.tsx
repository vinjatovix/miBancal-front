import { t } from '../../../../i18n/core/t';
import { splitLines } from './utils/anomalyFormLines';

interface Props {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
}

export function AnomalyConfusedWithSection({ value, onChange, error }: Props) {
  const count = splitLines(value)
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <fieldset className="anomaly-form__section">
      <legend>{t('anomaly.form.sections.confused_with')}</legend>

      <div className="anomaly-form__field">
        <label htmlFor="anomaly-confused-with">
          {t('anomaly.form.fields.confused_with')}
        </label>
        <textarea
          id="anomaly-confused-with"
          value={value}
          placeholder={t('anomaly.form.fields.confused_with_placeholder')}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
        <p className="anomaly-form__field-hint">
          {t('anomaly.form.fields.confused_with_hint')}
        </p>
        <p className="anomaly-form__counter">
          {t('anomaly.form.fields.confused_with_count', { count })}
        </p>
        {error && (
          <p className="anomaly-form__field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}
