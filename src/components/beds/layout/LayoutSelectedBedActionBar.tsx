import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import LayoutGlyph from './LayoutGlyph';

import './layoutSelectedBedActionBar.css';

export interface LayoutSelectedBedActionBarProps {
  readonly bedName: string;
  readonly onRotate: () => void;
  readonly onUnplace: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onDeselect: () => void;
  readonly disabled?: boolean;
}

export default function LayoutSelectedBedActionBar({
  bedName,
  onRotate,
  onUnplace,
  onEdit,
  onDelete,
  onDeselect,
  disabled = false
}: LayoutSelectedBedActionBarProps): JSX.Element {
  return (
    <div
      className="layout-selected-bed-action-bar"
      role="toolbar"
      aria-label={t('bed.layout.floating_actions_label')}
    >
      <span className="layout-selected-bed-action-bar__name" title={bedName}>
        {bedName}
      </span>

      <div className="layout-selected-bed-action-bar__actions">
        <button
          type="button"
          className="layout-selected-bed-action-bar__button"
          disabled={disabled}
          onClick={onRotate}
          aria-label={t('bed.layout.rotate_action')}
          title={t('bed.layout.rotate_action')}
        >
          <LayoutGlyph name="rotate" />
        </button>

        <button
          type="button"
          className="layout-selected-bed-action-bar__button"
          disabled={disabled}
          onClick={onUnplace}
          aria-label={t('bed.layout.unplace_bed')}
          title={t('bed.layout.unplace_bed')}
        >
          <LayoutGlyph name="unplace" />
        </button>

        <button
          type="button"
          className="layout-selected-bed-action-bar__button"
          disabled={disabled}
          onClick={onEdit}
          aria-label={t('bed.layout.edit_bed_action')}
          title={t('bed.layout.edit_bed_action')}
        >
          <LayoutGlyph name="edit" />
        </button>

        <button
          type="button"
          className="layout-selected-bed-action-bar__button layout-selected-bed-action-bar__button--danger"
          disabled={disabled}
          onClick={onDelete}
          aria-label={t('bed.layout.delete_bed_action')}
          title={t('bed.layout.delete_bed_action')}
        >
          <LayoutGlyph name="trash" />
        </button>

        <button
          type="button"
          className="layout-selected-bed-action-bar__button"
          disabled={disabled}
          onClick={onDeselect}
          aria-label={t('bed.layout.deselect_bed')}
          title={t('bed.layout.deselect_bed')}
        >
          <Icon name="close" decorative />
        </button>
      </div>
    </div>
  );
}
