import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import {
  DEFAULT_GARDEN_INPUT_SORT,
  GARDEN_INPUT_SORT_FIELDS,
  isGardenInputSortField,
  type GardenInputSort
} from '../../../services/gardenInputListQuery';
import {
  SORT_DIRECTIONS,
  isSortDirection,
  type SortDirection
} from '../../../services/listQuery';

export type GardenInputSortValue =
  `${GardenInputSort['field']}:${SortDirection}`;

export interface GardenInputSortOption {
  readonly value: GardenInputSortValue;
  readonly label: string;
}

const SORT_LABEL_KEYS: Record<GardenInputSortValue, I18nKey> = {
  'name:asc': 'gardenInput.sort.name_asc',
  'name:desc': 'gardenInput.sort.name_desc',
  'slug:asc': 'gardenInput.sort.slug_asc',
  'slug:desc': 'gardenInput.sort.slug_desc',
  'category:asc': 'gardenInput.sort.category_asc',
  'category:desc': 'gardenInput.sort.category_desc'
};

export function buildGardenInputSortOptions(): GardenInputSortOption[] {
  return GARDEN_INPUT_SORT_FIELDS.flatMap((field) =>
    SORT_DIRECTIONS.map((direction) => {
      const value: GardenInputSortValue = `${field}:${direction}`;
      return { value, label: t(SORT_LABEL_KEYS[value]) };
    })
  );
}

export function splitGardenInputSortValue(value: string): GardenInputSort {
  const [field = '', direction = ''] = value.split(':');
  return {
    field: isGardenInputSortField(field)
      ? field
      : DEFAULT_GARDEN_INPUT_SORT.field,
    direction: isSortDirection(direction)
      ? direction
      : DEFAULT_GARDEN_INPUT_SORT.direction
  };
}
