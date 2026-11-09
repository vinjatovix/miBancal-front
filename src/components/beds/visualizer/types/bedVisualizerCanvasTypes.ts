import type { Bed } from '../../../../types/Bed/Bed';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  CropPlacementItem,
  SpatialCollision
} from '../../../../types/PlantInstance/plantPlacementTypes';
import type {
  BatchCropCreationItem,
  BrushPatternType,
  PlantPlacementInput,
  PlantingToolMode
} from '../../../../types/PlantInstance/brushSelectionTypes';
import type {
  InvalidPlacementReason,
  PlacementEvaluation,
  PlacingPlant
} from '../hooks/useCanvasPlacement';
import type { ActiveGridLayers } from '../utils/bedGridConfig';
import type {
  ActiveAssociationLink,
  AssociationFilterMode
} from '../../associations/types/cropAssociationTypes';

export interface BedVisualizerCanvasProps {
  readonly bed: Bed;
  readonly activeLayers: ActiveGridLayers;
  readonly crops?: readonly CropPlacementItem[];
  readonly collisions?: readonly SpatialCollision[];
  readonly perimeterWarnings?: ReadonlySet<string>;
  readonly selectedCropId?: string | null;
  readonly selectedCropIds?: ReadonlySet<string>;
  readonly associationLinks?: readonly ActiveAssociationLink[];
  readonly associationFilterMode?: AssociationFilterMode;
  readonly showAssociations?: boolean;
  readonly onSelectAssociationLink?: (link: ActiveAssociationLink) => void;
  readonly isPlacingActive?: boolean;
  readonly placingPlant?: PlacingPlant | null;
  readonly activeToolMode?: PlantingToolMode;
  readonly activeBrushPattern?: BrushPatternType;
  readonly activePlantPlacement?: PlantPlacementInput | null;
  readonly evaluatePlacement?: (
    position: Coordinates,
    vitalRadius: number
  ) => PlacementEvaluation;
  readonly onSelectCrop?: (id: string | null) => void;
  readonly onSelectCropIds?: (ids: ReadonlySet<string>) => void;
  readonly onToggleCropSelection?: (id: string) => void;
  readonly onClearSelection?: () => void;
  readonly onMoveCrop?: (id: string, position: Coordinates) => void;
  readonly onDropPlacement?: (plantId: string, position: Coordinates) => void;
  readonly onTapPlacement?: (position: Coordinates) => void;
  readonly onAttemptInvalidPlacement?: (reason: InvalidPlacementReason) => void;
  readonly onApplyBrush?: (items: readonly BatchCropCreationItem[]) => void;
  readonly onAnnounce?: (message: string) => void;
}
