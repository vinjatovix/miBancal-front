import type { QueryClient } from '@tanstack/react-query';
import { familyKeys } from './familyKeys';
import { plantKeys } from './plantKeys';

export const catalogEditKeys = {
  plantEdit: (id: string) => [...plantKeys.all, 'edit', id] as const,
  familyEdit: (idOrSlug: string) =>
    [...familyKeys.all, 'edit', idOrSlug] as const
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
