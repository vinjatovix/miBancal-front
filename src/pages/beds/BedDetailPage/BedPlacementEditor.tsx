import { useCallback, useEffect, useRef, useState, type JSX } from 'react';

import { t } from '../../../i18n/core/t';
import BedTechnicalHeader from '../../../components/beds/visualizer/BedTechnicalHeader';
import BedVisualizerCanvas from '../../../components/beds/visualizer/BedVisualizerCanvas';
import BedGridControls from '../../../components/beds/visualizer/BedGridControls';
import { BedCanvasToolSelector } from '../../../components/beds/visualizer/BedCanvasToolSelector';
import PlantPlacementPalette from '../../../components/beds/visualizer/PlantPlacementPalette';
import PlacementSaveBar from '../../../components/beds/visualizer/PlacementSaveBar';
import CropAdjustmentControls from '../../../components/beds/visualizer/CropAdjustmentControls';
import ManualPlacementModal from '../../../components/beds/visualizer/ManualPlacementModal';
import {
  DEFAULT_ACTIVE_GRID_LAYERS,
  type ActiveGridLayers,
  type BedGridLayerKey
} from '../../../components/beds/visualizer/utils/bedGridConfig';
import type { PlacingPlant } from '../../../components/beds/visualizer/hooks/useCanvasPlacement';
import type {
  BrushPatternType,
  PlantingToolMode
} from '../../../types/PlantInstance/brushSelectionTypes';
import { CancelConfirmModal } from '../../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { useToast } from '../../../shared/toast/useToast';
import type { Bed } from '../../../types/Bed/Bed';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type { PlantListItem } from '../../../types/Plants/Plant';
import { useBedPlantInstances } from '../hooks/useBedPlantInstances';
import { useBedPlacementDraft } from '../hooks/useBedPlacementDraft';
import { toPlacementInput, toPlacingPlant } from './bedPlacementEditorUtils';
import { BedPlacementSelectionBar } from './BedPlacementSelectionBar';

import './bedDetailPage.css';

export default function BedPlacementEditor({
  bed
}: {
  readonly bed: Bed;
}): JSX.Element {
  const largo = Math.max(bed.width, bed.height);
  const ancho = Math.min(bed.width, bed.height);
  const { crops: initialCrops } = useBedPlantInstances(bed.id);
  const draft = useBedPlacementDraft({
    bed: { id: bed.id, width: largo, height: ancho },
    initialCrops
  });
  const { showErrorToast } = useToast();

  const [layers, setLayers] = useState<ActiveGridLayers>(
    DEFAULT_ACTIVE_GRID_LAYERS
  );
  const [toolMode, setToolMode] = useState<PlantingToolMode>('plant-single');
  const [brushPattern, setBrushPattern] =
    useState<BrushPatternType>('single-row');
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [activePlacing, setActivePlacing] = useState<PlantListItem | null>(
    null
  );
  const [draggingPlant, setDraggingPlant] = useState<PlantListItem | null>(
    null
  );
  const [removalCandidateId, setRemovalCandidateId] = useState<string | null>(
    null
  );
  const [manualOpen, setManualOpen] = useState(false);
  const knownPlants = useRef(new Map<string, PlantListItem>());

  const selectedCrop =
    draft.currentCrops.find((crop) => crop.id === draft.selectedCropId) ?? null;

  useEffect(() => {
    if (draft.saveError) {
      showErrorToast(null, t(draft.saveError));
    }
  }, [draft.saveError, showErrorToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        draft.selectedCropIds.size > 0
      ) {
        e.preventDefault();
        draft.removeCrops(Array.from(draft.selectedCropIds));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draft]);

  const toggleLayer = useCallback((key: BedGridLayerKey) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectPlant = useCallback((plant: PlantListItem) => {
    knownPlants.current.set(plant.id, plant);
    setActivePlacing((current) => (current?.id === plant.id ? null : plant));
  }, []);

  const handleDragPlant = useCallback((plant: PlantListItem) => {
    knownPlants.current.set(plant.id, plant);
    setDraggingPlant(plant);
  }, []);

  const handleDrop = useCallback(
    (plantId: string, position: Coordinates) => {
      const plant = knownPlants.current.get(plantId);
      if (plant) draft.addCrop(toPlacementInput(plant), position);
      setDraggingPlant(null);
    },
    [draft]
  );

  const handleTap = useCallback(
    (position: Coordinates) => {
      if (activePlacing) {
        draft.addCrop(toPlacementInput(activePlacing), position);
      }
    },
    [activePlacing, draft]
  );

  const confirmRemoval = useCallback(() => {
    if (removalCandidateId) draft.removeCrop(removalCandidateId);
    setRemovalCandidateId(null);
  }, [removalCandidateId, draft]);

  const handleAdjust = useCallback(
    (dx: number, dy: number) => {
      if (!selectedCrop) return;
      draft.moveCrop(selectedCrop.id, {
        x: selectedCrop.position.x + dx,
        y: selectedCrop.position.y + dy
      });
    },
    [selectedCrop, draft]
  );

  const handleManualConfirm = useCallback(
    (position: Coordinates) => {
      if (activePlacing) {
        draft.addCrop(toPlacementInput(activePlacing), position);
      }
      setManualOpen(false);
    },
    [activePlacing, draft]
  );

  const targetPlant = activePlacing ?? draggingPlant;
  const placingPlant: PlacingPlant | null = targetPlant
    ? toPlacingPlant(targetPlant)
    : null;

  const pendingCount =
    draft.pendingCreations.length +
    draft.pendingUpdates.length +
    draft.pendingDeletions.length;

  return (
    <main className="bed-detail-page">
      <BedTechnicalHeader bed={bed} />
      <div className="bed-detail-page__toolbar">
        <BedGridControls activeLayers={layers} onToggleLayer={toggleLayer} />
        <BedCanvasToolSelector
          activeMode={toolMode}
          activeBrushPattern={brushPattern}
          onSelectMode={setToolMode}
          onSelectBrushPattern={setBrushPattern}
        />
        <button
          type="button"
          className="bed-detail-page__palette-toggle"
          aria-pressed={paletteOpen}
          onClick={() => setPaletteOpen((open) => !open)}
        >
          {t('bed.placement.palette_toggle')}
        </button>
      </div>
      <BedPlacementSelectionBar
        selectedCrop={selectedCrop}
        selectedCropIds={draft.selectedCropIds}
        onDuplicateGroup={() =>
          draft.duplicateCrops(Array.from(draft.selectedCropIds))
        }
        onDeleteGroup={() =>
          draft.removeCrops(Array.from(draft.selectedCropIds))
        }
        onRemoveSingle={setRemovalCandidateId}
      />
      <div className="bed-detail-page__workspace">
        <div className="bed-detail-page__canvas">
          <BedVisualizerCanvas
            bed={bed}
            activeLayers={layers}
            crops={draft.currentCrops}
            collisions={draft.collisions}
            perimeterWarnings={draft.perimeterWarnings}
            selectedCropId={draft.selectedCropId}
            selectedCropIds={draft.selectedCropIds}
            isPlacingActive={activePlacing !== null}
            placingPlant={placingPlant}
            activeToolMode={toolMode}
            activeBrushPattern={brushPattern}
            activePlantPlacement={
              activePlacing ? toPlacementInput(activePlacing) : null
            }
            evaluatePlacement={draft.evaluatePlacement}
            onSelectCrop={draft.selectCrop}
            onSelectCropIds={draft.setSelectedCropIds}
            onToggleCropSelection={draft.toggleCropSelection}
            onClearSelection={draft.clearSelection}
            onMoveCrop={draft.moveCrop}
            onDropPlacement={handleDrop}
            onTapPlacement={handleTap}
            onApplyBrush={draft.addCrops}
          />
          <CropAdjustmentControls
            selectedCrop={selectedCrop}
            onAdjust={handleAdjust}
            onRemove={setRemovalCandidateId}
            onClose={() => draft.selectCrop(null)}
          />
          <PlacementSaveBar
            isDirty={draft.hasChanges}
            isSaving={draft.isSaving}
            pendingCount={pendingCount}
            onSave={() => void draft.save()}
            onDiscard={draft.discardChanges}
          />
        </div>
        <PlantPlacementPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onSelectPlant={handleSelectPlant}
          onDragPlant={handleDragPlant}
          activePlacingPlantId={activePlacing?.id ?? null}
          activePlacingPlantName={activePlacing?.identity.name.primary ?? null}
          onCancelPlacing={() => setActivePlacing(null)}
          onOpenManual={() => setManualOpen(true)}
        />
      </div>
      <ManualPlacementModal
        isOpen={manualOpen}
        bedWidth={largo}
        bedHeight={ancho}
        vitalRadius={placingPlant?.vitalRadius ?? 15}
        evaluatePlacement={draft.evaluatePlacement}
        onConfirm={handleManualConfirm}
        onCancel={() => setManualOpen(false)}
      />
      <CancelConfirmModal
        isOpen={removalCandidateId !== null}
        title={t('bed.placement.remove_title')}
        prompt={t('bed.placement.remove_message', {
          name: selectedCrop?.commonName ?? ''
        })}
        confirmText={t('bed.placement.remove_confirm')}
        cancelText={t('bed.placement.remove_cancel')}
        onConfirm={confirmRemoval}
        onCancel={() => setRemovalCandidateId(null)}
      />
      <UnsavedChangesGuard
        when={draft.hasChanges}
        prompt={t('bed.placement.unsaved_message')}
      />
    </main>
  );
}
