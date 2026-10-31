import { t } from '../../../../i18n/core/t';

interface Props {
  readonly isPending: boolean;
  readonly submitLabel: string;
  readonly onCancel: () => void;
}

export function AnomalyFormActions({
  isPending,
  submitLabel,
  onCancel
}: Props) {
  return (
    <div className="anomaly-form__actions">
      <button
        type="button"
        className="anomaly-form__btn anomaly-form__btn--cancel"
        onClick={onCancel}
        disabled={isPending}
      >
        {t('common.cancel')}
      </button>
      <button
        type="submit"
        className="anomaly-form__btn anomaly-form__btn--submit"
        disabled={isPending}
      >
        {submitLabel}
      </button>
    </div>
  );
}
