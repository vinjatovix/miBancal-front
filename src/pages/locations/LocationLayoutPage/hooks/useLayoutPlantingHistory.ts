import { useCallback, useMemo } from 'react';

import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import { useLayoutEditHistory, type EditAction } from './useLayoutEditHistory';
import type { LayoutCreateInput } from './layoutPlantingOperations';

export type CropMoveInput = {
  readonly id: string;
  readonly position: Coordinates;
};

export interface PlantingDraftOps {
  readonly addCrop: (input: LayoutCreateInput) => string;
  readonly addCrops: (
    inputs: readonly LayoutCreateInput[]
  ) => readonly string[];
  readonly moveCrop: (id: string, position: Coordinates) => void;
  readonly moveCrops: (moves: readonly CropMoveInput[]) => void;
  readonly removeCrops: (ids: readonly string[]) => void;
  readonly restoreCrops: (crops: readonly CropPlacementItem[]) => void;
}

export interface LayoutPlantingHistory {
  readonly addCrop: (input: LayoutCreateInput) => string;
  readonly addCrops: (
    inputs: readonly LayoutCreateInput[]
  ) => readonly string[];
  readonly moveCrop: (id: string, position: Coordinates) => void;
  readonly moveCrops: (moves: readonly CropMoveInput[]) => void;
  readonly removeCrops: (ids: readonly string[]) => void;
  readonly canUndo: boolean;
  readonly undo: () => void;
  readonly canRedo: boolean;
  readonly redo: () => void;
  readonly clear: () => void;
  readonly reset: () => void;
}

export function useLayoutPlantingHistory(
  draft: PlantingDraftOps,
  effectiveCropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>
): LayoutPlantingHistory {
  const {
    addCrops: draftAddCrops,
    moveCrop: draftMoveCrop,
    moveCrops: draftMoveCrops,
    removeCrops: draftRemoveCrops,
    restoreCrops: draftRestoreCrops
  } = draft;

  const findCrop = useCallback(
    (id: string): CropPlacementItem | null => {
      for (const crops of effectiveCropsByBed.values()) {
        const found = crops.find((crop) => crop.id === id);
        if (found) return found;
      }
      return null;
    },
    [effectiveCropsByBed]
  );

  const onRevert = useCallback(
    (action: EditAction): (() => void) | void => {
      if (action.type === 'move-crop') {
        draftMoveCrop(action.cropId, action.from);
        return () => draftMoveCrop(action.cropId, action.to);
      }
      if (action.type === 'plant') {
        const planted = action.cropIds
          .map((cropId) => findCrop(cropId))
          .filter((crop): crop is CropPlacementItem => crop !== null);
        draftRemoveCrops(action.cropIds);
        return () => draftRestoreCrops(planted);
      }
      if (action.type === 'remove-crop') {
        draftRestoreCrops(action.crops);
        return () => draftRemoveCrops(action.crops.map((crop) => crop.id));
      }
      return undefined;
    },
    [draftMoveCrop, draftRemoveCrops, draftRestoreCrops, findCrop]
  );

  const { push, canUndo, undo, canRedo, redo, clear, reset } =
    useLayoutEditHistory({
      onRevert
    });

  const moveCrop = useCallback(
    (id: string, position: Coordinates): void => {
      const current = findCrop(id);
      draftMoveCrop(id, position);
      if (
        current &&
        (current.position.x !== position.x || current.position.y !== position.y)
      ) {
        push({
          type: 'move-crop',
          cropId: id,
          from: current.position,
          to: position
        });
      }
    },
    [draftMoveCrop, findCrop, push]
  );

  const moveCrops = useCallback(
    (moves: readonly CropMoveInput[]): void => {
      const origins = moves.map((move) => ({
        current: findCrop(move.id),
        to: move.position
      }));
      draftMoveCrops(moves);
      for (const { current, to } of origins) {
        if (
          current &&
          (current.position.x !== to.x || current.position.y !== to.y)
        ) {
          push({
            type: 'move-crop',
            cropId: current.id,
            from: current.position,
            to
          });
        }
      }
    },
    [draftMoveCrops, findCrop, push]
  );

  const addCrops = useCallback(
    (inputs: readonly LayoutCreateInput[]): readonly string[] => {
      const ids = draftAddCrops(inputs);
      if (ids.length > 0) {
        push({ type: 'plant', cropIds: ids, bedId: inputs[0].bedId });
      }
      return ids;
    },
    [draftAddCrops, push]
  );

  const addCrop = useCallback(
    (input: LayoutCreateInput): string => addCrops([input])[0],
    [addCrops]
  );

  const removeCrops = useCallback(
    (ids: readonly string[]): void => {
      const removed = ids
        .map((id) => findCrop(id))
        .filter((crop): crop is CropPlacementItem => crop !== null);
      draftRemoveCrops(ids);
      if (removed.length > 0) {
        push({ type: 'remove-crop', bedId: removed[0].bedId, crops: removed });
      }
    },
    [draftRemoveCrops, findCrop, push]
  );

  return useMemo(
    () => ({
      addCrop,
      addCrops,
      moveCrop,
      moveCrops,
      removeCrops,
      canUndo,
      undo,
      canRedo,
      redo,
      clear,
      reset
    }),
    [
      addCrop,
      addCrops,
      moveCrop,
      moveCrops,
      removeCrops,
      canUndo,
      undo,
      canRedo,
      redo,
      clear,
      reset
    ]
  );
}
