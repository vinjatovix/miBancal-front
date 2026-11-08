import type {
  ActiveGridLayers,
  BedGridLayerKey
} from '../../../../components/beds/visualizer/utils/bedGridConfig';
import type {
  BrushPatternType,
  PlantingToolMode
} from '../../../../types/PlantInstance/brushSelectionTypes';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';

export interface LocationLayoutToolbarProps {
  readonly isPosition: boolean;
  readonly isPlanting: boolean;
  readonly onToggleMode: () => void;
  readonly onStartPlanting: () => void;
  readonly onStopPlanting: () => void;
  readonly toolMode?: PlantingToolMode;
  readonly brushPattern?: BrushPatternType;
  readonly onSelectToolMode?: (mode: PlantingToolMode) => void;
  readonly onSelectBrushPattern?: (pattern: BrushPatternType) => void;
  readonly selectedCropName: string | null;
  readonly selectedCropCount?: number;
  readonly onRemoveSelectedCrop: () => void;
  readonly onDuplicateSelectedCrops?: () => void;
  readonly onDeleteSelectedCrops?: () => void;
  readonly onClearSelection?: () => void;
  readonly isSavingPlacement: boolean;
  readonly gridSnapEnabled: boolean;
  readonly onToggleGridSnap: () => void;
  readonly neighborSnapEnabled: boolean;
  readonly onToggleNeighborSnap: () => void;
  readonly selectedRotation: number;
  readonly onRotationChange: (rotation: number) => void;
  readonly selectedBed?: ResolvedBed;
  readonly onUnplaceSelected: () => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
  readonly activeGridLayers: ActiveGridLayers;
  readonly onToggleGridLayer: (key: BedGridLayerKey) => void;
  readonly showBedNames: boolean;
  readonly onToggleShowNames: () => void;
  readonly showDimensions: boolean;
  readonly onToggleShowDimensions: () => void;
  readonly showCardinalOrientation: boolean;
  readonly onToggleShowCardinalOrientation: () => void;
  readonly showPlants: boolean;
  readonly onToggleShowPlants: () => void;
  readonly onOpenEdit: () => void;
  readonly canDeleteSelectedBed: boolean;
  readonly isDeletingBed: boolean;
  readonly onOpenDelete: () => void;
}
