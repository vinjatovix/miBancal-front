import type { JSX, KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import { t } from '../../../i18n/core/t';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type {
  CropPlacementItem,
  SpatialCollision
} from '../../../types/PlantInstance/plantPlacementTypes';
import type { ActiveAssociationLink } from '../associations/types/cropAssociationTypes';
import BedCropNode from './BedCropNode';

import './bedCropsLayer.css';

export interface CropPreview {
  readonly position: { readonly x: number; readonly y: number };
  readonly vitalRadius: number;
  readonly commonName: string;
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export interface BedCropsLayerProps {
  readonly crops: readonly CropPlacementItem[];
  readonly collisions: readonly SpatialCollision[];
  readonly perimeterWarnings: ReadonlySet<string>;
  readonly selectedCropId?: string | null;
  readonly selectedCropIds?: ReadonlySet<string>;
  readonly associationLinks?: readonly ActiveAssociationLink[];
  readonly preview?: CropPreview | null;
  readonly onSelectCrop?: (id: string) => void;
  readonly onCropClick?: (event: MouseEvent<SVGGElement>, id: string) => void;
  readonly onCropKeyDown?: (
    event: KeyboardEvent<SVGGElement>,
    id: string
  ) => void;
  readonly onPointerDownCrop?: (
    id: string,
    event: PointerEvent<SVGGElement>
  ) => void;
  readonly onPointerMoveCrop?: (event: PointerEvent<SVGGElement>) => void;
  readonly onPointerUpCrop?: (event: PointerEvent<SVGGElement>) => void;
  readonly onKeyboardMoveCrop?: (id: string, position: Coordinates) => void;
}

function buildCollisionSet(
  collisions: readonly SpatialCollision[]
): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const collision of collisions) {
    ids.add(collision.cropIdA);
    ids.add(collision.cropIdB);
  }
  return ids;
}

export default function BedCropsLayer({
  crops,
  collisions,
  perimeterWarnings,
  selectedCropId,
  selectedCropIds,
  associationLinks = [],
  preview,
  onSelectCrop,
  onCropClick,
  onCropKeyDown,
  onPointerDownCrop,
  onPointerMoveCrop,
  onPointerUpCrop,
  onKeyboardMoveCrop
}: BedCropsLayerProps): JSX.Element {
  const collisionIds = buildCollisionSet(collisions);

  return (
    <g
      className="bed-crops-layer"
      role="group"
      aria-label={t('bed.placement.crops_layer_label')}
    >
      {crops.map((crop) => {
        const isSelected =
          selectedCropId === crop.id ||
          (selectedCropIds?.has(crop.id) ?? false);

        const cropLinks = associationLinks.filter(
          (link) => link.cropA.id === crop.id || link.cropB.id === crop.id
        );
        const companionCount = cropLinks.filter(
          (link) => link.visualPolarity === 'beneficial'
        ).length;
        const incompatibilityCount = cropLinks.filter(
          (link) => link.visualPolarity === 'detrimental'
        ).length;

        return (
          <BedCropNode
            key={crop.id}
            crop={crop}
            hasCollision={collisionIds.has(crop.id)}
            hasOverflow={perimeterWarnings.has(crop.id)}
            isSelected={isSelected}
            companionCount={companionCount}
            incompatibilityCount={incompatibilityCount}
            onSelect={onSelectCrop}
            onCropClick={onCropClick}
            onCropKeyDown={onCropKeyDown}
            onKeyboardMove={onKeyboardMoveCrop}
            onPointerDownNode={onPointerDownCrop}
            onPointerMoveNode={onPointerMoveCrop}
            onPointerUpNode={onPointerUpCrop}
          />
        );
      })}
      {preview && (
        <BedCropNode
          isPreview
          crop={{
            id: '__preview__',
            bedId: '',
            plantId: '',
            commonName: preview.commonName,
            position: preview.position,
            vitalRadius: preview.vitalRadius,
            growthStatus: 'planted',
            version: 0
          }}
          hasCollision={preview.hasCollision}
          hasOverflow={preview.isOutOfBounds}
        />
      )}
    </g>
  );
}
