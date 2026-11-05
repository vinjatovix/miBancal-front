import type { GardenInputListRequest } from '../../services/gardenInputListQuery';

export type GardenInputRoleScope = 'editorial' | 'public';

export const gardenInputKeys = {
  all: ['gardenInputs'] as const,
  lists: () => [...gardenInputKeys.all, 'list'] as const,
  list: (request: GardenInputListRequest, scope?: GardenInputRoleScope) =>
    scope !== undefined
      ? ([...gardenInputKeys.all, 'list', request, scope] as const)
      : ([...gardenInputKeys.all, 'list', request] as const),
  details: () => [...gardenInputKeys.all, 'detail'] as const,
  detail: (idOrSlug?: string, scope?: GardenInputRoleScope) =>
    scope !== undefined
      ? ([...gardenInputKeys.all, 'detail', idOrSlug, scope] as const)
      : ([...gardenInputKeys.all, 'detail', idOrSlug] as const)
};
