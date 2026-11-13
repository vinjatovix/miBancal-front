import type { Coordinates, CropGrowthStatus } from './PlantInstance';

export interface CropPlacementItem {
  readonly id: string;
  readonly bedId: string;
  readonly plantId: string;
  readonly commonName: string;
  readonly scientificName?: string;
  readonly position: Coordinates;
  readonly vitalRadius: number;
  readonly growthStatus: CropGrowthStatus;
  readonly etag?: string;
  readonly version: number;
  readonly isNew?: boolean;
  readonly hasMoved?: boolean;
  readonly familyId?: string;
  readonly familyName?: string;
  readonly genus?: string;
}

export interface SpatialCollision {
  readonly cropIdA: string;
  readonly cropIdB: string;
  readonly distance: number;
  readonly requiredDistance: number;
}

export interface PerimeterEvaluation {
  readonly cropId: string;
  readonly isCenterInside: boolean;
  readonly isOverflowing: boolean;
  readonly overflowEdges: {
    readonly left: boolean;
    readonly right: boolean;
    readonly top: boolean;
    readonly bottom: boolean;
  };
}

export interface BedPlacementDraft {
  readonly bedId: string;
  readonly initialCrops: readonly CropPlacementItem[];
  readonly currentCrops: readonly CropPlacementItem[];
  readonly pendingCreations: readonly CropPlacementItem[];
  readonly pendingUpdates: readonly CropPlacementItem[];
  readonly pendingDeletions: readonly CropPlacementItem[];
  readonly selectedCropId: string | null;
  readonly collisions: readonly SpatialCollision[];
  readonly perimeterWarnings: ReadonlySet<string>;
  readonly hasChanges: boolean;
  readonly isSaving: boolean;
  readonly saveError: string | null;
}
