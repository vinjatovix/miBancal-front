import type { JSX, KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import { t } from '../../../i18n/core/t';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';
import type { ActiveAssociationLink } from '../associations/types/cropAssociationTypes';
import type { ResolvedBed } from './utils/layoutTypes';

import './locationCropsLayer.css';

export interface LocationCropsLayerProps {
  readonly beds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly associationLinks?: readonly ActiveAssociationLink[];
  readonly onSelectLink?: (link: ActiveAssociationLink) => void;
  readonly onSelectCrop?: (cropId: string) => void;
}

export default function LocationCropsLayer({
  beds,
  cropsByBed,
  associationLinks = [],
  onSelectLink,
  onSelectCrop
}: LocationCropsLayerProps): JSX.Element {
  return (
    <g
      className="location-crops-layer"
      role="group"
      aria-label={t('bed.layout.plants_layer_label')}
    >
      {beds.map((bed) => {
        const crops = cropsByBed.get(bed.id) ?? [];
        if (crops.length === 0) return null;
        return (
          <g
            key={`crops-${bed.id}`}
            transform={`translate(${bed.position.x} ${bed.position.y}) rotate(${bed.rotation})`}
          >
            {crops.map((crop) => {
              const local = crop.position;

              const cropLink =
                associationLinks.find(
                  (link) =>
                    (link.cropA.id === crop.id || link.cropB.id === crop.id) &&
                    link.visualPolarity === 'detrimental'
                ) ??
                associationLinks.find(
                  (link) =>
                    link.cropA.id === crop.id || link.cropB.id === crop.id
                );

              const handlePointerDown = (event: PointerEvent<SVGGElement>) => {
                event.stopPropagation();
              };

              const handleClick = (event: MouseEvent<SVGGElement>) => {
                event.stopPropagation();
                if (cropLink && onSelectLink) {
                  onSelectLink(cropLink);
                }
                onSelectCrop?.(crop.id);
              };

              const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  if (cropLink && onSelectLink) {
                    onSelectLink(cropLink);
                  }
                  onSelectCrop?.(crop.id);
                }
              };

              return (
                <g
                  key={crop.id}
                  className="location-crops-layer__node"
                  transform={`translate(${local.x} ${local.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={t('bed.placement.crop_label', {
                    name: crop.commonName,
                    x: String(Math.round(crop.position.x)),
                    y: String(Math.round(crop.position.y))
                  })}
                  onPointerDown={handlePointerDown}
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                >
                  <title>{crop.commonName}</title>
                  <circle
                    className="location-crops-layer__radius"
                    cx={0}
                    cy={0}
                    r={Math.max(crop.vitalRadius, 1)}
                  />
                  <circle
                    className="location-crops-layer__center"
                    cx={0}
                    cy={0}
                    r={2.5}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
