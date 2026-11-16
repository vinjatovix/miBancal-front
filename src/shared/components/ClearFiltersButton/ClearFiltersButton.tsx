import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import './clearFiltersButton.css';

export interface ClearFiltersButtonProps {
  readonly onClear: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly testId?: string;
  readonly label?: string;
}

export function ClearFiltersButton({
  onClear,
  disabled = false,
  className = '',
  testId,
  label
}: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      className={`clear-filters-btn ${className}`}
      onClick={onClear}
      disabled={disabled}
      data-testid={testId}
    >
      <Icon name="clear_all" decorative />
      <span>{label ?? t('common.clear_filters')}</span>
    </button>
  );
}
