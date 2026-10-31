import type { QueryClient } from '@tanstack/react-query';
import { anomalyKeys } from './anomalyKeys';
import { familyKeys } from './familyKeys';
import { gardenInputKeys } from './gardenInputKeys';
import { plantKeys } from './plantKeys';
import { plantRelationKeys } from './plantRelationKeys';

export const catalogEditKeys = {
  plantEdit: (id: string) => [...plantKeys.all, 'edit', id] as const,
  familyEdit: (idOrSlug: string) =>
    [...familyKeys.all, 'edit', idOrSlug] as const,
  anomalyEdit: (idOrSlug: string) =>
    [...anomalyKeys.all, 'edit', idOrSlug] as const,
  gardenInputEdit: (idOrSlug: string) =>
    [...gardenInputKeys.all, 'edit', idOrSlug] as const
};

export async function invalidatePlantQueries(
  queryClient: QueryClient,
  plantId?: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: plantKeys.all }),
    plantId
      ? queryClient.invalidateQueries({ queryKey: plantKeys.detail(plantId) })
      : Promise.resolve(),
    plantId
      ? queryClient.invalidateQueries({
          queryKey: catalogEditKeys.plantEdit(plantId)
        })
      : Promise.resolve()
  ]);
}

export async function invalidateFamilyQueries(
  queryClient: QueryClient,
  idOrSlug?: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: familyKeys.all }),
    queryClient.invalidateQueries({ queryKey: plantKeys.all }),
    idOrSlug
      ? queryClient.invalidateQueries({ queryKey: familyKeys.detail(idOrSlug) })
      : Promise.resolve(),
    idOrSlug
      ? queryClient.invalidateQueries({
          queryKey: catalogEditKeys.familyEdit(idOrSlug)
        })
      : Promise.resolve()
  ]);
}

export async function invalidateAnomalyQueries(
  queryClient: QueryClient,
  idOrSlug?: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: anomalyKeys.all }),
    idOrSlug
      ? queryClient.invalidateQueries({
          queryKey: anomalyKeys.detail(idOrSlug)
        })
      : Promise.resolve(),
    idOrSlug
      ? queryClient.invalidateQueries({
          queryKey: catalogEditKeys.anomalyEdit(idOrSlug)
        })
      : Promise.resolve()
  ]);
}

export async function invalidateGardenInputQueries(
  queryClient: QueryClient,
  idOrSlug?: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: gardenInputKeys.all }),
    idOrSlug
      ? queryClient.invalidateQueries({
          queryKey: gardenInputKeys.detail(idOrSlug)
        })
      : Promise.resolve(),
    idOrSlug
      ? queryClient.invalidateQueries({
          queryKey: catalogEditKeys.gardenInputEdit(idOrSlug)
        })
      : Promise.resolve()
  ]);
}

export async function invalidatePlantRelationQueries(
  queryClient: QueryClient,
  plantId?: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: plantRelationKeys.all }),
    plantId
      ? queryClient.invalidateQueries({
          queryKey: plantRelationKeys.byPlant(plantId)
        })
      : Promise.resolve()
  ]);
}
