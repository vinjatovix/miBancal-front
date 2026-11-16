import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import type { DeleteButtonProps } from './types';
import './actionButtons.css';

export default function DeleteButton({
  onClick,
  disabled = false,
  isDeleting = false,
  size = 'md',
  iconOnly = false,
  label,
  loadingLabel,
  ariaLabel,
  title,
  className = ''
}: DeleteButtonProps) {
  const defaultLabel = label ?? t('common.delete');
  const displayLabel = isDeleting
    ? (loadingLabel ?? t('common.deleting'))
    : defaultLabel;
  const accessibleLabel = ariaLabel ?? displayLabel;

  const classes = [
    'action-btn',
    'action-btn--danger',
    size === 'sm' && 'action-btn--sm',
    iconOnly && 'action-btn--icon-only',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled || isDeleting}
      aria-label={accessibleLabel}
      title={title ?? (iconOnly ? accessibleLabel : undefined)}
    >
      <Icon name="delete" decorative />
      {!iconOnly && <span>{displayLabel}</span>}
    </button>
  );
}
