import type { JSX } from 'react';

import SnapToggle from '../../../../components/beds/layout/SnapToggle';
import PlantingToolSelector from '../../../../components/beds/visualizer/PlantingToolSelector';
import type { LayoutMode } from '../../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
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
  readonly onExportPdf: () => void;
  readonly exportDisabled?: boolean;
  readonly isMobile?: boolean;
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
  onExportPdf,
  exportDisabled = false,
  isMobile = false
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
          {isPosition && (
            <div
              className="layout-snap-toggle-group"
              role="group"
              aria-label={t('bed.layout.snap_group_label')}
            >
              <SnapToggle
                enabled={gridSnapEnabled}
                onToggle={onToggleGridSnap}
                glyph="magnet-grid"
                label={t('bed.layout.grid_snap_label')}
                shortLabel={t('bed.layout.grid_snap_short')}
                iconOnly={isMobile}
              />
              <SnapToggle
                enabled={neighborSnapEnabled}
                onToggle={onToggleNeighborSnap}
                glyph="magnet-beds"
                label={t('bed.layout.neighbor_snap_label')}
                shortLabel={t('bed.layout.neighbor_snap_short')}
                iconOnly={isMobile}
              />
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon="description"
            onClick={onExportPdf}
            disabled={exportDisabled}
            aria-label={isMobile ? t('bed.export.button_label') : undefined}
          >
            {isMobile ? '' : t('bed.export.button_label')}
          </Button>
          <LayoutKeyboardHelp />
        </>
      }
    />
  );
}
