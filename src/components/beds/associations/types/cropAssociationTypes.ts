import type { PlantRelation } from '../../../../types/Plants/PlantRelation';

export type AssociationScope = 'intra_bed' | 'cross_bed';
export type AssociationVisualPolarity = 'beneficial' | 'detrimental';
export type AssociationFilterMode = 'all' | 'detrimental_only';

export interface AssociationCropPoint {
  readonly id: string;
  readonly plantId: string;
  readonly bedId: string;
  readonly commonName: string;
  readonly scientificName?: string;
  readonly familyId?: string;
  readonly genus?: string;
  readonly x: number;
  readonly y: number;
  readonly vitalRadius: number;
}

export interface ActiveAssociationLink {
  readonly id: string;
  readonly cropA: AssociationCropPoint;
  readonly cropB: AssociationCropPoint;
  readonly distanceCm: number;
  readonly effectiveReachCm: number;
  readonly scope: AssociationScope;
  readonly relations: readonly PlantRelation[];
  readonly visualPolarity: AssociationVisualPolarity;
  readonly isWarningPriority: boolean;
  readonly midpoint: { readonly x: number; readonly y: number };
}

export interface BotanicalRelationIndex {
  readonly relationsBySpeciesPair: ReadonlyMap<
    string,
    readonly PlantRelation[]
  >;
  readonly hasData: boolean;
  readonly isLoading: boolean;
}

export interface AssociationLayerState {
  readonly showAssociations: boolean;
  readonly filterMode: AssociationFilterMode;
  readonly inspectedLink: ActiveAssociationLink | null;
}

export interface CropAssociationEngineOptions {
  readonly defaultMaxDistanceCm?: number;
  readonly hysteresisCm?: number;
}

export interface ComputeAssociationsParams {
  readonly crops: readonly AssociationCropPoint[];
  readonly relationIndex: BotanicalRelationIndex;
  readonly options?: CropAssociationEngineOptions;
}

export interface BedAssociationsLayerProps {
  readonly links: readonly ActiveAssociationLink[];
  readonly filterMode?: AssociationFilterMode;
  readonly onSelectLink?: (link: ActiveAssociationLink) => void;
}

export interface LocationAssociationsLayerProps {
  readonly links: readonly ActiveAssociationLink[];
  readonly filterMode?: AssociationFilterMode;
  readonly highlightCropId?: string | null;
  readonly onSelectLink?: (link: ActiveAssociationLink) => void;
}

export interface CropAssociationInspectionModalProps {
  readonly link: ActiveAssociationLink | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}
