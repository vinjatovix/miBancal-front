import { useCallback, useMemo, useRef, useState } from 'react';
import type React from 'react';

import { t } from '../../../../i18n/core/t';

import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import {
  findBedAtPoint,
  globalToBedLocal
} from '../../../../components/beds/layout/utils/plantPlacementGeometry';
import {
  buildGroupMoves,
  computeGroupBoundingBox,
  computeMarqueeBox,
  evaluateGroupMovement,
  findCropsInMarquee
} from '../../../../components/beds/visualizer/utils/selectionGeometry';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  GroupBoundingBox,
  MarqueeBox
} from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import {
  batchDeleteCrops,
  batchDuplicateCrops,
  batchUpdateCrops
} from './layoutPlantingOperations';

export interface UseLayoutMarqueeSelectionParams {
  readonly isEnabled: boolean;
  readonly beds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly activeBedId: string | null;
  readonly invalidateBed: (bedId: string) => Promise<void>;
  readonly onAnnounceError: (message: string) => void;
}

export function useLayoutMarqueeSelection({
  isEnabled,
  beds,
  cropsByBed,
  activeBedId,
  invalidateBed,
  onAnnounceError
}: UseLayoutMarqueeSelectionParams) {
  const [selectedCropIds, setSelectedCropIds] = useState<ReadonlySet<string>>(
    new Set()
  );
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeBed, setMarqueeBed] = useState<ResolvedBed | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [groupDisplacement, setGroupDisplacement] =
    useState<Coordinates | null>(null);
  const groupDragRef = useRef<{
    readonly bed: ResolvedBed;
    readonly startLocal: Point;
  } | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedCropIds(new Set());
    setIsMarqueeActive(false);
    setMarqueeBed(null);
    setStartPoint(null);
    setCurrentPoint(null);
    groupDragRef.current = null;
    setGroupDisplacement(null);
  }, []);

  const toggleCropSelection = useCallback((cropId: string) => {
    setSelectedCropIds((prev) => {
      const next = new Set(prev);
      if (next.has(cropId)) next.delete(cropId);
      else next.add(cropId);
      return next;
    });
  }, []);

  const selectCropIds = useCallback((ids: ReadonlySet<string>) => {
    setSelectedCropIds(ids);
  }, []);

  const selectSingleCrop = useCallback((cropId: string | null) => {
    setSelectedCropIds(cropId ? new Set([cropId]) : new Set());
  }, []);

  const activeCrops = useMemo(() => {
    const list: CropPlacementItem[] = [];
    for (const crops of cropsByBed.values()) list.push(...crops);
    return list;
  }, [cropsByBed]);

  const baseBoundingBox = useMemo((): GroupBoundingBox | null => {
    if (selectedCropIds.size === 0) return null;
    return computeGroupBoundingBox(activeCrops, selectedCropIds);
  }, [activeCrops, selectedCropIds]);

  const selectionBed = useMemo((): ResolvedBed | null => {
    if (selectedCropIds.size === 0) return null;
    for (const bed of beds) {
      const bedCrops = cropsByBed.get(bed.id) ?? [];
      if (bedCrops.some((crop) => selectedCropIds.has(crop.id))) return bed;
    }
    return null;
  }, [beds, cropsByBed, selectedCropIds]);

  const boundingBox = useMemo((): GroupBoundingBox | null => {
    if (!baseBoundingBox) return null;
    if (!groupDisplacement) return baseBoundingBox;
    const { x: dx, y: dy } = groupDisplacement;
    return {
      ...baseBoundingBox,
      minX: baseBoundingBox.minX + dx,
      minY: baseBoundingBox.minY + dy,
      maxX: baseBoundingBox.maxX + dx,
      maxY: baseBoundingBox.maxY + dy,
      center: {
        x: baseBoundingBox.center.x + dx,
        y: baseBoundingBox.center.y + dy
      }
    };
  }, [baseBoundingBox, groupDisplacement]);

  const marqueeBox = useMemo((): MarqueeBox | null => {
    if (!startPoint || !currentPoint) return null;
    return computeMarqueeBox(startPoint, currentPoint);
  }, [startPoint, currentPoint]);

  const handlePointerDown = useCallback(
    (global: Point, shiftKey = false) => {
      if (!isEnabled) return;
      if (!shiftKey && baseBoundingBox && selectionBed) {
        const local = globalToBedLocal(selectionBed, global);
        if (
          local.x >= baseBoundingBox.minX &&
          local.x <= baseBoundingBox.maxX &&
          local.y >= baseBoundingBox.minY &&
          local.y <= baseBoundingBox.maxY
        ) {
          groupDragRef.current = { bed: selectionBed, startLocal: local };
          setGroupDisplacement({ x: 0, y: 0 });
          return;
        }
      }
      const targetBed = activeBedId
        ? (beds.find((b) => b.id === activeBedId) ??
          findBedAtPoint(beds, global))
        : findBedAtPoint(beds, global);
      if (!targetBed) {
        if (!shiftKey) clearSelection();
        return;
      }
      const local = globalToBedLocal(targetBed, global);
      setMarqueeBed(targetBed);
      setStartPoint(local);
      setCurrentPoint(local);
      setIsMarqueeActive(true);
      if (!shiftKey) setSelectedCropIds(new Set());
    },
    [
      isEnabled,
      activeBedId,
      beds,
      clearSelection,
      baseBoundingBox,
      selectionBed
    ]
  );

  const handlePointerMove = useCallback(
    (global: Point, shiftKey = false) => {
      if (groupDragRef.current) {
        const drag = groupDragRef.current;
        const local = globalToBedLocal(drag.bed, global);
        setGroupDisplacement({
          x: local.x - drag.startLocal.x,
          y: local.y - drag.startLocal.y
        });
        return;
      }
      if (!isMarqueeActive || !marqueeBed || !startPoint) return;
      const local = globalToBedLocal(marqueeBed, global);
      setCurrentPoint(local);

      const box = computeMarqueeBox(startPoint, local);
      const bedCrops = cropsByBed.get(marqueeBed.id) ?? [];
      const foundIds = findCropsInMarquee(bedCrops, box);

      setSelectedCropIds((prev) => {
        const next = shiftKey ? new Set(prev) : new Set<string>();
        for (const id of foundIds) next.add(id);
        return next;
      });
    },
    [isMarqueeActive, marqueeBed, startPoint, cropsByBed]
  );

  const handlePointerUp = useCallback(async () => {
    const drag = groupDragRef.current;
    if (drag) {
      groupDragRef.current = null;
      const displacement = groupDisplacement;
      setGroupDisplacement(null);
      if (displacement && (displacement.x !== 0 || displacement.y !== 0)) {
        const bedCrops = cropsByBed.get(drag.bed.id) ?? [];
        const evaluation = evaluateGroupMovement({
          crops: bedCrops,
          selectedCropIds,
          displacementCm: displacement,
          bedDimensions: { width: drag.bed.width, height: drag.bed.height }
        });
        if (!evaluation.isValid) {
          onAnnounceError(t('bed.placement.group_move_conflict'));
        } else {
          try {
            await batchUpdateCrops(
              buildGroupMoves(selectedCropIds, bedCrops, displacement)
            );
            await invalidateBed(drag.bed.id);
          } catch {
            onAnnounceError(t('bed.placement.save_error'));
          }
        }
      }
      return;
    }
    setIsMarqueeActive(false);
    setMarqueeBed(null);
    setStartPoint(null);
    setCurrentPoint(null);
  }, [
    groupDisplacement,
    cropsByBed,
    selectedCropIds,
    invalidateBed,
    onAnnounceError
  ]);

  const handleCropClick = useCallback(
    (event: React.MouseEvent, cropId: string) => {
      if (!isEnabled) return;
      event.stopPropagation();
      if (event.shiftKey) toggleCropSelection(cropId);
      else setSelectedCropIds(new Set([cropId]));
    },
    [isEnabled, toggleCropSelection]
  );

  const deleteSelectedCrops = useCallback(async () => {
    if (selectedCropIds.size === 0) return;
    const targetCrops = activeCrops.filter((c) => selectedCropIds.has(c.id));
    if (targetCrops.length === 0) return;
    try {
      await batchDeleteCrops(targetCrops);
      const affectedBeds = new Set(targetCrops.map((c) => c.bedId));
      for (const bedId of affectedBeds) await invalidateBed(bedId);
      clearSelection();
    } catch {
      onAnnounceError(t('bed.placement.save_error'));
    }
  }, [
    selectedCropIds,
    activeCrops,
    invalidateBed,
    clearSelection,
    onAnnounceError
  ]);

  const duplicateSelectedCrops = useCallback(async () => {
    if (selectedCropIds.size === 0) return;
    const targetCrops = activeCrops.filter((c) => selectedCropIds.has(c.id));
    if (targetCrops.length === 0) return;
    try {
      const affectedBeds = new Set(targetCrops.map((c) => c.bedId));
      for (const bedId of affectedBeds) {
        const bed = beds.find((b) => b.id === bedId);
        if (!bed) continue;
        const bedCrops = targetCrops.filter((c) => c.bedId === bedId);
        await batchDuplicateCrops(bedCrops, {
          width: bed.width,
          height: bed.height
        });
        await invalidateBed(bedId);
      }
      clearSelection();
    } catch {
      onAnnounceError(t('bed.placement.save_error'));
    }
  }, [
    selectedCropIds,
    activeCrops,
    beds,
    invalidateBed,
    clearSelection,
    onAnnounceError
  ]);

  return {
    selectedCropIds,
    selectedCropCount: selectedCropIds.size,
    isMarqueeActive,
    marqueeBedId: marqueeBed?.id ?? null,
    marqueeBox,
    boundingBox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleCropClick,
    toggleCropSelection,
    selectCropIds,
    selectSingleCrop,
    clearSelection,
    deleteSelectedCrops,
    duplicateSelectedCrops
  };
}
