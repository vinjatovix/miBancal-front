import type { PlantListRequest } from '../../services/plantListQuery';

export type PlantRoleScope = 'admin' | 'public';

export const plantKeys = {
  all: ['plants'] as const,
  list: (request: PlantListRequest, scope?: PlantRoleScope) =>
    scope !== undefined
      ? ([...plantKeys.all, 'list', request, scope] as const)
      : ([...plantKeys.all, 'list', request] as const),
  detail: (id?: string, scope?: PlantRoleScope) =>
    scope !== undefined
      ? ([...plantKeys.all, 'detail', id, scope] as const)
      : ([...plantKeys.all, 'detail', id] as const),
  family: (familyId?: string, scope?: PlantRoleScope) =>
    scope !== undefined
      ? ([...plantKeys.all, 'family', familyId, scope] as const)
      : ([...plantKeys.all, 'family', familyId] as const),
  likeState: (plantId: string, userId?: string) =>
    userId !== undefined
      ? ([...plantKeys.all, 'likeState', plantId, userId] as const)
      : ([...plantKeys.all, 'likeState', plantId] as const)
};
