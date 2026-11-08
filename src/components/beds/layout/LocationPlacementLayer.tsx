import type { JSX, MouseEvent, PointerEvent } from 'react';

import { t } from '../../../i18n/core/t';
import type {
  BrushCandidatePosition,
  BrushDirectrix,
  GroupBoundingBox,
  MarqueeBox
} from '../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';
import { BedBrushPreviewLayer } from '../visualizer/BedBrushPreviewLayer';
import { BedSelectionBoundingBox } from '../visualizer/BedSelectionBoundingBox';
import type { ResolvedBed } from './utils/layoutTypes';

import './locationPlacementLayer.css';

export interface LocationPlacementPreview {
  readonly bedId: string;
  readonly local: { readonly x: number; readonly y: number };
  readonly vitalRadius: number;
  readonly commonName: string;
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export interface LocationPlacementLayerProps {
  readonly beds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly selectedCropId: string | null;
  readonly selectedCropIds?: ReadonlySet<string>;
  readonly preview: LocationPlacementPreview | null;
  readonly brushDirectrix?: BrushDirectrix | null;
  readonly brushCandidates?: readonly BrushCandidatePosition[];
  readonly isBrushDrawing?: boolean;
  readonly brushBedId?: string | null;
  readonly boundingBox?: GroupBoundingBox | null;
  readonly boundingBoxBedId?: string | null;
  readonly marqueeBox?: MarqueeBox | null;
  readonly marqueeBedId?: string | null;
  readonly onSelectCrop: (cropId: string) => void;
  readonly onCropClick?: (
    event: MouseEvent<SVGGElement>,
    cropId: string,
    bedId: string
  ) => void;
  readonly onCropPointerDown: (
    cropId: string,
    bedId: string,
    event: PointerEvent<SVGGElement>
  ) => void;
  readonly onCropPointerMove: (event: PointerEvent<SVGGElement>) => void;
  readonly onCropPointerUp: (event: PointerEvent<SVGGElement>) => void;
}

export default function LocationPlacementLayer({
  beds,
  cropsByBed,
  selectedCropId,
  selectedCropIds = new Set<string>(),
  preview,
  brushDirectrix = null,
  brushCandidates = [],
  isBrushDrawing = false,
  brushBedId = null,
  boundingBox = null,
  boundingBoxBedId = null,
  marqueeBox = null,
  marqueeBedId = null,
  onSelectCrop,
  onCropClick,
  onCropPointerDown,
  onCropPointerMove,
  onCropPointerUp
}: LocationPlacementLayerProps): JSX.Element {
  return (
    <g
      className="location-placement-layer"
      role="group"
      aria-label={t('bed.layout.plants_layer_label')}
    >
      {beds.map((bed) => {
        const crops = cropsByBed.get(bed.id) ?? [];
        const showPreview = preview?.bedId === bed.id;
        const showBrush = isBrushDrawing && brushBedId === bed.id;
        const showBounding =
          boundingBox &&
          (boundingBoxBedId === null || boundingBoxBedId === bed.id);
        const showMarquee = marqueeBox && marqueeBedId === bed.id;

        if (
          crops.length === 0 &&
          !showPreview &&
          !showBrush &&
          !showBounding &&
          !showMarquee
        ) {
          return null;
        }

        return (
          <g
            key={`placement-${bed.id}`}
            transform={`translate(${bed.position.x} ${bed.position.y}) rotate(${bed.rotation})`}
          >
            {crops.map((crop) => {
              const local = crop.position;
              const isSelected =
                crop.id === selectedCropId || selectedCropIds.has(crop.id);
              const classes = [
                'location-placement-layer__node',
                isSelected ? 'location-placement-layer__node--selected' : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <g
                  key={crop.id}
                  className={classes}
                  transform={`translate(${local.x} ${local.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={t('bed.placement.crop_label', {
                    name: crop.commonName,
                    x: String(Math.round(crop.position.x)),
                    y: String(Math.round(crop.position.y))
                  })}
                  aria-pressed={isSelected}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onCropClick) {
                      onCropClick(event, crop.id, bed.id);
                    } else {
                      onSelectCrop(crop.id);
                    }
                  }}
                  onPointerDown={(event) =>
                    onCropPointerDown(crop.id, bed.id, event)
                  }
                  onPointerMove={onCropPointerMove}
                  onPointerUp={onCropPointerUp}
                >
                  <circle
                    className="location-placement-layer__radius"
                    cx={0}
                    cy={0}
                    r={Math.max(crop.vitalRadius, 1)}
                  />
                  <circle
                    className="location-placement-layer__center"
                    cx={0}
                    cy={0}
                    r={2.5}
                  />
                </g>
              );
            })}
            {showPreview && preview && (
              <g
                className={[
                  'location-placement-layer__preview',
                  preview.hasCollision
                    ? 'location-placement-layer__preview--collision'
                    : '',
                  preview.isOutOfBounds
                    ? 'location-placement-layer__preview--out'
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                transform={`translate(${preview.local.x} ${preview.local.y})`}
                pointerEvents="none"
              >
                <circle
                  className="location-placement-layer__radius"
                  cx={0}
                  cy={0}
                  r={Math.max(preview.vitalRadius, 1)}
                />
                <circle
                  className="location-placement-layer__center"
                  cx={0}
                  cy={0}
                  r={2.5}
                />
              </g>
            )}
            {showBrush && (
              <BedBrushPreviewLayer
                directrix={brushDirectrix}
                candidates={brushCandidates}
                isDrawing={isBrushDrawing}
              />
            )}
            {showBounding && (
              <BedSelectionBoundingBox boundingBox={boundingBox} />
            )}
            {showMarquee && marqueeBox && (
              <rect
                x={marqueeBox.minX}
                y={marqueeBox.minY}
                width={marqueeBox.width}
                height={marqueeBox.height}
                className="location-placement-layer__marquee"
                fill="var(--color-primary)"
                fillOpacity={0.12}
                stroke="var(--color-primary)"
                strokeDasharray="3 3"
                strokeWidth={1}
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
