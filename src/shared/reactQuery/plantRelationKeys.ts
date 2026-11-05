import type { PlantRelationListRequest } from '../../types/Plants/PlantRelation';

export const plantRelationKeys = {
  all: ['plantRelations'] as const,
  lists: () => [...plantRelationKeys.all, 'list'] as const,
  list: (params?: PlantRelationListRequest) =>
    params !== undefined
      ? ([...plantRelationKeys.all, 'list', params] as const)
      : ([...plantRelationKeys.all, 'list'] as const),
  byPlant: (plantId: string) =>
    [...plantRelationKeys.all, 'byPlant', plantId] as const
};
