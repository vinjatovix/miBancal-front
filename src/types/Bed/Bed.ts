import type { Metadata } from '../Metadata';

export type CropGrowthStatus = 'seeded' | 'planted' | 'growing' | 'harvested';
export type PlantInstanceLifecycleStatus = 'active' | 'removed';

export interface PlantCoordinates {
  readonly x: number;
  readonly y: number;
}

export interface PlantInstanceResponse {
  readonly id: string;
  readonly userId: string;
  readonly bedId: string;
  readonly plantId: string;
  readonly position?: PlantCoordinates;
  readonly growthStatus: CropGrowthStatus;
  readonly instanceStatus: PlantInstanceLifecycleStatus;
  readonly plantedAt: string;
  readonly removedAt?: string | null;
  readonly variety?: string;
  readonly notes?: string;
  readonly metadata: Metadata;
  readonly version: number;
}

export interface LocationSummary {
  readonly id: string;
  readonly name: string;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

export interface Bed {
  readonly id: string;
  readonly userId: string;
  readonly locationId: string | null;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly plantInstances: readonly (string | PlantInstanceResponse)[];
  readonly location?: LocationSummary | null;
  readonly metadata: Metadata;
  readonly deleted: boolean;
  readonly deletedAt?: string | null;
  readonly version: number;
}

export interface CreateBedRequest {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly locationId: string;
}

export interface UpdateBedRequest {
  readonly name?: string;
  readonly width?: number;
  readonly height?: number;
  readonly depth?: number;
  readonly locationId?: string;
}
