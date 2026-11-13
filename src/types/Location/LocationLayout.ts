export interface BedPosition {
  readonly x: number;
  readonly y: number;
}

export interface PlacedBedSummary {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly position: BedPosition;
  readonly rotation: number;
  readonly netOrientation: number;
}

export interface UnplacedBedSummary {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly position: null;
  readonly rotation: number;
}

export interface LocationLayoutSummary {
  readonly id: string;
  readonly name: string;
  readonly northAngle: number | null;
  readonly width: number | null;
  readonly height: number | null;
}

export type CompanionRelationType = 'beneficial' | 'detrimental';

export type CompanionScope = 'intra_bed' | 'cross_bed';

export interface CompanionGraphEdge {
  readonly sourcePlantInstanceId: string;
  readonly targetPlantInstanceId: string;
  readonly sourceBedId: string;
  readonly targetBedId: string;
  readonly relationType: CompanionRelationType;
  readonly mechanism: string;
  readonly strength: number;
  readonly distanceCm: number;
  readonly scope: CompanionScope;
  readonly reason?: string;
}

export interface LocationLayoutResponse {
  readonly location: LocationLayoutSummary;
  readonly placedBeds: readonly PlacedBedSummary[];
  readonly unplacedBeds: readonly UnplacedBedSummary[];
  readonly companionGraph: readonly CompanionGraphEdge[];
}

export interface BedLayoutPlacementInput {
  readonly id: string;
  readonly position: BedPosition | null;
  readonly rotation?: number;
}
