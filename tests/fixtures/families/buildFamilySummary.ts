import type { FamilySummary } from '../../../src/types/FamilySummary';
import { listFamiliesResponse } from './listFamilies';

export function buildFamilySummary(
  overrides: Partial<FamilySummary> = {}
): FamilySummary {
  const [firstFamily] = listFamiliesResponse.data;
  return {
    id: firstFamily.id,
    name: firstFamily.name,
    slug: firstFamily.slug,
    ...overrides
  };
}
