import type { Metadata } from '../Metadata';
import type { PaginationResult } from '../Pagination';

export type CropGrowthStatus = 'seeded' | 'planted' | 'growing' | 'harvested';
export type PlantInstanceLifecycleStatus = 'active' | 'removed';

export interface Coordinates {
  readonly x: number;
  readonly y: number;
}

export type PlantCoordinates = Coordinates;

export interface PlacePlantInstance {
  readonly id: string;
  readonly bedId: string;
  readonly plantId: string;
  readonly position?: Coordinates;
  readonly growthStatus?: CropGrowthStatus;
  readonly plantedAt?: string;
  readonly variety?: string;
  readonly notes?: string;
}

export interface UpdatePlantInstance {
  readonly position?: Coordinates;
  readonly growthStatus?: CropGrowthStatus;
  readonly variety?: string | null;
  readonly notes?: string | null;
}

export interface PlantInstanceResponse {
  readonly id: string;
  readonly userId: string;
  readonly bedId: string;
  readonly plantId: string;
  readonly position?: Coordinates;
  readonly growthStatus: CropGrowthStatus;
  readonly instanceStatus: PlantInstanceLifecycleStatus;
  readonly plantedAt: string;
  readonly removedAt?: string;
  readonly variety?: string;
  readonly notes?: string;
  readonly metadata: Metadata;
  readonly version: number;
}

export interface PaginatedPlantInstances {
  readonly data: readonly PlantInstanceResponse[];
  readonly pagination: PaginationResult;
}

export interface BatchPlacePlantInstanceItem {
  readonly id: string;
  readonly plantId: string;
  readonly position?: Coordinates;
  readonly growthStatus?: CropGrowthStatus;
  readonly variety?: string | null;
  readonly notes?: string | null;
}

export interface BatchPlacePlantInstancesRequest {
  readonly bedId: string;
  readonly items: readonly BatchPlacePlantInstanceItem[];
}

export interface BatchUpdatePlantInstanceItem {
  readonly id: string;
  readonly version: number;
  readonly position?: Coordinates;
  readonly growthStatus?: CropGrowthStatus;
  readonly variety?: string | null;
  readonly notes?: string | null;
}

export interface BatchUpdatePlantInstancesRequest {
  readonly items: readonly BatchUpdatePlantInstanceItem[];
}

export interface BatchRemovePlantInstanceItem {
  readonly id: string;
  readonly version: number;
}

export interface BatchRemovePlantInstancesRequest {
  readonly items: readonly BatchRemovePlantInstanceItem[];
}

export interface SpatialConflictErrorPayload {
  readonly message: string;
  readonly errors?: Record<string, string>;
}
