import type { JSX } from 'react';

import LayoutViewportControls from '../../../../components/beds/layout/LayoutViewportControls';
import SnapToggle from '../../../../components/beds/layout/SnapToggle';
import LayersPopoverButton from '../../../../components/beds/visualizer/LayersPopoverButton';
import PlantingToolSelector from '../../../../components/beds/visualizer/PlantingToolSelector';
import type { BedViewportState } from '../../../../components/beds/visualizer/hooks/useBedViewport';
import type { LayoutMode } from '../../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
import type {
  ActiveGridLayers,
  BedGridLayerKey
} from '../../../../components/beds/visualizer/utils/bedGridConfig';
import type { PlantingToolMode } from '../../../../types/PlantInstance/brushSelectionTypes';
import LayoutKeyboardHelp from './LayoutKeyboardHelp';
import LayoutModeSegmentedControl from './LayoutModeSegmentedControl';
import LayoutTopBar from './LayoutTopBar';

export interface LocationLayoutTopBarProps {
  readonly mode: LayoutMode;
  readonly onModeChange: (mode: LayoutMode) => void;
  readonly isPlanting: boolean;
  readonly isPosition: boolean;
  readonly toolMode: PlantingToolMode;
  readonly onSelectToolMode: (mode: PlantingToolMode) => void;
  readonly isSavingPlacement: boolean;
  readonly hasPlantingChanges: boolean;
  readonly pendingPlantingCount: number;
  readonly onSavePlanting: () => void;
  readonly onDiscardPlanting: () => void;
  readonly hasPositionChanges: boolean;
  readonly isSavingPosition: boolean;
  readonly onSavePosition: () => void;
  readonly onDiscardPosition: () => void;
  readonly gridSnapEnabled: boolean;
  readonly onToggleGridSnap: () => void;
  readonly neighborSnapEnabled: boolean;
  readonly onToggleNeighborSnap: () => void;
  readonly showBedNames: boolean;
  readonly onToggleShowNames: () => void;
  readonly showDimensions: boolean;
  readonly onToggleShowDimensions: () => void;
  readonly showPlants: boolean;
  readonly onToggleShowPlants: () => void;
  readonly showCardinalOrientation: boolean;
  readonly onToggleShowCardinalOrientation: () => void;
  readonly showGrids: boolean;
  readonly onToggleGrids: () => void;
  readonly activeGridLayers: ActiveGridLayers;
  readonly onToggleGridLayer: (key: BedGridLayerKey) => void;
  readonly viewport: BedViewportState;
  readonly onFitToView: () => void;
}

export default function LocationLayoutTopBar({
  mode,
  onModeChange,
  isPlanting,
  isPosition,
  toolMode,
  onSelectToolMode,
  isSavingPlacement,
  hasPlantingChanges,
  pendingPlantingCount,
  onSavePlanting,
  onDiscardPlanting,
  hasPositionChanges,
  isSavingPosition,
  onSavePosition,
  onDiscardPosition,
  gridSnapEnabled,
  onToggleGridSnap,
  neighborSnapEnabled,
  onToggleNeighborSnap,
  showBedNames,
  onToggleShowNames,
  showDimensions,
  onToggleShowDimensions,
  showPlants,
  onToggleShowPlants,
  showCardinalOrientation,
  onToggleShowCardinalOrientation,
  showGrids,
  onToggleGrids,
  activeGridLayers,
  onToggleGridLayer,
  viewport,
  onFitToView
}: LocationLayoutTopBarProps): JSX.Element {
  return (
    <LayoutTopBar
      leftZone={
        <LayoutModeSegmentedControl mode={mode} onChange={onModeChange} />
      }
      centerZone={
        isPlanting ? (
          <PlantingToolSelector
            activeMode={toolMode}
            onSelectMode={onSelectToolMode}
            disabled={isSavingPlacement}
          />
        ) : isPosition ? (
          <div
            className="location-layout-page__toolbar-group"
            role="group"
            aria-label={t('bed.placement.tools_toolbar_label')}
          >
            <SnapToggle
              enabled={gridSnapEnabled}
              onToggle={onToggleGridSnap}
              label={t('bed.layout.grid_snap_label')}
            />
            <SnapToggle
              enabled={neighborSnapEnabled}
              onToggle={onToggleNeighborSnap}
              label={t('bed.layout.neighbor_snap_label')}
            />
          </div>
        ) : null
      }
      rightZone={
        <>
          {isPlanting && (
            <div className="location-layout-page__save-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={onDiscardPlanting}
                disabled={!hasPlantingChanges || isSavingPlacement}
              >
                {t('bed.placement.discard_changes')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="save"
                onClick={onSavePlanting}
                disabled={!hasPlantingChanges || isSavingPlacement}
              >
                {isSavingPlacement
                  ? t('bed.placement.saving')
                  : hasPlantingChanges
                    ? t('bed.placement.save_changes_count', {
                        count: String(pendingPlantingCount)
                      })
                    : t('bed.placement.save_changes')}
              </Button>
            </div>
          )}
          {!isPlanting && (isPosition || hasPositionChanges) && (
            <div className="location-layout-page__save-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={onDiscardPosition}
                disabled={!hasPositionChanges || isSavingPosition}
              >
                {t('bed.layout.discard')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="save"
                onClick={onSavePosition}
                disabled={!hasPositionChanges || isSavingPosition}
              >
                {isSavingPosition
                  ? t('bed.layout.saving')
                  : t('bed.layout.save')}
              </Button>
            </div>
          )}
          <LayersPopoverButton
            showNames={showBedNames}
            onToggleNames={onToggleShowNames}
            showDimensions={showDimensions}
            onToggleDimensions={onToggleShowDimensions}
            showPlants={showPlants}
            onTogglePlants={onToggleShowPlants}
            showCardinalOrientation={showCardinalOrientation}
            onToggleCardinalOrientation={onToggleShowCardinalOrientation}
            showGrids={showGrids}
            onToggleGrids={onToggleGrids}
            activeGridLayers={activeGridLayers}
            onToggleGridLayer={onToggleGridLayer}
          />
          <LayoutViewportControls
            viewport={viewport}
            onFitToView={onFitToView}
          />
          <LayoutKeyboardHelp />
        </>
      }
    />
  );
}
