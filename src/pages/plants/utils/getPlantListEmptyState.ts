export type PlantListEmptyState = 'outOfRange' | 'noMatches' | 'emptyCatalog';

export type PlantListEmptyStateInput = {
  page: number;
  totalItems: number;
  hasActiveFilters: boolean;
};

export function getPlantListEmptyState({
  page,
  totalItems,
  hasActiveFilters
}: PlantListEmptyStateInput): PlantListEmptyState {
  if (page > 1 && totalItems > 0) return 'outOfRange';
  return hasActiveFilters ? 'noMatches' : 'emptyCatalog';
}
