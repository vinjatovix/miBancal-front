import type { PlantListRequest } from '../../../services/plantListQuery';
import { buildActiveFilters } from './buildActiveFilters';

export function countActiveFilters(
  request: PlantListRequest,
  hemisphere: 'north' | 'south'
): number {
  return buildActiveFilters(request, { hemisphere }).length;
}
