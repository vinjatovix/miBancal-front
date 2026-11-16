import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import type { EditButtonProps } from './types';
import './actionButtons.css';

export default function EditButton({
  onClick,
  disabled = false,
  size = 'md',
  iconOnly = false,
  label,
  ariaLabel,
  title,
  className = ''
}: EditButtonProps) {
  const displayLabel = label ?? t('common.edit');
  const accessibleLabel = ariaLabel ?? displayLabel;

  const classes = [
    'action-btn',
    'action-btn--edit',
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
      disabled={disabled}
      aria-label={accessibleLabel}
      title={title ?? (iconOnly ? accessibleLabel : undefined)}
    >
      <Icon name="edit_note" decorative />
      {!iconOnly && <span>{displayLabel}</span>}
    </button>
  );
}
