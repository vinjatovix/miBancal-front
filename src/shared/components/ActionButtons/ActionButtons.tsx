import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import './actionButtons.css';

export interface ActionButtonProps {
  readonly onClick?: () => void;
  readonly ariaLabel?: string;
  readonly label?: string;
  readonly disabled?: boolean;
  readonly iconOnly?: boolean;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

export interface DeleteButtonProps extends ActionButtonProps {
  readonly isDeleting?: boolean;
  readonly loadingLabel?: string;
}

export function EditButton({
  onClick,
  ariaLabel,
  label,
  disabled,
  iconOnly = false,
  size = 'md',
  className = ''
}: ActionButtonProps) {
  const defaultLabel = t('common.edit');
  const finalLabel = label ?? defaultLabel;
  const sizeClass = size === 'sm' ? 'action-btn--sm' : '';

  return (
    <button
      type="button"
      className={`action-btn ${sizeClass} ${iconOnly ? 'action-btn--icon-only' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? finalLabel}
      title={iconOnly ? (ariaLabel ?? finalLabel) : undefined}
    >
      <Icon name="edit_note" decorative />
      {!iconOnly && <span>{finalLabel}</span>}
    </button>
  );
}

export function DeleteButton({
  onClick,
  ariaLabel,
  label,
  disabled,
  isDeleting,
  loadingLabel,
  iconOnly = false,
  size = 'md',
  className = ''
}: DeleteButtonProps) {
  const defaultLabel = t('common.delete');
  const finalLabel = isDeleting
    ? (loadingLabel ?? t('common.deleting'))
    : (label ?? defaultLabel);
  const isDisabled = disabled || isDeleting;
  const sizeClass = size === 'sm' ? 'action-btn--sm' : '';

  return (
    <button
      type="button"
      className={`action-btn action-btn--danger ${sizeClass} ${iconOnly ? 'action-btn--icon-only' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel ?? finalLabel}
      title={iconOnly ? (ariaLabel ?? finalLabel) : undefined}
    >
      <Icon name="delete" decorative />
      {!iconOnly && <span>{finalLabel}</span>}
    </button>
  );
}
