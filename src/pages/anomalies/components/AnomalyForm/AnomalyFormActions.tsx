import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';

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
      <Button variant="secondary" onClick={onCancel} disabled={isPending}>
        {t('common.cancel')}
      </Button>
      <Button variant="primary" type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
    </div>
  );
}
