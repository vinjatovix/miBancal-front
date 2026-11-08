import type { JSX } from 'react';

import BedRotationControl from '../../../../components/beds/layout/BedRotationControl';
import LayoutModeToggle from '../../../../components/beds/layout/LayoutModeToggle';
import LayoutSaveBar from '../../../../components/beds/layout/LayoutSaveBar';
import SnapToggle from '../../../../components/beds/layout/SnapToggle';
import { BedCanvasToolSelector } from '../../../../components/beds/visualizer/BedCanvasToolSelector';
import BedGridControls from '../../../../components/beds/visualizer/BedGridControls';
import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
import DeleteButton from '../../../../shared/components/ActionButtons/DeleteButton';
import EditButton from '../../../../shared/components/ActionButtons/EditButton';
import type { LocationLayoutToolbarProps } from './locationLayoutToolbarTypes';

export type { LocationLayoutToolbarProps };

export default function LocationLayoutToolbar({
  isPosition,
  isPlanting,
  onToggleMode,
  onStartPlanting,
  onStopPlanting,
  toolMode,
  brushPattern,
  onSelectToolMode,
  onSelectBrushPattern,
  selectedCropName,
  selectedCropCount = 0,
  onRemoveSelectedCrop,
  onDuplicateSelectedCrops,
  onDeleteSelectedCrops,
  onClearSelection,
  isSavingPlacement,
  gridSnapEnabled,
  onToggleGridSnap,
  neighborSnapEnabled,
  onToggleNeighborSnap,
  selectedRotation,
  onRotationChange,
  selectedBed,
  onUnplaceSelected,
  dirty,
  saving,
  onSave,
  onDiscard,
  activeGridLayers,
  onToggleGridLayer,
  showBedNames,
  onToggleShowNames,
  showDimensions,
  onToggleShowDimensions,
  showCardinalOrientation,
  onToggleShowCardinalOrientation,
  showPlants,
  onToggleShowPlants,
  onOpenEdit,
  canDeleteSelectedBed,
  isDeletingBed,
  onOpenDelete
}: LocationLayoutToolbarProps): JSX.Element {
  return (
    <div
      className="location-layout-page__toolbar"
      role="toolbar"
      aria-label={t('bed.layout.mode_group_label')}
    >
      <LayoutModeToggle active={isPosition} onToggle={onToggleMode} />
      <span
        className="location-layout-page__toolbar-divider"
        aria-hidden="true"
      />
      {isPlanting ? (
        <div className="location-layout-page__toolbar-group">
          <BedGridControls
            activeLayers={activeGridLayers}
            onToggleLayer={onToggleGridLayer}
          />
          {onSelectToolMode && onSelectBrushPattern ? (
            <BedCanvasToolSelector
              activeMode={toolMode ?? 'plant-single'}
              activeBrushPattern={brushPattern ?? 'single-row'}
              onSelectMode={onSelectToolMode}
              onSelectBrushPattern={onSelectBrushPattern}
              disabled={isSavingPlacement}
            />
          ) : null}
          {selectedCropCount > 1 ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onDuplicateSelectedCrops}
                disabled={isSavingPlacement}
              >
                {t('bed.placement.duplicate_selected_crops', {
                  count: String(selectedCropCount)
                })}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onDeleteSelectedCrops}
                disabled={isSavingPlacement}
              >
                {t('bed.placement.delete_selected_crops', {
                  count: String(selectedCropCount)
                })}
              </Button>
              <Button
                variant="neutral"
                size="sm"
                onClick={onClearSelection}
                disabled={isSavingPlacement}
              >
                {t('bed.placement.clear_selection')}
              </Button>
            </>
          ) : selectedCropName ? (
            <Button
              variant="danger"
              size="sm"
              icon="delete"
              onClick={onRemoveSelectedCrop}
              disabled={isSavingPlacement}
            >
              {t('bed.placement.crop_remove_action', {
                name: selectedCropName
              })}
            </Button>
          ) : null}
          <div className="location-layout-page__toolbar-spacer" />
          <Button variant="secondary" onClick={onStopPlanting}>
            {t('bed.layout.plants_mode_done')}
          </Button>
        </div>
      ) : isPosition ? (
        <>
          <div className="location-layout-page__toolbar-group">
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
            <BedRotationControl
              value={selectedRotation}
              onChange={onRotationChange}
              disabled={!selectedBed}
            />
            {selectedBed && (
              <Button variant="neutral" onClick={onUnplaceSelected}>
                {t('bed.layout.unplace_action', { name: selectedBed.name })}
              </Button>
            )}
          </div>
          <div className="location-layout-page__toolbar-spacer" />
          <LayoutSaveBar
            dirty={dirty}
            saving={saving}
            onSave={onSave}
            onDiscard={onDiscard}
          />
        </>
      ) : (
        <>
          <BedGridControls
            activeLayers={activeGridLayers}
            onToggleLayer={onToggleGridLayer}
          />
          <div className="location-layout-page__toolbar-group">
            <SnapToggle
              enabled={showBedNames}
              onToggle={onToggleShowNames}
              label={t('bed.layout.show_names_label')}
            />
            <SnapToggle
              enabled={showDimensions}
              onToggle={onToggleShowDimensions}
              label={t('bed.layout.show_dimensions_label')}
            />
            <SnapToggle
              enabled={showPlants}
              onToggle={onToggleShowPlants}
              label={t('bed.layout.show_plants_label')}
            />
            <Button
              variant={showCardinalOrientation ? 'secondary' : 'neutral'}
              icon="explore"
              aria-pressed={showCardinalOrientation}
              onClick={onToggleShowCardinalOrientation}
            >
              {t('bed.layout.show_cardinal_label')}
            </Button>
          </div>
          {selectedBed && (
            <>
              <div className="location-layout-page__toolbar-spacer" />
              <div className="location-layout-page__bed-actions">
                <Button variant="secondary" onClick={onStartPlanting}>
                  {t('bed.layout.manage_plants', { name: selectedBed.name })}
                </Button>
                <EditButton
                  ariaLabel={t('bed.layout.edit_bed', {
                    name: selectedBed.name
                  })}
                  onClick={onOpenEdit}
                />
                {canDeleteSelectedBed && (
                  <DeleteButton
                    ariaLabel={t('bed.layout.delete_bed', {
                      name: selectedBed.name
                    })}
                    isDeleting={isDeletingBed}
                    onClick={onOpenDelete}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
