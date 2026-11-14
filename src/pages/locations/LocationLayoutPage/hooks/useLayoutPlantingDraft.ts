import { useCallback, useMemo, useState } from 'react';

import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import {
  batchCreateCrops,
  batchDeleteCrops,
  batchUpdateCrops,
  type BatchCreateCropItem,
  type BatchCropMoveInput,
  type LayoutCreateInput
} from './layoutPlantingOperations';

export type LayoutSaveStatus = 'ok' | 'conflict' | 'error' | 'noop';

export interface LayoutMoveInput {
  readonly id: string;
  readonly position: Coordinates;
}

export interface UseLayoutPlantingDraftParams {
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly invalidateBed: (bedId: string) => Promise<void>;
}

interface SavePayload {
  readonly affectedBedIds: ReadonlySet<string>;
  readonly creationsByBed: ReadonlyMap<string, BatchCreateCropItem[]>;
  readonly moves: readonly BatchCropMoveInput[];
  readonly deletions: readonly CropPlacementItem[];
}

function buildSavePayload(
  created: readonly CropPlacementItem[],
  moved: ReadonlyMap<string, Coordinates>,
  deleted: ReadonlySet<string>,
  serverById: ReadonlyMap<string, CropPlacementItem>
): SavePayload {
  const affectedBedIds = new Set<string>();
  const creationsByBed = new Map<string, BatchCreateCropItem[]>();
  for (const crop of created) {
    affectedBedIds.add(crop.bedId);
    const list = creationsByBed.get(crop.bedId) ?? [];
    list.push({ plantId: crop.plantId, position: crop.position });
    creationsByBed.set(crop.bedId, list);
  }

  const moves: BatchCropMoveInput[] = [];
  for (const [id, position] of moved) {
    const crop = serverById.get(id);
    if (!crop) continue;
    affectedBedIds.add(crop.bedId);
    moves.push({ id, position, version: crop.version });
  }

  const deletions: CropPlacementItem[] = [];
  for (const id of deleted) {
    const crop = serverById.get(id);
    if (!crop) continue;
    affectedBedIds.add(crop.bedId);
    deletions.push(crop);
  }

  return { affectedBedIds, creationsByBed, moves, deletions };
}

export function useLayoutPlantingDraft({
  cropsByBed,
  invalidateBed
}: UseLayoutPlantingDraftParams) {
  const [created, setCreated] = useState<readonly CropPlacementItem[]>([]);
  const [moved, setMoved] = useState<ReadonlyMap<string, Coordinates>>(
    new Map()
  );
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const serverById = useMemo(() => {
    const map = new Map<string, CropPlacementItem>();
    for (const crops of cropsByBed.values()) {
      for (const crop of crops) map.set(crop.id, crop);
    }
    return map;
  }, [cropsByBed]);

  const effectiveCropsByBed = useMemo((): ReadonlyMap<
    string,
    readonly CropPlacementItem[]
  > => {
    const map = new Map<string, CropPlacementItem[]>();
    for (const [bedId, crops] of cropsByBed) {
      const list: CropPlacementItem[] = [];
      for (const crop of crops) {
        if (deleted.has(crop.id)) continue;
        const position = moved.get(crop.id);
        list.push(position ? { ...crop, position, hasMoved: true } : crop);
      }
      map.set(bedId, list);
    }
    for (const crop of created) {
      const list = map.get(crop.bedId);
      if (list) list.push(crop);
      else map.set(crop.bedId, [crop]);
    }
    return map;
  }, [cropsByBed, created, moved, deleted]);

  const pendingCount = created.length + moved.size + deleted.size;
  const hasChanges = pendingCount > 0;

  const addCrops = useCallback(
    (inputs: readonly LayoutCreateInput[]): readonly string[] => {
      if (inputs.length === 0) return [];
      const newCrops: CropPlacementItem[] = inputs.map((input) => ({
        id: crypto.randomUUID(),
        bedId: input.bedId,
        plantId: input.plantId,
        commonName: input.commonName,
        scientificName: input.scientificName,
        position: input.position,
        vitalRadius: input.vitalRadius,
        growthStatus: 'planted',
        version: 0,
        isNew: true
      }));
      setCreated((prev) => [...prev, ...newCrops]);
      return newCrops.map((crop) => crop.id);
    },
    []
  );

  const addCrop = useCallback(
    (input: LayoutCreateInput): string => addCrops([input])[0],
    [addCrops]
  );

  const moveCrops = useCallback(
    (moves: readonly LayoutMoveInput[]) => {
      if (moves.length === 0) return;
      const moveMap = new Map(moves.map((move) => [move.id, move.position]));
      setCreated((prevCreated) => {
        const createdIds = new Set(prevCreated.map((crop) => crop.id));
        setMoved((prevMoved) => {
          const next = new Map(prevMoved);
          let changed = false;
          for (const [id, position] of moveMap) {
            if (createdIds.has(id)) continue;
            const server = serverById.get(id);
            const isBackToOrigin =
              server?.position.x === position.x &&
              server.position.y === position.y;
            if (isBackToOrigin) {
              if (next.delete(id)) changed = true;
            } else {
              next.set(id, position);
              changed = true;
            }
          }
          return changed ? next : prevMoved;
        });
        if (!prevCreated.some((crop) => moveMap.has(crop.id)))
          return prevCreated;
        return prevCreated.map((crop) => {
          const position = moveMap.get(crop.id);
          return position ? { ...crop, position } : crop;
        });
      });
    },
    [serverById]
  );

  const moveCrop = useCallback(
    (id: string, position: Coordinates) => {
      moveCrops([{ id, position }]);
    },
    [moveCrops]
  );

  const removeCrops = useCallback((ids: readonly string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setCreated((prevCreated) => {
      const createdIds = new Set(prevCreated.map((crop) => crop.id));
      setMoved((prevMoved) => {
        if (prevMoved.size === 0) return prevMoved;
        const next = new Map(prevMoved);
        for (const id of ids) next.delete(id);
        return next;
      });
      setDeleted((prevDeleted) => {
        const next = new Set(prevDeleted);
        for (const id of ids) if (!createdIds.has(id)) next.add(id);
        return next;
      });
      return prevCreated.filter((crop) => !idSet.has(crop.id));
    });
  }, []);

  const restoreCrops = useCallback((crops: readonly CropPlacementItem[]) => {
    if (crops.length === 0) return;
    const ids = new Set(crops.map((crop) => crop.id));
    setDeleted((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
    setCreated((prev) => {
      const existing = new Set(prev.map((crop) => crop.id));
      const readded = crops.filter(
        (crop) => crop.isNew && !existing.has(crop.id)
      );
      return readded.length > 0 ? [...prev, ...readded] : prev;
    });
  }, []);

  const discardChanges = useCallback(() => {
    setCreated([]);
    setMoved(new Map());
    setDeleted(new Set());
  }, []);

  const save = useCallback(async (): Promise<LayoutSaveStatus> => {
    if (isSaving) return 'noop';
    if (created.length === 0 && moved.size === 0 && deleted.size === 0) {
      return 'noop';
    }
    setIsSaving(true);

    const { affectedBedIds, creationsByBed, moves, deletions } =
      buildSavePayload(created, moved, deleted, serverById);

    const invalidateAll = () =>
      Promise.all(Array.from(affectedBedIds, (bedId) => invalidateBed(bedId)));

    let creationsPersisted = false;
    let movesPersisted = false;
    try {
      await Promise.all(
        Array.from(creationsByBed, ([bedId, items]) =>
          batchCreateCrops(bedId, items)
        )
      );
      creationsPersisted = true;
      await batchUpdateCrops(moves);
      movesPersisted = true;
      await batchDeleteCrops(deletions);
      await invalidateAll();
      discardChanges();
      return 'ok';
    } catch (error) {
      await invalidateAll();
      if (creationsPersisted) setCreated([]);
      if (movesPersisted) setMoved(new Map());
      return error instanceof PreconditionFailedError ? 'conflict' : 'error';
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    created,
    moved,
    deleted,
    serverById,
    discardChanges,
    invalidateBed
  ]);

  return {
    effectiveCropsByBed,
    pendingCount,
    hasChanges,
    isSaving,
    addCrop,
    addCrops,
    moveCrop,
    moveCrops,
    removeCrops,
    restoreCrops,
    discardChanges,
    save
  };
}
