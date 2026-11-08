import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  computeViewBox,
  type RotatedRectInput
} from '../../../../components/beds/layout/utils/layoutGeometry';
import type {
  LayoutMode,
  ResolvedBed
} from '../../../../components/beds/layout/utils/layoutTypes';
import {
  applySnap,
  GRID_SPACING_CM
} from '../../../../components/beds/layout/utils/snapConfig';
import { t } from '../../../../i18n/core/t';
import { useToast } from '../../../../shared/toast/useToast';
import type {
  BedLayoutPlacementInput,
  BedPosition,
  LocationLayoutResponse,
  UnplacedBedSummary
} from '../../../../types/Location/LocationLayout';
import { useLayoutDraft, type GetServerPlacement } from './useLayoutDraft';
import { useBedsLayoutMutation } from './useBedsLayoutMutation';

interface BedMeta {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

export interface LayoutEditor {
  readonly mode: LayoutMode;
  readonly gridSnapEnabled: boolean;
  readonly neighborSnapEnabled: boolean;
  readonly selectedId: string | null;
  readonly placedBeds: readonly ResolvedBed[];
  readonly unplacedBeds: readonly UnplacedBedSummary[];
  readonly viewBox: string;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly discardOpen: boolean;
  readonly selectedRotation: number;
  readonly toggleMode: () => void;
  readonly startPlanting: (bedId?: string) => void;
  readonly stopPlanting: () => void;
  readonly discard: () => void;
  readonly confirmDiscard: () => void;
  readonly cancelDiscard: () => void;
  readonly toggleGridSnap: () => void;
  readonly toggleNeighborSnap: () => void;
  readonly selectBed: (id: string) => void;
  readonly deselectBed: () => void;
  readonly moveBed: (id: string, dx: number, dy: number) => void;
  readonly rotateBedBy: (id: string, delta: number) => void;
  readonly setSelectedRotation: (value: number) => void;
  readonly placeBed: (id: string) => void;
  readonly unplaceSelected: () => void;
  readonly save: () => void;
}

function buildMetas(layout: LocationLayoutResponse): Map<string, BedMeta> {
  const metas = new Map<string, BedMeta>();
  for (const bed of [...layout.placedBeds, ...layout.unplacedBeds]) {
    metas.set(bed.id, {
      id: bed.id,
      name: bed.name,
      width: bed.width,
      height: bed.height
    });
  }
  return metas;
}

function toRect(bed: ResolvedBed): RotatedRectInput {
  return {
    position: bed.position,
    width: bed.width,
    height: bed.height,
    rotation: bed.rotation
  };
}

export function useLayoutEditor(
  id: string,
  etag: string,
  layout: LocationLayoutResponse
): LayoutEditor {
  const [mode, setMode] = useState<LayoutMode>('read');
  const [gridSnapEnabled, setGridSnapEnabled] = useState(true);
  const [neighborSnapEnabled, setNeighborSnapEnabled] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const rawDragPositions = useRef<Map<string, BedPosition>>(new Map());
  const toast = useToast();

  const resetDragPositions = useCallback(() => {
    rawDragPositions.current.clear();
  }, []);

  const metas = useMemo(() => buildMetas(layout), [layout]);

  const getServerPlacement = useCallback<GetServerPlacement>(
    (bedId) => {
      const placed = layout.placedBeds.find((bed) => bed.id === bedId);
      if (placed) {
        return { position: placed.position, rotation: placed.rotation };
      }
      const unplaced = layout.unplacedBeds.find((bed) => bed.id === bedId);
      return { position: null, rotation: unplaced?.rotation ?? 0 };
    },
    [layout]
  );

  const draft = useLayoutDraft(getServerPlacement);
  const { mutation, adjustedBedIds, conflict, collisionBedIds, clearNotices } =
    useBedsLayoutMutation(id, etag);

  const placedBeds = useMemo<readonly ResolvedBed[]>(() => {
    return [...metas.values()].flatMap((meta) => {
      const effective =
        draft.placements.get(meta.id) ?? getServerPlacement(meta.id);
      if (effective.position === null) return [];
      return [
        { ...meta, position: effective.position, rotation: effective.rotation }
      ];
    });
  }, [metas, draft.placements, getServerPlacement]);

  const unplacedBeds = useMemo<readonly UnplacedBedSummary[]>(() => {
    return [...metas.values()].flatMap((meta) => {
      const effective =
        draft.placements.get(meta.id) ?? getServerPlacement(meta.id);
      if (effective.position !== null) return [];
      return [{ ...meta, position: null, rotation: effective.rotation }];
    });
  }, [metas, draft.placements, getServerPlacement]);

  const viewBox = useMemo(
    () =>
      computeViewBox({
        location: {
          width: layout.location.width,
          height: layout.location.height
        },
        placedBeds: placedBeds.map(toRect)
      }),
    [layout.location.width, layout.location.height, placedBeds]
  );

  const moveBed = useCallback(
    (bedId: string, dx: number, dy: number) => {
      const bed = placedBeds.find((item) => item.id === bedId);
      if (!bed) return;
      const rawBase = rawDragPositions.current.get(bedId) ?? bed.position;
      const rawNext = { x: rawBase.x + dx, y: rawBase.y + dy };
      rawDragPositions.current.set(bedId, rawNext);
      const neighbors = placedBeds
        .filter((item) => item.id !== bedId)
        .map(toRect);
      const snapped = applySnap(
        {
          position: rawNext,
          width: bed.width,
          height: bed.height,
          rotation: bed.rotation
        },
        neighbors,
        {
          enabled: neighborSnapEnabled,
          gridSpacing: gridSnapEnabled ? GRID_SPACING_CM : undefined
        }
      );
      draft.placeBed(bedId, {
        position: snapped.position,
        rotation: snapped.rotation
      });
    },
    [placedBeds, neighborSnapEnabled, gridSnapEnabled, draft]
  );

  const rotateBedBy = useCallback(
    (bedId: string, delta: number) => {
      const bed = placedBeds.find((item) => item.id === bedId);
      if (!bed) return;
      draft.rotateBed(bedId, bed.rotation + delta);
    },
    [placedBeds, draft]
  );

  const setSelectedRotation = useCallback(
    (value: number) => {
      if (selectedId) draft.rotateBed(selectedId, value);
    },
    [selectedId, draft]
  );

  const placeBed = useCallback(
    (bedId: string) => {
      resetDragPositions();
      draft.placeBed(bedId, { position: { x: 0, y: 0 }, rotation: 0 });
      setSelectedId(bedId);
    },
    [draft, resetDragPositions]
  );

  const unplaceSelected = useCallback(() => {
    if (selectedId) {
      resetDragPositions();
      draft.unplaceBed(selectedId);
      setSelectedId(null);
    }
  }, [selectedId, draft, resetDragPositions]);

  const save = useCallback(() => {
    const placements: BedLayoutPlacementInput[] = [
      ...draft.placements.entries()
    ].map(([bedId, placement]) => ({
      id: bedId,
      position: placement.position,
      rotation: placement.rotation
    }));
    if (placements.length === 0 || etag === '') return;
    mutation.mutate(placements, { onSuccess: () => draft.markSaved() });
  }, [draft, etag, mutation]);

  const toggleMode = useCallback(() => {
    if (mode !== 'position') {
      setMode('position');
      return;
    }
    if (draft.dirty) {
      setDiscardOpen(true);
      return;
    }
    setMode('read');
    setSelectedId(null);
  }, [mode, draft.dirty]);

  const startPlanting = useCallback((bedId?: string) => {
    setMode('plants');
    if (bedId) setSelectedId(bedId);
  }, []);

  const stopPlanting = useCallback(() => {
    setMode('read');
  }, []);

  const confirmDiscard = useCallback(() => {
    resetDragPositions();
    draft.discard();
    setDiscardOpen(false);
    setMode('read');
    setSelectedId(null);
  }, [draft, resetDragPositions]);

  const discard = useCallback(() => {
    resetDragPositions();
    draft.discard();
    setSelectedId(null);
  }, [draft, resetDragPositions]);

  const cancelDiscard = useCallback(() => setDiscardOpen(false), []);
  const toggleGridSnap = useCallback(
    () => setGridSnapEnabled((prev) => !prev),
    []
  );
  const toggleNeighborSnap = useCallback(
    () => setNeighborSnapEnabled((prev) => !prev),
    []
  );
  const selectBed = useCallback(
    (bedId: string) => {
      resetDragPositions();
      setSelectedId(bedId);
    },
    [resetDragPositions]
  );
  const deselectBed = useCallback(() => {
    resetDragPositions();
    setSelectedId(null);
  }, [resetDragPositions]);

  useEffect(() => {
    if (adjustedBedIds.length === 0) return;
    const names = adjustedBedIds
      .map((bedId) => metas.get(bedId)?.name ?? bedId)
      .join(', ');
    toast.showToast({
      message: t('bed.layout.adjusted_notice', { names }),
      variant: 'info'
    });
    clearNotices();
  }, [adjustedBedIds, metas, toast, clearNotices]);

  useEffect(() => {
    if (!conflict) return;
    if (conflict === 'concurrency') {
      draft.discard();
      toast.showToast({
        message: t('bed.layout.concurrency_warning'),
        variant: 'warning'
      });
    } else if (conflict === 'overlap') {
      const names = collisionBedIds
        .map((bedId) => metas.get(bedId)?.name)
        .filter((name): name is string => Boolean(name));
      toast.showToast({
        message:
          names.length >= 2
            ? t('bed.layout.overlap_error_named', { names: names.join(', ') })
            : t('bed.layout.overlap_error'),
        variant: 'error'
      });
    } else {
      toast.showErrorToast(mutation.error);
    }
    clearNotices();
  }, [
    conflict,
    collisionBedIds,
    metas,
    draft,
    toast,
    clearNotices,
    mutation.error
  ]);

  const selectedRotation =
    placedBeds.find((bed) => bed.id === selectedId)?.rotation ?? 0;

  return {
    mode,
    gridSnapEnabled,
    neighborSnapEnabled,
    selectedId,
    placedBeds,
    unplacedBeds,
    viewBox,
    dirty: draft.dirty,
    saving: mutation.isPending,
    discardOpen,
    selectedRotation,
    toggleMode,
    startPlanting,
    stopPlanting,
    discard,
    confirmDiscard,
    cancelDiscard,
    toggleGridSnap,
    toggleNeighborSnap,
    selectBed,
    deselectBed,
    moveBed,
    rotateBedBy,
    setSelectedRotation,
    placeBed,
    unplaceSelected,
    save
  };
}
