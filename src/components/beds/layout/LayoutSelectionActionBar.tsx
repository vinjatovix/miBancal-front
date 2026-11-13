import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';

import './layoutSelectionActionBar.css';

export interface LayoutSelectionActionBarProps {
  readonly count: number;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
  readonly onClear: () => void;
  readonly disabled?: boolean;
}

export default function LayoutSelectionActionBar({
  count,
  onDuplicate,
  onDelete,
  onClear,
  disabled = false
}: LayoutSelectionActionBarProps): JSX.Element {
  const hasSelection = count > 0;

  return (
    <div
      className="layout-selection-action-bar"
      role="toolbar"
      aria-label={t('bed.layout.floating_actions_label')}
    >
      {hasSelection ? (
        <span className="layout-selection-action-bar__count">
          {t('bed.placement.group_selected_count', { count: String(count) })}
        </span>
      ) : (
        <span className="layout-selection-action-bar__hint">
          {t('bed.placement.group_selection_hint')}
        </span>
      )}

      {hasSelection && (
        <div className="layout-selection-action-bar__actions">
          <button
            type="button"
            className="layout-selection-action-bar__button"
            disabled={disabled}
            onClick={onDuplicate}
          >
            <Icon name="content_copy" decorative />
            <span>{t('bed.layout.duplicate_selection')}</span>
            <kbd
              className="layout-selection-action-bar__kbd"
              aria-hidden="true"
            >
              {t('bed.layout.key_d')}
            </kbd>
          </button>

          <button
            type="button"
            className="layout-selection-action-bar__button layout-selection-action-bar__button--danger"
            disabled={disabled}
            onClick={onDelete}
          >
            <Icon name="delete" decorative />
            <span>{t('bed.layout.delete_selection')}</span>
            <kbd
              className="layout-selection-action-bar__kbd"
              aria-hidden="true"
            >
              {t('bed.layout.key_delete')}
            </kbd>
          </button>

          <button
            type="button"
            className="layout-selection-action-bar__button"
            disabled={disabled}
            onClick={onClear}
          >
            <Icon name="close" decorative />
            <span>{t('bed.layout.clear_selection')}</span>
            <kbd
              className="layout-selection-action-bar__kbd"
              aria-hidden="true"
            >
              {t('bed.layout.key_esc')}
            </kbd>
          </button>
        </div>
      )}
    </div>
  );
}
