import { useEffect, useMemo, type JSX } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import BedCompassHud from '../../../components/beds/layout/BedCompassHud';
import LayoutScaleBar from '../../../components/beds/layout/LayoutScaleBar';
import LayoutViewportControls from '../../../components/beds/layout/LayoutViewportControls';
import LocationLayoutCanvas from '../../../components/beds/layout/LocationLayoutCanvas';
import PlantPlacementPalette from '../../../components/beds/visualizer/PlantPlacementPalette';
import UnplacedBedsTray from '../../../components/beds/layout/UnplacedBedsTray';
import { useBedViewport } from '../../../components/beds/visualizer/hooks/useBedViewport';
import { rotatedRectVertices } from '../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../i18n/core/t';
import Button from '../../../shared/components/Button/Button';
import { locationKeys } from '../../../shared/reactQuery/locationKeys';
import type { LocationLayoutResponse } from '../../../types/Location/LocationLayout';
import LocationLayoutDialogs from './components/LocationLayoutDialogs';
import LocationLayoutToolbar from './components/LocationLayoutToolbar';
import { useLayoutEditor } from './hooks/useLayoutEditor';
import { useLayoutPlantPlacement } from './hooks/useLayoutPlantPlacement';
import { useLayoutVisibilityControls } from './hooks/useLayoutVisibilityControls';
import { useLocationBedActions } from './hooks/useLocationBedActions';
import { useLocationBedCrops } from './hooks/useLocationBedCrops';

import './locationLayoutPage.css';

export interface LocationLayoutViewProps {
  readonly id: string;
  readonly etag: string;
  readonly layout: LocationLayoutResponse;
}

function computeBedBounds(bed: ResolvedBed): {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
} {
  const vertices = rotatedRectVertices(bed);
  const xs = vertices.map((vertex) => vertex.x);
  const ys = vertices.map((vertex) => vertex.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

export default function LocationLayoutView({
  id,
  etag,
  layout
}: LocationLayoutViewProps): JSX.Element {
  const queryClient = useQueryClient();
  const editor = useLayoutEditor(id, etag, layout);
  const viewport = useBedViewport();
  const [searchParams] = useSearchParams();

  const isPosition = editor.mode === 'position';
  const isPlanting = editor.mode === 'plants';
  const selectedBed = editor.placedBeds.find(
    (bed) => bed.id === editor.selectedId
  );
  const selectedBedId = selectedBed?.id ?? null;

  const visibility = useLayoutVisibilityControls({
    locationId: id,
    etag,
    locationNorthAngle: layout.location.northAngle,
    selectedRotation: editor.selectedRotation,
    hasSelectedBed: selectedBed !== undefined,
    onRotationChange: editor.setSelectedRotation
  });

  const placedBedIds = useMemo(
    () => editor.placedBeds.map((bed) => bed.id),
    [editor.placedBeds]
  );
  const { cropsByBed } = useLocationBedCrops(placedBedIds);
  const placement = useLayoutPlantPlacement({
    beds: editor.placedBeds,
    cropsByBed,
    activeBedId: selectedBedId
  });

  const bedActions = useLocationBedActions({
    locationId: id,
    isPosition,
    selectedBed,
    onDeselectBed: editor.deselectBed
  });

  const bedParam = searchParams.get('bed');
  const { selectBed } = editor;
  useEffect(() => {
    if (bedParam) selectBed(bedParam);
  }, [bedParam, selectBed]);

  const handleStartPlanting = (): void => {
    placement.reset();
    editor.startPlanting(selectedBedId ?? undefined);
    if (selectedBed) {
      viewport.fitToBounds(computeBedBounds(selectedBed), editor.viewBox);
    }
  };
  const handleStopPlanting = (): void => {
    placement.reset();
    editor.stopPlanting();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (
        isPlanting &&
        (e.key === 'Delete' || e.key === 'Backspace') &&
        placement.selectedCropCount > 0
      ) {
        e.preventDefault();
        void placement.deleteSelectedCrops();
      }
      if (isPlanting && e.key === 'Escape') placement.clearSelection();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlanting, placement]);

  return (
    <main className="location-layout-page">
      <header className="location-layout-page__header">
        <div className="location-layout-page__heading">
          <h1 className="location-layout-page__title">
            {t('bed.layout.title', { name: layout.location.name })}
          </h1>
          <p className="location-layout-page__subtitle">
            {t('bed.layout.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => bedActions.setIsCreateOpen(true)}
        >
          {t('bed.layout.new_bed')}
        </Button>
      </header>

      <LocationLayoutToolbar
        isPosition={isPosition}
        isPlanting={isPlanting}
        onToggleMode={editor.toggleMode}
        onStartPlanting={handleStartPlanting}
        onStopPlanting={handleStopPlanting}
        toolMode={placement.toolMode}
        brushPattern={placement.brushPattern}
        onSelectToolMode={placement.setToolMode}
        onSelectBrushPattern={placement.setBrushPattern}
        selectedCropName={placement.selectedCrop?.commonName ?? null}
        selectedCropCount={placement.selectedCropCount}
        onRemoveSelectedCrop={() => {
          if (placement.selectedCrop)
            placement.removeCrop(placement.selectedCrop);
        }}
        onDuplicateSelectedCrops={() => void placement.duplicateSelectedCrops()}
        onDeleteSelectedCrops={() => void placement.deleteSelectedCrops()}
        onClearSelection={placement.clearSelection}
        isSavingPlacement={placement.isSaving}
        gridSnapEnabled={editor.gridSnapEnabled}
        onToggleGridSnap={editor.toggleGridSnap}
        neighborSnapEnabled={editor.neighborSnapEnabled}
        onToggleNeighborSnap={editor.toggleNeighborSnap}
        selectedRotation={editor.selectedRotation}
        onRotationChange={editor.setSelectedRotation}
        selectedBed={selectedBed}
        onUnplaceSelected={editor.unplaceSelected}
        dirty={editor.dirty}
        saving={editor.saving}
        onSave={editor.save}
        onDiscard={editor.discard}
        {...visibility.toolbarProps}
        onOpenEdit={() => bedActions.setIsEditOpen(true)}
        canDeleteSelectedBed={bedActions.canDeleteSelectedBed}
        isDeletingBed={bedActions.isDeletingBed}
        onOpenDelete={() => bedActions.setIsDeleteOpen(true)}
      />

      <div className="location-layout-page__workspace">
        <div className="location-layout-page__canvas">
          <LocationLayoutCanvas
            beds={editor.placedBeds}
            viewBox={editor.viewBox}
            label={t('bed.layout.canvas_label', {
              name: layout.location.name
            })}
            mode={editor.mode}
            selectedId={editor.selectedId}
            viewport={viewport}
            gridLayers={isPosition ? null : visibility.activeGridLayers}
            showNames={visibility.showBedNames}
            showDimensions={visibility.showDimensions}
            northAngle={visibility.effectiveNorthAngle}
            showCardinalOrientation={visibility.showCardinalOrientation}
            floorWidth={layout.location.width}
            floorHeight={layout.location.height}
            cropsByBed={cropsByBed}
            showPlants={visibility.showPlants}
            placementPreview={placement.preview}
            selectedCropId={placement.selectedCropId}
            selectedCropIds={placement.selectedCropIds}
            toolMode={placement.toolMode}
            brushDirectrix={placement.brush.directrix}
            brushCandidates={placement.brush.candidates}
            isBrushDrawing={placement.brush.isDrawing}
            brushBedId={placement.brush.strokeBedId}
            boundingBox={placement.marquee.boundingBox}
            boundingBoxBedId={selectedBedId}
            marqueeBox={placement.marquee.marqueeBox}
            marqueeBedId={placement.marquee.marqueeBedId}
            onSelectBed={editor.selectBed}
            onDeselect={bedActions.handleDeselectBed}
            onBedMove={editor.moveBed}
            onBedRotate={editor.rotateBedBy}
            onPlacementDragOver={placement.updateDropPreview}
            onPlacementDragLeave={placement.clearPreview}
            onPlacementDrop={placement.dropPlant}
            onPlacementTap={placement.tapPlace}
            onCropSelect={placement.selectCrop}
            onCropClick={placement.marquee.handleCropClick}
            onCropDragStart={placement.beginCropDrag}
            onCropDragMove={placement.moveCropDrag}
            onCropDragEnd={placement.endCropDrag}
            onBrushPointerDown={placement.brush.handlePointerDown}
            onBrushPointerMove={placement.brush.handlePointerMove}
            onBrushPointerUp={placement.brush.handlePointerUp}
            onMarqueePointerDown={placement.marquee.handlePointerDown}
            onMarqueePointerMove={placement.marquee.handlePointerMove}
            onMarqueePointerUp={placement.marquee.handlePointerUp}
          />
          <LayoutScaleBar viewBox={editor.viewBox} zoom={viewport.zoom} />
          <div className="location-layout-page__hud">
            <LayoutViewportControls viewport={viewport} />
            <BedCompassHud
              northAngle={visibility.effectiveNorthAngle}
              bedAzimuth={visibility.bedAzimuth}
              mode={editor.mode === 'position' ? 'position' : 'read'}
              onBedRotationChange={visibility.handleBedRotationChange}
              onNorthAngleChange={visibility.setCalibratedNorth}
              onSaveNorthAngle={visibility.handleSaveNorth}
              isSavingNorth={visibility.isSavingNorth}
            />
          </div>
        </div>
        {isPlanting && (
          <PlantPlacementPalette
            isOpen
            onSelectPlant={placement.selectPalettePlant}
            onDragPlant={placement.dragPalettePlant}
            activePlacingPlantId={placement.activePlantId}
            activePlacingPlantName={placement.activePlantName}
            onCancelPlacing={placement.cancelPalettePlant}
          />
        )}
        {!isPlanting && editor.unplacedBeds.length > 0 && (
          <UnplacedBedsTray
            beds={editor.unplacedBeds}
            mode={editor.mode}
            onPlace={editor.placeBed}
          />
        )}
      </div>

      <LocationLayoutDialogs
        locationId={id}
        selectedBedId={selectedBedId}
        selectedBedName={selectedBed?.name ?? ''}
        discardOpen={editor.discardOpen}
        dirty={editor.dirty}
        onUpdated={() =>
          void queryClient.invalidateQueries({
            queryKey: locationKeys.layout(id)
          })
        }
        onConfirmDiscard={editor.confirmDiscard}
        onCancelDiscard={editor.cancelDiscard}
        {...bedActions.dialogProps}
      />
    </main>
  );
}
