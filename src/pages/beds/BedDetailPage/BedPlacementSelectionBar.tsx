import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Button from '../../../shared/components/Button/Button';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';

export interface BedPlacementSelectionBarProps {
  readonly selectedCrop: CropPlacementItem | null;
  readonly selectedCropIds: ReadonlySet<string>;
  readonly onDuplicateGroup: () => void;
  readonly onDeleteGroup: () => void;
  readonly onRemoveSingle: (id: string) => void;
}

export function BedPlacementSelectionBar({
  selectedCrop,
  selectedCropIds,
  onDuplicateGroup,
  onDeleteGroup,
  onRemoveSingle
}: BedPlacementSelectionBarProps): JSX.Element | null {
  if (selectedCropIds.size > 1) {
    const countStr = String(selectedCropIds.size);
    return (
      <div
        className="bed-detail-page__selection"
        role="group"
        aria-label={t('bed.placement.group_selected_count', {
          count: countStr
        })}
      >
        <span className="bed-detail-page__selection-name">
          {t('bed.placement.group_selected_count', {
            count: countStr
          })}
        </span>
        <Button variant="secondary" size="sm" onClick={onDuplicateGroup}>
          {t('bed.placement.duplicate_selected_crops', { count: countStr })}
        </Button>
        <Button variant="danger" size="sm" onClick={onDeleteGroup}>
          {t('bed.placement.delete_selected_crops', { count: countStr })}
        </Button>
      </div>
    );
  }

  if (selectedCrop) {
    return (
      <div
        className="bed-detail-page__selection"
        role="group"
        aria-label={t('bed.placement.adjust_label', {
          name: selectedCrop.commonName
        })}
      >
        <span className="bed-detail-page__selection-name">
          {selectedCrop.commonName}
        </span>
        <Button
          variant="danger"
          size="sm"
          icon="delete"
          onClick={() => onRemoveSingle(selectedCrop.id)}
        >
          {t('bed.placement.crop_remove_action', {
            name: selectedCrop.commonName
          })}
        </Button>
      </div>
    );
  }

  return null;
}
