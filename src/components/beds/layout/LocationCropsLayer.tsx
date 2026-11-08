import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';
import type { ResolvedBed } from './utils/layoutTypes';

import './locationCropsLayer.css';

export interface LocationCropsLayerProps {
  readonly beds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
}

export default function LocationCropsLayer({
  beds,
  cropsByBed
}: LocationCropsLayerProps): JSX.Element {
  return (
    <g
      className="location-crops-layer"
      role="group"
      aria-label={t('bed.layout.plants_layer_label')}
      pointerEvents="none"
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
              return (
                <g
                  key={crop.id}
                  className="location-crops-layer__node"
                  transform={`translate(${local.x} ${local.y})`}
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
