import { describe, it, expect } from 'vitest';
import { getPlantListEmptyState } from '../../../../src/pages/plants/utils/getPlantListEmptyState';

describe('getPlantListEmptyState', () => {
  it('is outOfRange beyond the first page when there are results', () => {
    expect(
      getPlantListEmptyState({
        page: 3,
        totalItems: 10,
        hasActiveFilters: true
      })
    ).toBe('outOfRange');
  });

  it('is noMatches with active filters and no results', () => {
    expect(
      getPlantListEmptyState({ page: 1, totalItems: 0, hasActiveFilters: true })
    ).toBe('noMatches');
  });

  it('is noMatches beyond the first page when the filters match nothing', () => {
    expect(
      getPlantListEmptyState({ page: 2, totalItems: 0, hasActiveFilters: true })
    ).toBe('noMatches');
  });

  it('is emptyCatalog without filters nor results', () => {
    expect(
      getPlantListEmptyState({
        page: 1,
        totalItems: 0,
        hasActiveFilters: false
      })
    ).toBe('emptyCatalog');
  });
});
