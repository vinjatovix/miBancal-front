import type { JSX, KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type {
  CropPlacementItem,
  SpatialCollision
} from '../../../types/PlantInstance/plantPlacementTypes';
import type {
  BrushCandidatePosition,
  BrushDirectrix,
  GroupBoundingBox,
  MarqueeBox
} from '../../../types/PlantInstance/brushSelectionTypes';
import BedCropsLayer, { type CropPreview } from './BedCropsLayer';
import BedGridLayers from './BedGridLayers';
import { BedBrushPreviewLayer } from './BedBrushPreviewLayer';
import { BedSelectionBoundingBox } from './BedSelectionBoundingBox';
import type { ActiveGridLayers } from './utils/bedGridConfig';

export interface BedVisualizerBedLayerProps {
  readonly originX: number;
  readonly originY: number;
  readonly scale: number;
  readonly width: number;
  readonly height: number;
  readonly activeLayers: ActiveGridLayers;
  readonly crops: readonly CropPlacementItem[];
  readonly collisions: readonly SpatialCollision[];
  readonly perimeterWarnings: ReadonlySet<string>;
  readonly selectedCropId: string | null;
  readonly selectedCropIds: ReadonlySet<string>;
  readonly preview: CropPreview | null;
  readonly directrix: BrushDirectrix | null;
  readonly brushCandidates: readonly BrushCandidatePosition[];
  readonly isBrushDrawing: boolean;
  readonly boundingBox: GroupBoundingBox | null;
  readonly marqueeBox: MarqueeBox | null;
  readonly onSelectCrop?: (id: string | null) => void;
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

export function BedVisualizerBedLayer({
  originX,
  originY,
  scale,
  width,
  height,
  activeLayers,
  crops,
  collisions,
  perimeterWarnings,
  selectedCropId,
  selectedCropIds,
  preview,
  directrix,
  brushCandidates,
  isBrushDrawing,
  boundingBox,
  marqueeBox,
  onSelectCrop,
  onCropClick,
  onCropKeyDown,
  onPointerDownCrop,
  onPointerMoveCrop,
  onPointerUpCrop,
  onKeyboardMoveCrop
}: BedVisualizerBedLayerProps): JSX.Element {
  return (
    <g
      className="bed-canvas__bed-layer"
      transform={`translate(${originX} ${originY}) scale(${scale})`}
    >
      <rect
        className="bed-canvas__bed-rect"
        x={0}
        y={0}
        width={width}
        height={height}
        rx={2}
        ry={2}
      />
      <BedGridLayers
        width={width}
        height={height}
        activeLayers={activeLayers}
      />
      <BedCropsLayer
        crops={crops}
        collisions={collisions}
        perimeterWarnings={perimeterWarnings}
        selectedCropId={selectedCropId}
        selectedCropIds={selectedCropIds}
        preview={preview}
        onSelectCrop={onSelectCrop}
        onCropClick={onCropClick}
        onCropKeyDown={onCropKeyDown}
        onPointerDownCrop={onPointerDownCrop}
        onPointerMoveCrop={onPointerMoveCrop}
        onPointerUpCrop={onPointerUpCrop}
        onKeyboardMoveCrop={onKeyboardMoveCrop}
      />
      <BedBrushPreviewLayer
        directrix={directrix}
        candidates={brushCandidates}
        isDrawing={isBrushDrawing}
      />
      <BedSelectionBoundingBox boundingBox={boundingBox} />
      {marqueeBox ? (
        <rect
          x={marqueeBox.minX}
          y={marqueeBox.minY}
          width={marqueeBox.width}
          height={marqueeBox.height}
          className="bed-canvas__marquee-rect"
        />
      ) : null}
    </g>
  );
}
