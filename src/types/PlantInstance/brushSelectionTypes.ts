import type { Coordinates } from './PlantInstance';

export type PlantingToolMode = 'select' | 'plant-single' | 'brush';

export type BrushPatternType =
  | 'single-row'
  | 'double-row'
  | 'staggered-triangle';

export interface ActiveToolState {
  readonly mode: PlantingToolMode;
  readonly brushPattern: BrushPatternType;
}

export interface BrushDirectrix {
  readonly start: Coordinates;
  readonly end: Coordinates;
  readonly lengthCm: number;
  readonly unitVector: { readonly x: number; readonly y: number };
  readonly normalVector: { readonly x: number; readonly y: number };
}

export interface BrushStrokeVector extends BrushDirectrix {
  readonly angleRad: number;
}

export type BrushOmissionReason = 'collision' | 'out_of_bounds';

export interface BrushCandidatePosition {
  readonly position: Coordinates;
  readonly vitalRadius: number;
  readonly isValid: boolean;
  readonly omissionReason?: BrushOmissionReason;
  readonly rowIndex: number;
  readonly itemIndex: number;
}

export interface BrushExecutionSummary {
  readonly pattern: BrushPatternType;
  readonly totalCalculated: number;
  readonly plantedCount: number;
  readonly omittedCount: number;
  readonly acceptedPositions: readonly Coordinates[];
  readonly candidates: readonly BrushCandidatePosition[];
}

export interface MarqueeBox {
  readonly start: Coordinates;
  readonly current: Coordinates;
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

export interface GroupBoundingBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
  readonly center: Coordinates;
  readonly count: number;
}

export interface GroupMovePreviewItem {
  readonly id: string;
  readonly local: Coordinates;
  readonly vitalRadius: number;
  readonly commonName: string;
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export interface GroupMovePreview {
  readonly bedId: string;
  readonly items: readonly GroupMovePreviewItem[];
}

export interface GroupDragState {
  readonly initialPositions: ReadonlyMap<string, Coordinates>;
  readonly currentDisplacement: { readonly dx: number; readonly dy: number };
  readonly isValid: boolean;
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export interface PlantPlacementInput {
  readonly plantId: string;
  readonly commonName: string;
  readonly scientificName?: string;
  readonly spacingCmMin?: number;
}

export interface BatchCropCreationItem {
  readonly plant: PlantPlacementInput;
  readonly position: Coordinates;
}

export interface BatchCropMoveItem {
  readonly id: string;
  readonly position: Coordinates;
  readonly version?: number;
}
