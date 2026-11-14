import type { RefObject, JSX } from 'react';

import BedCompassHud from '../../../../components/beds/layout/BedCompassHud';
import LayoutFloatingToolDock from '../../../../components/beds/layout/LayoutFloatingToolDock';
import LayoutSaveBar from '../../../../components/beds/layout/LayoutSaveBar';
import LayoutScaleBar from '../../../../components/beds/layout/LayoutScaleBar';
import LocationLayoutCanvas from '../../../../components/beds/layout/LocationLayoutCanvas';
import type { LayersPopoverButtonProps } from '../../../../components/beds/visualizer/LayersPopoverButton';
import type { BedViewportState } from '../../../../components/beds/visualizer/hooks/useBedViewport';
import { t } from '../../../../i18n/core/t';
import type { LocationLayoutResponse } from '../../../../types/Location/LocationLayout';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import type {
  ActiveAssociationLink,
  AssociationFilterMode
} from '../../../../components/beds/associations/types/cropAssociationTypes';
import type { LayoutEditor } from '../hooks/useLayoutEditor';
import type { useLayoutPlantPlacement } from '../hooks/useLayoutPlantPlacement';
import type { useLayoutVisibilityControls } from '../hooks/useLayoutVisibilityControls';
import type { useLocationBedActions } from '../hooks/useLocationBedActions';

export interface LocationLayoutWorkspaceProps {
  readonly canvasContainerRef: RefObject<HTMLDivElement | null>;
  readonly editor: LayoutEditor;
  readonly viewport: BedViewportState;
  readonly visibility: ReturnType<typeof useLayoutVisibilityControls>;
  readonly placement: ReturnType<typeof useLayoutPlantPlacement>;
  readonly bedActions: ReturnType<typeof useLocationBedActions>;
  readonly layout: LocationLayoutResponse;
  readonly cropsByBed:
    | ReadonlyMap<string, readonly CropPlacementItem[]>
    | undefined;
  readonly selectedBedId: string | null;
  readonly associationLinks?: readonly ActiveAssociationLink[];
  readonly associationFilterMode?: AssociationFilterMode;
  readonly showAssociations?: boolean;
  readonly onSelectAssociationLink?: (link: ActiveAssociationLink) => void;
  readonly onInspectCrop?: (cropId: string) => void;
  readonly isMobile?: boolean;
  readonly dirty?: boolean;
  readonly saving?: boolean;
  readonly onSave?: () => void;
  readonly onDiscard?: () => void;
  readonly canUndo?: boolean;
  readonly onUndo?: () => void;
  readonly canRedo?: boolean;
  readonly onRedo?: () => void;
  readonly onFitToView: () => void;
  readonly isFullscreen: boolean;
  readonly onToggleFullscreen: () => void;
  readonly layersProps: LayersPopoverButtonProps;
}

export default function LocationLayoutWorkspace({
  canvasContainerRef,
  editor,
  viewport,
  visibility,
  placement,
  bedActions,
  layout,
  cropsByBed,
  selectedBedId,
  associationLinks = [],
  associationFilterMode = 'all',
  showAssociations = true,
  onSelectAssociationLink,
  onInspectCrop,
  isMobile = false,
  dirty = false,
  saving = false,
  onSave,
  onDiscard,
  canUndo = false,
  onUndo,
  canRedo = false,
  onRedo,
  onFitToView,
  isFullscreen,
  onToggleFullscreen,
  layersProps
}: LocationLayoutWorkspaceProps): JSX.Element {
  const isPosition = editor.mode === 'position';

  return (
    <>
      <div ref={canvasContainerRef} className="location-layout-page__canvas">
        <LayoutFloatingToolDock
          className={
            isMobile && editor.mode !== 'read'
              ? 'layout-floating-tool-dock--stacked'
              : undefined
          }
          onZoomIn={viewport.zoomIn}
          onZoomOut={viewport.zoomOut}
          onFitToScreen={onFitToView}
          canUndo={canUndo}
          onUndo={onUndo ?? (() => undefined)}
          canRedo={canRedo}
          onRedo={onRedo ?? (() => undefined)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          layersProps={layersProps}
        />
        <LocationLayoutCanvas
          beds={editor.placedBeds}
          viewBox={editor.viewBox}
          label={t('bed.layout.canvas_label', {
            name: layout.location.name
          })}
          mode={editor.mode}
          selectedId={editor.selectedId}
          isMobile={isMobile}
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
          associationLinks={associationLinks}
          associationFilterMode={associationFilterMode}
          showAssociations={showAssociations}
          onSelectAssociationLink={onSelectAssociationLink}
          onInspectCrop={onInspectCrop}
          placementPreview={placement.preview}
          selectedCropId={placement.selectedCropId}
          selectedCropIds={placement.selectedCropIds}
          toolMode={placement.toolMode}
          brushDirectrix={placement.brush.directrix}
          brushCandidates={placement.brush.candidates}
          isBrushDrawing={placement.brush.isDrawing}
          brushBedId={placement.brush.strokeBedId}
          boundingBox={placement.marquee.boundingBox}
          boundingBoxBedId={placement.marquee.boundingBoxBedId ?? selectedBedId}
          marqueeBox={placement.marquee.marqueeBox}
          marqueeBedId={placement.marquee.marqueeBedId}
          groupMovePreview={placement.marquee.groupMovePreview}
          onSelectBed={editor.selectBed}
          onDeselect={bedActions.handleDeselectBed}
          onBedMove={editor.moveBed}
          onBedDragStart={editor.beginBedDrag}
          onBedDragMove={editor.moveBedDrag}
          onBedDragEnd={editor.endBedDrag}
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
          onBedUnplace={editor.unplaceSelected}
          onBedEdit={() => bedActions.setIsEditOpen(true)}
          onBedDelete={() => bedActions.setIsDeleteOpen(true)}
        />
        <LayoutScaleBar viewBox={editor.viewBox} zoom={viewport.zoom} />
        <div className="location-layout-page__hud">
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
      {isMobile && editor.mode !== 'read' && (
        <div className="location-layout-page__mobile-actions">
          <LayoutSaveBar
            dirty={dirty}
            saving={saving}
            onSave={onSave ?? (() => undefined)}
            onDiscard={onDiscard ?? (() => undefined)}
          />
        </div>
      )}
    </>
  );
}
