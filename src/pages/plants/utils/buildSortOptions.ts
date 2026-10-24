import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import {
  SORT_DIRECTIONS,
  isSortDirection,
  type SortDirection
} from '../../../services/listQuery';
import {
  DEFAULT_PLANT_SORT,
  PLANT_SORT_FIELDS,
  isPlantsSortField,
  type PlantsSortField
} from '../../../services/plantListQuery';

export type SortValue = `${PlantsSortField}:${SortDirection}`;

export interface SortOption {
  readonly value: SortValue;
  readonly label: string;
}

const SORT_LABEL_KEYS: Record<SortValue, I18nKey> = {
  'name:asc': 'plant.orders.combined.name_asc',
  'name:desc': 'plant.orders.combined.name_desc',
  'scientificName:asc': 'plant.orders.combined.scientificName_asc',
  'scientificName:desc': 'plant.orders.combined.scientificName_desc'
};

export function buildSortOptions(): SortOption[] {
  return PLANT_SORT_FIELDS.flatMap((field) =>
    SORT_DIRECTIONS.map((direction) => {
      const value: SortValue = `${field}:${direction}`;
      return { value, label: t(SORT_LABEL_KEYS[value]) };
    })
  );
}

export function splitSortValue(value: string): {
  field: PlantsSortField;
  direction: SortDirection;
} {
  const [field = '', direction = ''] = value.split(':');
  return {
    field: isPlantsSortField(field) ? field : DEFAULT_PLANT_SORT.field,
    direction: isSortDirection(direction)
      ? direction
      : DEFAULT_PLANT_SORT.direction
  };
}
