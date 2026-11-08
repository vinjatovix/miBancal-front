import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';

import './cropAdjustmentControls.css';

export interface CropAdjustmentControlsProps {
  readonly selectedCrop: CropPlacementItem | null;
  readonly onAdjust: (dx: number, dy: number) => void;
  readonly onRemove: (id: string) => void;
  readonly onClose: () => void;
}

export default function CropAdjustmentControls({
  selectedCrop,
  onAdjust,
  onRemove,
  onClose
}: CropAdjustmentControlsProps): JSX.Element | null {
  if (!selectedCrop) {
    return null;
  }

  return (
    <div
      className="crop-adjustment-controls"
      role="group"
      aria-label={t('bed.placement.adjust_label', {
        name: selectedCrop.commonName
      })}
    >
      <div className="crop-adjustment-controls__pad">
        <button
          type="button"
          className="crop-adjustment-controls__btn crop-adjustment-controls__btn--up"
          onClick={() => onAdjust(0, -1)}
          aria-label={t('bed.placement.adjust_up')}
        >
          <Icon name="chevron_up" decorative />
        </button>
        <button
          type="button"
          className="crop-adjustment-controls__btn crop-adjustment-controls__btn--left"
          onClick={() => onAdjust(-1, 0)}
          aria-label={t('bed.placement.adjust_left')}
        >
          <Icon name="chevron_left" decorative />
        </button>
        <button
          type="button"
          className="crop-adjustment-controls__btn crop-adjustment-controls__btn--right"
          onClick={() => onAdjust(1, 0)}
          aria-label={t('bed.placement.adjust_right')}
        >
          <Icon name="chevron_right" decorative />
        </button>
        <button
          type="button"
          className="crop-adjustment-controls__btn crop-adjustment-controls__btn--down"
          onClick={() => onAdjust(0, 1)}
          aria-label={t('bed.placement.adjust_down')}
        >
          <Icon name="chevron_down" decorative />
        </button>
      </div>
      <p className="crop-adjustment-controls__hint">
        {t('bed.placement.adjust_step_hint')}
      </p>
      <div className="crop-adjustment-controls__actions">
        <button
          type="button"
          className="crop-adjustment-controls__remove"
          onClick={() => onRemove(selectedCrop.id)}
          aria-label={t('bed.placement.crop_remove_action', {
            name: selectedCrop.commonName
          })}
        >
          <Icon name="delete" decorative />
        </button>
        <button
          type="button"
          className="crop-adjustment-controls__close"
          onClick={onClose}
          aria-label={t('bed.placement.adjust_close')}
        >
          <Icon name="close" decorative />
        </button>
      </div>
    </div>
  );
}
