import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';

import { t } from '../../../../i18n/core/t';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  BatchCropMoveItem,
  MarqueeBox
} from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import {
  buildGroupMoves,
  computeMarqueeBox,
  evaluateGroupMovement,
  findCropsInMarquee
} from '../utils/selectionGeometry';

export interface UseCanvasMarqueeSelectionParams {
  readonly isEnabled: boolean;
  readonly crops: readonly CropPlacementItem[];
  readonly selectedCropIds: ReadonlySet<string>;
  readonly bedDimensions?: { readonly width: number; readonly height: number };
  readonly onSelectCropIds: (ids: ReadonlySet<string>) => void;
  readonly onToggleCropSelection: (id: string) => void;
  readonly onClearSelection: () => void;
  readonly onMoveCrops?: (moves: readonly BatchCropMoveItem[]) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly screenToBedCoordinates: (
    clientX: number,
    clientY: number
  ) => Coordinates | null;
}

export interface UseCanvasMarqueeSelectionResult {
  readonly isMarqueeActive: boolean;
  readonly isDraggingGroup: boolean;
  readonly hasGroupConflict: boolean;
  readonly marqueeBox: MarqueeBox | null;
  readonly handlePointerDown: (e: React.PointerEvent) => void;
  readonly handlePointerMove: (e: React.PointerEvent) => void;
  readonly handlePointerUp: (e: React.PointerEvent) => void;
  readonly handleCropClick: (e: React.MouseEvent, cropId: string) => void;
  readonly handleCropKeyDown: (e: React.KeyboardEvent, cropId: string) => void;
  readonly handleCropPointerDown: (
    e: React.PointerEvent,
    cropId: string
  ) => void;
  readonly cancelMarquee: () => void;
}

export function useCanvasMarqueeSelection({
  isEnabled,
  crops,
  selectedCropIds,
  bedDimensions = { width: 200, height: 100 },
  onSelectCropIds,
  onToggleCropSelection,
  onClearSelection,
  onMoveCrops,
  onAnnounce,
  screenToBedCoordinates
}: UseCanvasMarqueeSelectionParams): UseCanvasMarqueeSelectionResult {
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [hasGroupConflict, setHasGroupConflict] = useState(false);
  const [groupDisplacement, setGroupDisplacement] = useState<Coordinates>({
    x: 0,
    y: 0
  });
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Coordinates | null>(null);
  const [initialSelectedAtDragStart, setInitialSelectedAtDragStart] = useState<
    ReadonlySet<string>
  >(new Set());

  const cancelMarquee = useCallback(() => {
    setIsMarqueeActive(false);
    setIsDraggingGroup(false);
    setHasGroupConflict(false);
    setGroupDisplacement({ x: 0, y: 0 });
    setStartPoint(null);
    setCurrentPoint(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMarqueeActive || isDraggingGroup) {
          cancelMarquee();
        } else if (selectedCropIds.size > 0) {
          onClearSelection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isMarqueeActive,
    isDraggingGroup,
    selectedCropIds,
    cancelMarquee,
    onClearSelection
  ]);

  const marqueeBox = useMemo(() => {
    if (!startPoint || !currentPoint || isDraggingGroup) {
      return null;
    }
    return computeMarqueeBox(startPoint, currentPoint);
  }, [startPoint, currentPoint, isDraggingGroup]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isEnabled || e.button !== 0) return;
      const coords = screenToBedCoordinates(e.clientX, e.clientY);
      if (!coords) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setStartPoint(coords);
      setCurrentPoint(coords);
      setInitialSelectedAtDragStart(e.shiftKey ? selectedCropIds : new Set());
      setIsMarqueeActive(true);
    },
    [isEnabled, selectedCropIds, screenToBedCoordinates]
  );

  const handleCropPointerDown = useCallback(
    (e: React.PointerEvent, cropId: string) => {
      if (!isEnabled || e.button !== 0 || !selectedCropIds.has(cropId)) return;
      const coords = screenToBedCoordinates(e.clientX, e.clientY);
      if (!coords) return;
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setStartPoint(coords);
      setCurrentPoint(coords);
      setIsDraggingGroup(true);
    },
    [isEnabled, selectedCropIds, screenToBedCoordinates]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if ((!isMarqueeActive && !isDraggingGroup) || !startPoint) {
        return;
      }

      const coords = screenToBedCoordinates(e.clientX, e.clientY);
      if (!coords) {
        return;
      }

      setCurrentPoint(coords);

      if (isDraggingGroup) {
        const dx = coords.x - startPoint.x;
        const dy = coords.y - startPoint.y;
        const evaluation = evaluateGroupMovement({
          crops,
          selectedCropIds,
          displacementCm: { x: dx, y: dy },
          bedDimensions
        });
        setHasGroupConflict(!evaluation.isValid);
        setGroupDisplacement({ x: dx, y: dy });
        return;
      }

      const box = computeMarqueeBox(startPoint, coords);
      const inBox = findCropsInMarquee(crops, box);

      const nextSelection = new Set(initialSelectedAtDragStart);
      for (const id of inBox) {
        nextSelection.add(id);
      }
      onSelectCropIds(nextSelection);
    },
    [
      isMarqueeActive,
      isDraggingGroup,
      startPoint,
      crops,
      selectedCropIds,
      bedDimensions,
      initialSelectedAtDragStart,
      onSelectCropIds,
      screenToBedCoordinates
    ]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as Element).releasePointerCapture?.(e.pointerId);

      if (isDraggingGroup) {
        if (hasGroupConflict) {
          onAnnounce?.(t('bed.placement.group_move_conflict'));
        } else if (groupDisplacement.x !== 0 || groupDisplacement.y !== 0) {
          const moves = buildGroupMoves(
            selectedCropIds,
            crops,
            groupDisplacement
          );
          if (moves.length > 0) onMoveCrops?.(moves);
        }
        cancelMarquee();
        return;
      }

      if (isMarqueeActive && currentPoint && startPoint) {
        const dx = currentPoint.x - startPoint.x;
        const dy = currentPoint.y - startPoint.y;
        const dragDist = Math.hypot(dx, dy);

        if (dragDist < 2 && !e.shiftKey) {
          onClearSelection();
        }
      }

      cancelMarquee();
    },
    [
      isDraggingGroup,
      hasGroupConflict,
      groupDisplacement,
      selectedCropIds,
      crops,
      onAnnounce,
      onMoveCrops,
      cancelMarquee,
      isMarqueeActive,
      currentPoint,
      startPoint,
      onClearSelection
    ]
  );

  const handleCropClick = useCallback(
    (e: React.MouseEvent, cropId: string) => {
      if (!isEnabled) return;
      e.stopPropagation();
      if (e.shiftKey) onToggleCropSelection(cropId);
      else onSelectCropIds(new Set([cropId]));
    },
    [isEnabled, onToggleCropSelection, onSelectCropIds]
  );

  const handleCropKeyDown = useCallback(
    (e: React.KeyboardEvent, cropId: string) => {
      if (isEnabled && e.shiftKey && e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onToggleCropSelection(cropId);
      }
    },
    [isEnabled, onToggleCropSelection]
  );

  return {
    isMarqueeActive,
    isDraggingGroup,
    hasGroupConflict,
    marqueeBox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleCropClick,
    handleCropKeyDown,
    handleCropPointerDown,
    cancelMarquee
  };
}
