import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { GroupBoundingBox } from '../../../types/PlantInstance/brushSelectionTypes';
import './bedSelectionBoundingBox.css';

export interface BedSelectionBoundingBoxProps {
  readonly boundingBox: GroupBoundingBox | null;
  readonly isDraggingGroup?: boolean;
  readonly hasConflict?: boolean;
  readonly onDuplicateGroup?: () => void;
  readonly onDeleteGroup?: () => void;
  readonly onClearSelection?: () => void;
}

export function BedSelectionBoundingBox({
  boundingBox,
  isDraggingGroup = false,
  hasConflict = false
}: BedSelectionBoundingBoxProps): JSX.Element | null {
  if (!boundingBox) {
    return null;
  }

  const label = t('bed.placement.group_selected_count', {
    count: String(boundingBox.count)
  });

  const statusClass = hasConflict
    ? 'is-conflict'
    : isDraggingGroup
      ? 'is-dragging'
      : '';

  return (
    <g className="bed-selection-bounding-box" aria-hidden="true">
      <rect
        x={boundingBox.minX}
        y={boundingBox.minY}
        width={boundingBox.width}
        height={boundingBox.height}
        className={`bed-selection-bounding-box__rect ${statusClass}`}
      />
      <text
        x={boundingBox.minX + 2}
        y={Math.max(boundingBox.minY - 3, 6)}
        className="bed-selection-bounding-box__label"
      >
        {label}
      </text>
    </g>
  );
}
