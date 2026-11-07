import { useCallback, useMemo, useState } from 'react';

import type {
  DraftPlacement,
  ResolvedBed
} from '../../../../components/beds/layout/utils/layoutTypes';
import type { BedPosition } from '../../../../types/Location/LocationLayout';

export type GetServerPlacement = (id: string) => DraftPlacement;

export interface LayoutDraft {
  readonly placements: ReadonlyMap<string, DraftPlacement>;
  readonly dirty: boolean;
  readonly moveBed: (id: string, position: BedPosition) => void;
  readonly rotateBed: (id: string, rotation: number) => void;
  readonly placeBed: (id: string, placement: DraftPlacement) => void;
  readonly unplaceBed: (id: string) => void;
  readonly discard: () => void;
  readonly markSaved: () => void;
}

export function normalizeRotation(rotation: number): number {
  return ((Math.round(rotation) % 360) + 360) % 360;
}

export function resolvePlacement(
  bed: ResolvedBed,
  draft: ReadonlyMap<string, DraftPlacement>
): DraftPlacement {
  return (
    draft.get(bed.id) ?? { position: bed.position, rotation: bed.rotation }
  );
}

export function useLayoutDraft(
  getServerPlacement: GetServerPlacement
): LayoutDraft {
  const [placements, setPlacements] = useState<
    ReadonlyMap<string, DraftPlacement>
  >(new Map());

  const update = useCallback(
    (id: string, next: (current: DraftPlacement) => DraftPlacement) => {
      setPlacements((prev) => {
        const current = prev.get(id) ?? getServerPlacement(id);
        const draft = new Map(prev);
        draft.set(id, next(current));
        return draft;
      });
    },
    [getServerPlacement]
  );

  const moveBed = useCallback(
    (id: string, position: BedPosition) => {
      update(id, (current) => ({ ...current, position }));
    },
    [update]
  );

  const rotateBed = useCallback(
    (id: string, rotation: number) => {
      update(id, (current) => ({
        ...current,
        rotation: normalizeRotation(rotation)
      }));
    },
    [update]
  );

  const placeBed = useCallback(
    (id: string, placement: DraftPlacement) => {
      update(id, () => ({
        position: placement.position,
        rotation: normalizeRotation(placement.rotation)
      }));
    },
    [update]
  );

  const unplaceBed = useCallback(
    (id: string) => {
      update(id, (current) => ({ ...current, position: null }));
    },
    [update]
  );

  const discard = useCallback(() => {
    setPlacements(new Map());
  }, []);

  const markSaved = useCallback(() => {
    setPlacements(new Map());
  }, []);

  return useMemo(
    () => ({
      placements,
      dirty: placements.size > 0,
      moveBed,
      rotateBed,
      placeBed,
      unplaceBed,
      discard,
      markSaved
    }),
    [placements, moveBed, rotateBed, placeBed, unplaceBed, discard, markSaved]
  );
}
