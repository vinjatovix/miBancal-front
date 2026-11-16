import type { Metadata } from '../Metadata';
import type {
  CropGrowthStatus,
  PlantCoordinates,
  PlantInstanceLifecycleStatus,
  PlantInstanceResponse
} from '../PlantInstance/PlantInstance';

export type {
  CropGrowthStatus,
  PlantCoordinates,
  PlantInstanceLifecycleStatus,
  PlantInstanceResponse
};

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
