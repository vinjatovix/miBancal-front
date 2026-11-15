import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import LayoutBrushPatternBar from '../../../components/beds/layout/LayoutBrushPatternBar';
import LayoutSelectedBedActionBar from '../../../components/beds/layout/LayoutSelectedBedActionBar';
import LayoutSelectionActionBar from '../../../components/beds/layout/LayoutSelectionActionBar';
import { useBedViewport } from '../../../components/beds/visualizer/hooks/useBedViewport';
import type { LayersPopoverButtonProps } from '../../../components/beds/visualizer/LayersPopoverButton';
import { calculateFitBounds } from '../../../components/beds/layout/utils/layoutGeometry';
import { resolveFitBounds } from '../../../components/beds/layout/utils/viewportFitTarget';
import type { LayoutMode } from '../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../i18n/core/t';
import Button from '../../../shared/components/Button/Button';
import { CancelConfirmModal } from '../../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { locationKeys } from '../../../shared/reactQuery/locationKeys';
import type { LocationLayoutResponse } from '../../../types/Location/LocationLayout';
import LocationLayoutContextPanel from './components/LocationLayoutContextPanel';
import LocationLayoutDialogs from './components/LocationLayoutDialogs';
import LocationLayoutEmptyState from './components/LocationLayoutEmptyState';
import LocationLayoutTopBar from './components/LocationLayoutTopBar';
import LocationLayoutWorkspace from './components/LocationLayoutWorkspace';
import BedPdfExportModal from './components/BedPdfExportModal/BedPdfExportModal';
import CropAssociationInspectionModal from '../../../components/beds/associations/CropAssociationInspectionModal';
import CropRelationsModal from '../../../components/beds/associations/CropRelationsModal';
import { useIsDesktop } from '../../../shared/hooks/useIsDesktop';
import { useLayoutEditor, type LayoutEditor } from './hooks/useLayoutEditor';
import { useLayoutFullscreen } from './hooks/useLayoutFullscreen';
import { useLayoutKeyboardShortcuts } from './hooks/useLayoutKeyboardShortcuts';
import { useLayoutModeController } from './hooks/useLayoutModeController';
import { useLayoutPlantPlacement } from './hooks/useLayoutPlantPlacement';
import { useLayoutVisibilityControls } from './hooks/useLayoutVisibilityControls';
import { useLocationBedActions } from './hooks/useLocationBedActions';
import { useLocationBedCrops } from './hooks/useLocationBedCrops';
import { useLocationCropAssociations } from './hooks/useLocationCropAssociations';
import type {
  ActiveAssociationLink,
  AssociationFilterMode
} from '../../../components/beds/associations/types/cropAssociationTypes';

import './locationLayoutPage.css';

export interface LocationLayoutViewProps {
  readonly id: string;
  readonly etag: string;
  readonly layout: LocationLayoutResponse;
}

type LayoutPlacement = ReturnType<typeof useLayoutPlantPlacement>;

interface WorkspaceActionProps {
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
  readonly canUndo: boolean;
  readonly onUndo?: () => void;
  readonly canRedo: boolean;
  readonly onRedo?: () => void;
}

function resolveWorkspaceActions(params: {
  readonly isPlanting: boolean;
  readonly isPosition: boolean;
  readonly placement: LayoutPlacement;
  readonly editor: LayoutEditor;
  readonly onDiscardPlanting: () => void;
}): WorkspaceActionProps {
  const { isPlanting, isPosition, placement, editor, onDiscardPlanting } =
    params;
  if (isPlanting) {
    return {
      dirty: placement.hasChanges,
      saving: placement.isSaving,
      onSave: () => void placement.save(),
      onDiscard: onDiscardPlanting,
      canUndo: placement.canUndo,
      onUndo: placement.undo,
      canRedo: placement.canRedo,
      onRedo: placement.redo
    };
  }
  return {
    dirty: editor.dirty,
    saving: editor.saving,
    onSave: editor.save,
    onDiscard: editor.promptDiscard,
    canUndo: isPosition ? editor.canUndo : false,
    onUndo: isPosition ? editor.undo : undefined,
    canRedo: isPosition ? editor.canRedo : false,
    onRedo: isPosition ? editor.redo : undefined
  };
}

function rotateSelectedBed(
  isPosition: boolean,
  selectedBedId: string | null,
  editor: LayoutEditor
): void {
  if (isPosition && selectedBedId) editor.rotateBedBy(selectedBedId, 90);
}

function unplaceSelectedBed(
  isPosition: boolean,
  selectedBedId: string | null,
  editor: LayoutEditor
): void {
  if (isPosition && selectedBedId) editor.unplaceSelected();
}

function deleteSelection(params: {
  readonly isPlanting: boolean;
  readonly isPosition: boolean;
  readonly hasSelectedBed: boolean;
  readonly placement: LayoutPlacement;
  readonly onRequestDeleteBed: () => void;
}): void {
  const {
    isPlanting,
    isPosition,
    hasSelectedBed,
    placement,
    onRequestDeleteBed
  } = params;
  if (isPlanting && placement.selectedCropCount > 0) {
    placement.deleteSelectedCrops();
  } else if (isPosition && hasSelectedBed) {
    onRequestDeleteBed();
  }
}

function duplicateSelection(
  isPlanting: boolean,
  placement: LayoutPlacement
): void {
  if (isPlanting && placement.selectedCropCount > 0) {
    placement.duplicateSelectedCrops();
  }
}

export default function LocationLayoutView({
  id,
  etag,
  layout
}: LocationLayoutViewProps): JSX.Element {
  const queryClient = useQueryClient();
  const editor = useLayoutEditor(id, etag, layout);
  const viewport = useBedViewport();
  const isMobile = !useIsDesktop();
  const [searchParams] = useSearchParams();
  const pageRef = useRef<HTMLElement>(null);
  const fullscreen = useLayoutFullscreen(pageRef);

  const modeController = useLayoutModeController({
    viewport,
    beds: editor.placedBeds,
    viewBox: editor.viewBox,
    initialMode: editor.mode,
    onModeChange: editor.setMode
  });

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
  const [showAssociations, setShowAssociations] = useState(true);
  const [associationFilterMode, setAssociationFilterMode] =
    useState<AssociationFilterMode>('all');
  const [inspectedLink, setInspectedLink] =
    useState<ActiveAssociationLink | null>(null);
  const [inspectedCropId, setInspectedCropId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const placement = useLayoutPlantPlacement({
    beds: editor.placedBeds,
    cropsByBed,
    activeBedId: selectedBedId
  });

  const { links: associationLinks } = useLocationCropAssociations(
    editor.placedBeds,
    placement.associationCropsByBed
  );

  const inspectedCropLinks = useMemo(() => {
    if (!inspectedCropId) return [];
    return associationLinks.filter(
      (link) =>
        link.cropA.id === inspectedCropId || link.cropB.id === inspectedCropId
    );
  }, [associationLinks, inspectedCropId]);

  const inspectedCropName = useMemo(() => {
    if (!inspectedCropId) return '';
    for (const link of associationLinks) {
      if (link.cropA.id === inspectedCropId) return link.cropA.commonName;
      if (link.cropB.id === inspectedCropId) return link.cropB.commonName;
    }
    for (const crops of placement.associationCropsByBed.values()) {
      const found = crops.find((crop) => crop.id === inspectedCropId);
      if (found) return found.commonName;
    }
    return '';
  }, [associationLinks, inspectedCropId, placement.associationCropsByBed]);

  const bedActions = useLocationBedActions({
    locationId: id,
    selectedBed,
    onDeselectBed: editor.deselectBed
  });

  const bedParam = searchParams.get('bed');
  const { selectBed } = editor;
  useEffect(() => {
    if (bedParam) selectBed(bedParam);
  }, [bedParam, selectBed]);

  const [pendingLeaveMode, setPendingLeaveMode] = useState<LayoutMode | null>(
    null
  );

  const performModeChange = useCallback(
    (nextMode: LayoutMode) => {
      if (nextMode === 'plants') {
        placement.reset();
        modeController.enterPlanting(selectedBedId);
      } else {
        if (editor.mode === 'plants') {
          placement.clearSelection();
          placement.reset();
        }
        modeController.setMode(nextMode);
      }
    },
    [editor.mode, modeController, placement, selectedBedId]
  );

  const handleModeChange = useCallback(
    (nextMode: LayoutMode) => {
      if (nextMode === editor.mode) return;

      if (
        editor.mode === 'plants' &&
        nextMode !== 'plants' &&
        placement.hasChanges
      ) {
        setPendingLeaveMode(nextMode);
        return;
      }

      if (
        editor.mode === 'position' &&
        nextMode !== 'position' &&
        editor.dirty
      ) {
        setPendingLeaveMode(nextMode);
        editor.promptDiscard();
        return;
      }

      performModeChange(nextMode);
    },
    [editor, placement.hasChanges, performModeChange]
  );

  const confirmLeavePlanting = useCallback(() => {
    const nextMode = pendingLeaveMode;
    setPendingLeaveMode(null);
    if (!nextMode) return;
    placement.discardChanges();
    performModeChange(nextMode);
  }, [pendingLeaveMode, placement, performModeChange]);

  const cancelLeavePlanting = useCallback(() => setPendingLeaveMode(null), []);

  const handleConfirmDiscardPosition = useCallback(() => {
    const nextMode = pendingLeaveMode ?? 'read';
    setPendingLeaveMode(null);
    editor.discard();
    editor.cancelDiscard();
    performModeChange(nextMode);
  }, [pendingLeaveMode, editor, performModeChange]);

  const handleCancelDiscardPosition = useCallback(() => {
    setPendingLeaveMode(null);
    editor.cancelDiscard();
  }, [editor]);

  const [isDiscardPlantingOpen, setIsDiscardPlantingOpen] = useState(false);

  const confirmDiscardPlanting = useCallback(() => {
    setIsDiscardPlantingOpen(false);
    placement.discardChanges();
  }, [placement]);

  const cancelDiscardPlanting = useCallback(
    () => setIsDiscardPlantingOpen(false),
    []
  );

  const handleFitToView = useCallback(() => {
    const bounds = resolveFitBounds(selectedBed ?? null, editor.placedBeds);
    const target = calculateFitBounds(bounds, editor.viewBox, 0.85);
    if (target) viewport.animateTo(target);
  }, [selectedBed, editor.placedBeds, editor.viewBox, viewport]);

  const didInitialFitRef = useRef(false);
  useEffect(() => {
    if (didInitialFitRef.current || editor.placedBeds.length === 0) return;
    const bounds = resolveFitBounds(selectedBed ?? null, editor.placedBeds);
    if (!bounds) return;
    didInitialFitRef.current = true;
    viewport.fitToBounds(bounds, editor.viewBox, 0.9);
  }, [editor.placedBeds, editor.viewBox, selectedBed, viewport]);

  useLayoutKeyboardShortcuts({
    mode: editor.mode,
    setMode: handleModeChange,
    setTool: placement.setToolMode,
    onRotateSelected: () =>
      rotateSelectedBed(isPosition, selectedBedId, editor),
    onUnplaceSelected: () =>
      unplaceSelectedBed(isPosition, selectedBedId, editor),
    onDeleteSelected: () =>
      deleteSelection({
        isPlanting,
        isPosition,
        hasSelectedBed: selectedBed !== undefined,
        placement,
        onRequestDeleteBed: () => bedActions.setIsDeleteOpen(true)
      }),
    onDuplicateSelected: () => duplicateSelection(isPlanting, placement),
    onClearSelection: () => {
      if (isPlanting) {
        placement.clearSelection();
      } else if (isPosition) {
        editor.deselectBed();
      }
    },
    onFitToView: handleFitToView,
    onSave: editor.save,
    canSave: editor.dirty && !editor.saving
  });

  const layersProps: LayersPopoverButtonProps = {
    showNames: visibility.showBedNames,
    onToggleNames: visibility.handleToggleShowNames,
    showDimensions: visibility.showDimensions,
    onToggleDimensions: visibility.handleToggleShowDimensions,
    showPlants: visibility.showPlants,
    onTogglePlants: visibility.handleToggleShowPlants,
    showCardinalOrientation: visibility.showCardinalOrientation,
    onToggleCardinalOrientation: visibility.handleToggleShowCardinalOrientation,
    showGrids: visibility.showGrids,
    onToggleGrids: visibility.handleToggleGrids,
    activeGridLayers: visibility.activeGridLayers,
    onToggleGridLayer: visibility.handleToggleGridLayer,
    showAssociations,
    onToggleAssociations: () => setShowAssociations((prev) => !prev),
    associationFilterMode,
    onSelectAssociationFilterMode: setAssociationFilterMode,
    isMobile
  };

  const workspaceActions = resolveWorkspaceActions({
    isPlanting,
    isPosition,
    placement,
    editor,
    onDiscardPlanting: () => setIsDiscardPlantingOpen(true)
  });

  return (
    <main
      ref={pageRef}
      className={
        fullscreen.isFullscreen
          ? 'location-layout-page location-layout-page--fullscreen'
          : 'location-layout-page'
      }
    >
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

      <div className="location-layout-page__top-stack">
        <LocationLayoutTopBar
          mode={editor.mode}
          onModeChange={handleModeChange}
          isPlanting={isPlanting}
          isPosition={isPosition}
          toolMode={placement.toolMode}
          onSelectToolMode={placement.setToolMode}
          isSavingPlacement={placement.isSaving}
          hasPlantingChanges={placement.hasChanges}
          pendingPlantingCount={placement.pendingCount}
          onSavePlanting={() => void placement.save()}
          onDiscardPlanting={() => setIsDiscardPlantingOpen(true)}
          hasPositionChanges={editor.dirty}
          isSavingPosition={editor.saving}
          onSavePosition={editor.save}
          onDiscardPosition={editor.promptDiscard}
          gridSnapEnabled={editor.gridSnapEnabled}
          onToggleGridSnap={editor.toggleGridSnap}
          neighborSnapEnabled={editor.neighborSnapEnabled}
          onToggleNeighborSnap={editor.toggleNeighborSnap}
          onExportPdf={() => setIsExportOpen(true)}
          exportDisabled={editor.placedBeds.length === 0}
          isMobile={isMobile}
        />

        {isPosition && isMobile && selectedBed && (
          <LayoutSelectedBedActionBar
            bedName={selectedBed.name}
            onRotate={() => editor.rotateBedBy(selectedBed.id, 90)}
            onUnplace={editor.unplaceSelected}
            onEdit={() => bedActions.setIsEditOpen(true)}
            onDelete={() => bedActions.setIsDeleteOpen(true)}
            onDeselect={bedActions.handleDeselectBed}
            disabled={editor.saving}
          />
        )}

        {isPlanting && placement.toolMode === 'select' && (
          <LayoutSelectionActionBar
            count={placement.selectedCropCount}
            onDuplicate={() => placement.duplicateSelectedCrops()}
            onDelete={() => placement.deleteSelectedCrops()}
            onClear={placement.clearSelection}
            disabled={placement.isSaving}
          />
        )}

        {isPlanting && placement.toolMode === 'brush' && (
          <LayoutBrushPatternBar
            activePattern={placement.brushPattern}
            onSelectPattern={placement.setBrushPattern}
            disabled={placement.isSaving}
            isMobile={isMobile}
          />
        )}
      </div>

      <div className="location-layout-page__workspace">
        <LocationLayoutWorkspace
          editor={editor}
          viewport={viewport}
          visibility={visibility}
          placement={placement}
          bedActions={bedActions}
          layout={layout}
          cropsByBed={placement.effectiveCropsByBed}
          selectedBedId={selectedBedId}
          associationLinks={associationLinks}
          associationFilterMode={associationFilterMode}
          showAssociations={showAssociations}
          onSelectAssociationLink={setInspectedLink}
          onInspectCrop={setInspectedCropId}
          isMobile={isMobile}
          {...workspaceActions}
          onFitToView={handleFitToView}
          isFullscreen={fullscreen.isFullscreen}
          onToggleFullscreen={fullscreen.toggleFullscreen}
          layersProps={layersProps}
        />

        <LocationLayoutContextPanel
          mode={editor.mode}
          isPlanting={isPlanting}
          isPosition={isPosition}
          selectedBed={selectedBed}
          editor={editor}
          placement={placement}
          isMobile={isMobile}
        />
      </div>

      {editor.placedBeds.length === 0 && (
        <LocationLayoutEmptyState
          hasUnplacedBeds={editor.unplacedBeds.length > 0}
          onPlaceFirstBed={() => handleModeChange('position')}
          onCreateNewBed={() => bedActions.setIsCreateOpen(true)}
        />
      )}

      <LocationLayoutDialogs
        locationId={id}
        selectedBedId={selectedBedId}
        selectedBedName={selectedBed?.name ?? ''}
        discardOpen={editor.dirty && editor.discardOpen}
        dirty={editor.dirty}
        onUpdated={() =>
          void queryClient.invalidateQueries({
            queryKey: locationKeys.layout(id)
          })
        }
        onConfirmDiscard={handleConfirmDiscardPosition}
        onCancelDiscard={handleCancelDiscardPosition}
        {...bedActions.dialogProps}
      />

      <UnsavedChangesGuard
        when={isPlanting && placement.hasChanges}
        prompt={t('bed.placement.unsaved_message')}
      />

      <CancelConfirmModal
        isOpen={pendingLeaveMode !== null && editor.mode === 'plants'}
        title={t('bed.placement.discard_title')}
        prompt={t('bed.placement.discard_message')}
        confirmText={t('bed.placement.discard_confirm')}
        cancelText={t('bed.placement.unsaved_cancel')}
        onConfirm={confirmLeavePlanting}
        onCancel={cancelLeavePlanting}
      />

      <CancelConfirmModal
        isOpen={isDiscardPlantingOpen}
        title={t('bed.placement.discard_title')}
        prompt={t('bed.placement.discard_message')}
        confirmText={t('bed.placement.discard_confirm')}
        cancelText={t('bed.placement.discard_cancel')}
        onConfirm={confirmDiscardPlanting}
        onCancel={cancelDiscardPlanting}
      />

      <CropAssociationInspectionModal
        link={inspectedLink}
        isOpen={inspectedLink !== null}
        onClose={() => setInspectedLink(null)}
      />

      <CropRelationsModal
        isOpen={inspectedCropId !== null}
        focusCropId={inspectedCropId}
        focusCropName={inspectedCropName}
        links={inspectedCropLinks}
        onClose={() => setInspectedCropId(null)}
      />

      <BedPdfExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        layout={layout}
        placedBeds={editor.placedBeds}
        cropsByBed={cropsByBed}
        effectiveNorthAngle={visibility.effectiveNorthAngle}
        activeGridLayers={visibility.activeGridLayers}
      />
    </main>
  );
}
