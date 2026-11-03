import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';
import './formButtons.css';

export interface FormAddButtonProps {
  readonly onClick: () => void;
  readonly label: string;
  readonly className?: string;
  readonly ariaLabel?: string;
}

export function FormAddButton({
  onClick,
  label,
  className = '',
  ariaLabel
}: FormAddButtonProps) {
  return (
    <button
      type="button"
      className={`form-add-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
    >
      <Icon name="add" decorative />
      <span>{label}</span>
    </button>
  );
}

export interface FormRemoveButtonProps {
  readonly onClick: () => void;
  readonly ariaLabel: string;
  readonly className?: string;
  readonly title?: string;
  readonly iconOnly?: boolean;
  readonly label?: string;
  readonly iconName?: IconName;
}

export function FormRemoveButton({
  onClick,
  ariaLabel,
  className = '',
  title,
  iconOnly = false,
  label,
  iconName = 'delete'
}: FormRemoveButtonProps) {
  return (
    <button
      type="button"
      className={`form-remove-btn ${iconOnly ? 'form-remove-btn--icon-only' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
    >
      <Icon name={iconName} decorative />
      {!iconOnly && label && <span>{label}</span>}
    </button>
  );
}
