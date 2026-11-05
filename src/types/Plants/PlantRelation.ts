import type { FamilySummary } from '../FamilySummary';
import type { Metadata } from '../Metadata';
import type { PaginationResult } from '../Pagination';

export type PlantRelationType = 'beneficial' | 'detrimental';

export type PlantRelationMechanism =
  | 'pest_repellent'
  | 'pollinator_attractor'
  | 'nitrogen_fixer'
  | 'nutrient_accumulator'
  | 'growth_stimulator'
  | 'trap_crop'
  | 'physical_support'
  | 'shade_provider'
  | 'allelopathy'
  | 'pest_host'
  | 'disease_vector'
  | 'resource_competition';

export interface ProximityDistance {
  readonly minDistanceCm: number;
  readonly maxDistanceCm: number | null;
}

export interface PlantSummary {
  readonly id: string;
  readonly slug: string;
  readonly name: {
    readonly primary: string;
    readonly aliases?: readonly string[];
  };
  readonly scientificName: string;
  readonly genus?: string;
  readonly image?: {
    readonly url: string;
    readonly title?: string;
    readonly source?: string;
  } | null;
}

export type RelationSourceScopeType = 'plant' | 'genus' | 'family';

export type RelationTargetScopeType = RelationSourceScopeType | 'all';

export interface RelationSourceScope {
  readonly scope: RelationSourceScopeType;
  readonly value: string;
}

export interface RelationTargetScope {
  readonly scope: RelationTargetScopeType;
  readonly value?: string;
}

export type RelationAppliesVia = RelationTargetScopeType;

export type RelationRole = 'source' | 'target';

export interface PlantRelation {
  readonly id: string;
  readonly source: RelationSourceScope;
  readonly target: RelationTargetScope;
  readonly sourcePlantId?: string;
  readonly targetPlantId?: string;
  readonly type: PlantRelationType;
  readonly mechanism: PlantRelationMechanism;
  readonly strength: number;
  readonly proximity: ProximityDistance;
  readonly reason: string;
  readonly metadata: Metadata;
  readonly version: number;
  readonly appliesVia?: RelationAppliesVia;
  readonly role?: RelationRole;
  readonly sourcePlant?: PlantSummary;
  readonly targetPlant?: PlantSummary;
  readonly sourceFamily?: FamilySummary;
  readonly targetFamily?: FamilySummary;
}

export interface PaginatedPlantRelationsResponse {
  readonly data: readonly PlantRelation[];
  readonly pagination: PaginationResult;
}

export interface CategorizedPlantRelations {
  readonly benefitsReceived: readonly PlantRelation[];
  readonly benefitsGiven: readonly PlantRelation[];
  readonly incompatibilities: readonly PlantRelation[];
}

export type RelationDirection = 'incoming' | 'outgoing';

export interface PlantCompanionInfo {
  readonly id: string;
  readonly scope: RelationTargetScopeType;
  readonly slug?: string;
  readonly primaryName?: string;
  readonly scientificName?: string;
  readonly imageUrl?: string;
  readonly isAvailable: boolean;
}

export type RelationTabFilter = 'all' | 'beneficial' | 'detrimental';

export interface RelationFilterCounts {
  readonly all: number;
  readonly beneficial: number;
  readonly detrimental: number;
}

export interface PlantRelationListFilters {
  readonly appliesToPlantId?: string;
  readonly plantId?: string;
  readonly sourceScope?: RelationSourceScopeType;
  readonly targetScope?: RelationTargetScopeType;
  readonly genus?: string;
  readonly familyId?: string;
  readonly sourcePlantId?: string;
  readonly targetPlantId?: string;
  readonly type?: PlantRelationType;
  readonly mechanism?: PlantRelationMechanism;
}

export interface PlantRelationListRequest {
  readonly filters?: PlantRelationListFilters;
  readonly include?: readonly string[];
  readonly sort?: string;
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
}

export interface CreatePlantRelationInput {
  readonly id?: string;
  readonly source: RelationSourceScope;
  readonly target: RelationTargetScope;
  readonly type: PlantRelationType;
  readonly mechanism: PlantRelationMechanism;
  readonly strength: number;
  readonly proximity: ProximityDistance;
  readonly reason: string;
}

export interface UpdatePlantRelationInput {
  readonly type?: PlantRelationType;
  readonly mechanism?: PlantRelationMechanism;
  readonly strength?: number;
  readonly proximity?: ProximityDistance;
  readonly reason?: string;
}

export interface PlantRelationWithMeta {
  readonly relation: PlantRelation;
  readonly etag: string;
}
