import { useCallback, useRef, useState } from 'react';

import { t } from '../../../../i18n/core/t';
import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import {
  findBedAtPoint,
  globalToBedLocal
} from '../../../../components/beds/layout/utils/plantPlacementGeometry';
import { calculateVitalRadius } from '../../../../components/beds/visualizer/utils/spatialCollisions';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { PlantListItem } from '../../../../types/Plants/Plant';
import { batchCreateCrops } from './layoutPlantingOperations';

export interface LayoutPlacementPreview {
  readonly bedId: string;
  readonly local: Point;
  readonly vitalRadius: number;
  readonly commonName: string;
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export interface PlacingPlant {
  readonly plantId: string;
  readonly commonName: string;
  readonly vitalRadius: number;
}

export function toPlacingPlant(plant: PlantListItem): PlacingPlant {
  return {
    plantId: plant.id,
    commonName: plant.identity.name.primary,
    vitalRadius: calculateVitalRadius(plant.traits.spacingCm?.min)
  };
}

export interface UseLayoutPalettePlacementParams {
  readonly beds: readonly ResolvedBed[];
  readonly evaluateStored: (
    bed: ResolvedBed,
    stored: Coordinates,
    vitalRadius: number
  ) => { readonly hasCollision: boolean; readonly isOutOfBounds: boolean };
  readonly invalidateBed: (bedId: string) => Promise<void>;
  readonly setIsSaving: (saving: boolean) => void;
  readonly onAnnounceError: (message: string) => void;
  readonly onClearSelection: () => void;
}

export function useLayoutPalettePlacement({
  beds,
  evaluateStored,
  invalidateBed,
  setIsSaving,
  onAnnounceError,
  onClearSelection
}: UseLayoutPalettePlacementParams) {
  const [activePlant, setActivePlant] = useState<PlantListItem | null>(null);
  const [draggingPlant, setDraggingPlant] = useState<PlacingPlant | null>(null);
  const [preview, setPreview] = useState<LayoutPlacementPreview | null>(null);
  const knownPlants = useRef(new Map<string, PlantListItem>());

  const resolveTarget = useCallback(
    (global: Point, vitalRadius: number) => {
      const bed = findBedAtPoint(beds, global);
      if (!bed) return null;
      const local = globalToBedLocal(bed, global);
      const evaluation = evaluateStored(bed, local, vitalRadius);
      return { bed, local, stored: local, ...evaluation };
    },
    [beds, evaluateStored]
  );

  const placeAt = useCallback(
    async (global: Point, plant: PlacingPlant) => {
      const target = resolveTarget(global, plant.vitalRadius);
      if (!target) return;
      if (target.isOutOfBounds) {
        onAnnounceError(t('bed.placement.announce_out_of_bounds'));
        return;
      }
      if (target.hasCollision) {
        onAnnounceError(t('bed.placement.announce_collision'));
        return;
      }
      setIsSaving(true);
      try {
        await batchCreateCrops(target.bed.id, [
          { plantId: plant.plantId, position: target.stored }
        ]);
        await invalidateBed(target.bed.id);
      } catch {
        onAnnounceError(t('bed.placement.save_error'));
      } finally {
        setIsSaving(false);
      }
    },
    [resolveTarget, invalidateBed, setIsSaving, onAnnounceError]
  );

  const dropPlant = useCallback(
    (global: Point, plantId: string) => {
      setPreview(null);
      setDraggingPlant(null);
      const plant = knownPlants.current.get(plantId);
      if (plant) void placeAt(global, toPlacingPlant(plant));
    },
    [placeAt]
  );

  const tapPlace = useCallback(
    (global: Point) => {
      if (!activePlant) {
        onClearSelection();
        return;
      }
      void placeAt(global, toPlacingPlant(activePlant));
    },
    [activePlant, placeAt, onClearSelection]
  );

  const updateDropPreview = useCallback(
    (global: Point) => {
      const plant = draggingPlant;
      if (!plant) return;
      const target = resolveTarget(global, plant.vitalRadius);
      setPreview(
        target
          ? {
              bedId: target.bed.id,
              local: target.local,
              vitalRadius: plant.vitalRadius,
              commonName: plant.commonName,
              hasCollision: target.hasCollision,
              isOutOfBounds: target.isOutOfBounds
            }
          : null
      );
    },
    [draggingPlant, resolveTarget]
  );

  const resetPalette = useCallback(() => {
    setActivePlant(null);
    setDraggingPlant(null);
    setPreview(null);
  }, []);

  return {
    activePlant,
    activePlantId: activePlant?.id ?? null,
    activePlantName: activePlant?.identity.name.primary ?? null,
    preview,
    setPreview,
    selectPalettePlant: (p: PlantListItem) => {
      knownPlants.current.set(p.id, p);
      setActivePlant((current) => (current?.id === p.id ? null : p));
      onClearSelection();
    },
    cancelPalettePlant: () => setActivePlant(null),
    dragPalettePlant: (p: PlantListItem) => {
      knownPlants.current.set(p.id, p);
      setDraggingPlant(toPlacingPlant(p));
    },
    updateDropPreview,
    clearPreview: () => setPreview(null),
    dropPlant,
    tapPlace,
    resetPalette
  };
}
