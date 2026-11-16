import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import {
  diffAdjustedBedIds,
  type PlacementSnapshot
} from '../../../../components/beds/layout/utils/layoutGeometry';
import {
  getLocationLayout,
  updateBedsLayout,
  type LocationLayoutWithMeta
} from '../../../../services/locations.service';
import { ApiError } from '../../../../shared/errors/ApiError';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';
import type {
  BedLayoutPlacementInput,
  LocationLayoutResponse
} from '../../../../types/Location/LocationLayout';

export type LayoutConflict = 'overlap' | 'validation' | 'concurrency';

type Placements = readonly BedLayoutPlacementInput[];

export interface UseBedsLayoutMutationReturn {
  readonly mutation: UseMutationResult<{ etag: string }, unknown, Placements>;
  readonly adjustedBedIds: readonly string[];
  readonly conflict: LayoutConflict | null;
  readonly collisionBedIds: readonly string[];
  readonly clearNotices: () => void;
}

const BED_ID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function extractBedIds(message: string): readonly string[] {
  return message.match(BED_ID_PATTERN) ?? [];
}

function serverSnapshots(
  layout: LocationLayoutResponse
): readonly PlacementSnapshot[] {
  return [
    ...layout.placedBeds.map((bed) => ({
      id: bed.id,
      position: bed.position,
      rotation: bed.rotation
    })),
    ...layout.unplacedBeds.map((bed) => ({
      id: bed.id,
      position: null,
      rotation: bed.rotation
    }))
  ];
}

function sentSnapshots(placements: Placements): readonly PlacementSnapshot[] {
  return placements.map((placement) => ({
    id: placement.id,
    position: placement.position,
    rotation: placement.rotation ?? 0
  }));
}

function conflictForError(
  status: number,
  collisionBedIds: readonly string[]
): LayoutConflict | null {
  if (status === 412) return 'concurrency';
  if (status === 409 || collisionBedIds.length > 0) return 'overlap';
  if (status === 400) return 'validation';
  return null;
}

export function useBedsLayoutMutation(
  id: string,
  etag: string
): UseBedsLayoutMutationReturn {
  const queryClient = useQueryClient();
  const [adjustedBedIds, setAdjustedBedIds] = useState<readonly string[]>([]);
  const [conflict, setConflict] = useState<LayoutConflict | null>(null);
  const [collisionBedIds, setCollisionBedIds] = useState<readonly string[]>([]);

  const reloadLayout = useCallback(
    () =>
      queryClient.fetchQuery<LocationLayoutWithMeta>({
        queryKey: locationKeys.layout(id),
        queryFn: () => getLocationLayout(id)
      }),
    [queryClient, id]
  );

  const mutation = useMutation<{ etag: string }, unknown, Placements>({
    mutationFn: (placements) => updateBedsLayout(id, placements, etag),
    onSuccess: async (_result, placements) => {
      setConflict(null);
      setCollisionBedIds([]);
      const fresh = await reloadLayout();
      setAdjustedBedIds(
        diffAdjustedBedIds(
          sentSnapshots(placements),
          serverSnapshots(fresh.layout)
        )
      );
    },
    onError: async (error) => {
      const status = error instanceof ApiError ? error.status : 0;
      const bedIds =
        error instanceof ApiError ? extractBedIds(error.message) : [];
      setCollisionBedIds(bedIds);
      setConflict(conflictForError(status, bedIds));
      if (status === 412) {
        await reloadLayout();
      }
    }
  });

  const clearNotices = useCallback(() => {
    setAdjustedBedIds([]);
    setConflict(null);
    setCollisionBedIds([]);
  }, []);

  return { mutation, adjustedBedIds, conflict, collisionBedIds, clearNotices };
}
