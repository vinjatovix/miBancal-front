import type { JSX, KeyboardEvent, PointerEvent, MouseEvent } from 'react';

import { t } from '../../../i18n/core/t';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';

const STEP_CM = 1;
const FAST_STEP_CM = 10;

const KEY_DELTAS: Record<string, { readonly dx: number; readonly dy: number }> =
  {
    ArrowUp: { dx: 0, dy: -1 },
    ArrowDown: { dx: 0, dy: 1 },
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 }
  };

export interface BedCropNodeProps {
  readonly crop: CropPlacementItem;
  readonly hasCollision?: boolean;
  readonly hasOverflow?: boolean;
  readonly isSelected?: boolean;
  readonly isPreview?: boolean;
  readonly companionCount?: number;
  readonly incompatibilityCount?: number;
  readonly onSelect?: (id: string) => void;
  readonly onCropClick?: (event: MouseEvent<SVGGElement>, id: string) => void;
  readonly onCropKeyDown?: (
    event: KeyboardEvent<SVGGElement>,
    id: string
  ) => void;
  readonly onKeyboardMove?: (id: string, position: Coordinates) => void;
  readonly onPointerDownNode?: (
    id: string,
    event: PointerEvent<SVGGElement>
  ) => void;
  readonly onPointerMoveNode?: (event: PointerEvent<SVGGElement>) => void;
  readonly onPointerUpNode?: (event: PointerEvent<SVGGElement>) => void;
}

function cropLabel(
  crop: CropPlacementItem,
  hasCollision: boolean,
  hasOverflow: boolean,
  companionCount = 0,
  incompatibilityCount = 0
): string {
  const values = {
    name: crop.commonName,
    x: String(Math.round(crop.position.x)),
    y: String(Math.round(crop.position.y))
  };
  let base: string;
  if (hasCollision) {
    base = t('bed.placement.crop_label_collision', values);
  } else if (hasOverflow) {
    base = t('bed.placement.crop_label_overflow', values);
  } else {
    base = t('bed.placement.crop_label', values);
  }

  const associationParts: string[] = [];
  if (companionCount > 0) {
    associationParts.push(
      t('bed.associations.crop_companions_count', { count: companionCount })
    );
  }
  if (incompatibilityCount > 0) {
    associationParts.push(
      t('bed.associations.crop_incompatibilities_count', {
        count: incompatibilityCount
      })
    );
  }

  if (associationParts.length > 0) {
    return `${base}, ${associationParts.join(', ')}`;
  }
  return base;
}

export default function BedCropNode({
  crop,
  hasCollision = false,
  hasOverflow = false,
  isSelected = false,
  isPreview = false,
  companionCount = 0,
  incompatibilityCount = 0,
  onSelect,
  onCropClick,
  onCropKeyDown,
  onKeyboardMove,
  onPointerDownNode,
  onPointerMoveNode,
  onPointerUpNode
}: BedCropNodeProps): JSX.Element {
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.shiftKey && event.key === ' ' && onCropKeyDown) {
      onCropKeyDown(event, crop.id);
      return;
    }
    const delta = KEY_DELTAS[event.key];
    if (!delta || !onKeyboardMove) return;
    event.preventDefault();
    const step = event.shiftKey ? FAST_STEP_CM : STEP_CM;
    onKeyboardMove(crop.id, {
      x: crop.position.x + delta.dx * step,
      y: crop.position.y + delta.dy * step
    });
  };

  const classes = [
    'bed-crop-node',
    hasCollision ? 'bed-crop-node--collision' : '',
    hasOverflow ? 'bed-crop-node--overflow' : '',
    isSelected ? 'bed-crop-node--selected' : '',
    isPreview ? 'bed-crop-node--preview' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const label = cropLabel(
    crop,
    hasCollision,
    hasOverflow,
    companionCount,
    incompatibilityCount
  );

  return (
    <g
      className={classes}
      transform={`translate(${crop.position.x} ${crop.position.y})`}
      role={isPreview ? undefined : 'button'}
      tabIndex={isPreview ? undefined : 0}
      aria-label={isPreview ? undefined : label}
      aria-pressed={isPreview ? undefined : isSelected}
      onClick={
        isPreview
          ? undefined
          : (event) => {
              if (onCropClick) {
                onCropClick(event, crop.id);
              } else {
                event.stopPropagation();
                onSelect?.(crop.id);
              }
            }
      }
      onPointerDown={
        isPreview ? undefined : (event) => onPointerDownNode?.(crop.id, event)
      }
      onPointerMove={isPreview ? undefined : onPointerMoveNode}
      onPointerUp={isPreview ? undefined : onPointerUpNode}
      onKeyDown={isPreview ? undefined : handleKeyDown}
    >
      <circle
        className="bed-crop-node__radius"
        cx={0}
        cy={0}
        r={Math.max(crop.vitalRadius, 1)}
      />
      <circle className="bed-crop-node__center" cx={0} cy={0} r={2.5} />
      <text className="bed-crop-node__label" x={0} y={-crop.vitalRadius - 2}>
        {crop.commonName}
      </text>
    </g>
  );
}
