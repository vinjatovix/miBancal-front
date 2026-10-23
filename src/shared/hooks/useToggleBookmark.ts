import { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { QueryKey } from '@tanstack/react-query';

import {
  addPlantBookmark,
  removePlantBookmark
} from '../../services/bookmarks.service';
import type { PlantListRequest } from '../../services/plantListQuery';
import { AuthContext } from '../auth/authContextDef';
import { bookmarkKeys } from '../reactQuery/bookmarkKeys';
import { plantKeys } from '../reactQuery/plantKeys';

interface ToggleBookmarkParams {
  readonly plantId: string;
  readonly isFavorite: boolean;
}

interface ToggleBookmarkContext {
  readonly previous?: Set<string>;
}

function toggledSet(
  previous: Set<string> | undefined,
  params: ToggleBookmarkParams
) {
  const next = new Set(previous ?? []);
  if (params.isFavorite) {
    next.delete(params.plantId);
  } else {
    next.add(params.plantId);
  }
  return next;
}

function isBookmarkedPlantListQuery(queryKey: QueryKey): boolean {
  const [root, type, request] = queryKey;
  return (
    root === plantKeys.all[0] &&
    type === 'list' &&
    (request as PlantListRequest | undefined)?.filters?.bookmarked !== undefined
  );
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  const listKey = bookmarkKeys.list(auth?.user?.id);

  return useMutation<
    void,
    unknown,
    ToggleBookmarkParams,
    ToggleBookmarkContext
  >({
    mutationFn: async ({ plantId, isFavorite }) => {
      if (isFavorite) {
        await removePlantBookmark(plantId);
      } else {
        await addPlantBookmark(plantId);
      }
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Set<string>>(listKey);
      queryClient.setQueryData(listKey, toggledSet(previous, params));
      return { previous };
    },
    onError: (_error, params, context) => {
      queryClient.setQueryData<Set<string>>(listKey, (current) => {
        if (!current) return current;
        const next = new Set(current);
        if (context?.previous?.has(params.plantId)) {
          next.add(params.plantId);
        } else {
          next.delete(params.plantId);
        }
        return next;
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({
        predicate: (query) => isBookmarkedPlantListQuery(query.queryKey)
      });
    }
  });
}
