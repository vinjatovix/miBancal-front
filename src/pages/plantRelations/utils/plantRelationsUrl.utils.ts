import type { RelationTabFilter } from '../../../types/Plants/PlantRelation';
import {
  DEFAULT_PLANT_SORT,
  isPlantsSortField,
  type PlantSort
} from '../../../services/plantListQuery';
import { isSortDirection } from '../../../services/listQuery';

export interface PlantRelationsUrlState {
  readonly plantId: string | null;
  readonly type: RelationTabFilter;
  readonly sort: PlantSort;
}

export function parsePlantRelationsSearchParams(
  searchParams: URLSearchParams
): PlantRelationsUrlState {
  const plantId = searchParams.get('plantId')?.trim() || null;
  const rawType = searchParams.get('type');
  const type: RelationTabFilter =
    rawType === 'beneficial' || rawType === 'detrimental' ? rawType : 'all';

  const rawSort = searchParams.get('sort');
  let sort: PlantSort = DEFAULT_PLANT_SORT;

  if (rawSort) {
    const [field = '', direction = ''] = rawSort.split(':');
    if (isPlantsSortField(field) && isSortDirection(direction)) {
      sort = { field, direction };
    }
  }

  return { plantId, type, sort };
}

export function buildPlantRelationsSearchParams({
  plantId,
  type,
  sort = DEFAULT_PLANT_SORT
}: {
  readonly plantId: string | null;
  readonly type: RelationTabFilter;
  readonly sort?: PlantSort;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (plantId) {
    params.set('plantId', plantId);
  }

  if (type !== 'all') {
    params.set('type', type);
  }

  if (
    sort &&
    (sort.field !== DEFAULT_PLANT_SORT.field ||
      sort.direction !== DEFAULT_PLANT_SORT.direction)
  ) {
    params.set('sort', `${sort.field}:${sort.direction}`);
  }

  return params;
}
