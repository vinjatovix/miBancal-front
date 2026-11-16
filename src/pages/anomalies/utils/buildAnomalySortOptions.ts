import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import {
  DEFAULT_ANOMALY_SORT,
  ANOMALY_SORT_FIELDS,
  isAnomalySortField,
  type AnomalySort
} from '../../../services/anomalyListQuery';
import {
  SORT_DIRECTIONS,
  isSortDirection,
  type SortDirection
} from '../../../services/listQuery';

export type AnomalySortValue = `${AnomalySort['field']}:${SortDirection}`;

export interface AnomalySortOption {
  readonly value: AnomalySortValue;
  readonly label: string;
}

const SORT_LABEL_KEYS: Record<AnomalySortValue, I18nKey> = {
  'name:asc': 'anomaly.sort.name_asc',
  'name:desc': 'anomaly.sort.name_desc',
  'slug:asc': 'anomaly.sort.slug_asc',
  'slug:desc': 'anomaly.sort.slug_desc'
};

export function buildAnomalySortOptions(): AnomalySortOption[] {
  return ANOMALY_SORT_FIELDS.flatMap((field) =>
    SORT_DIRECTIONS.map((direction) => {
      const value: AnomalySortValue = `${field}:${direction}`;
      return { value, label: t(SORT_LABEL_KEYS[value]) };
    })
  );
}

export function splitAnomalySortValue(value: string): AnomalySort {
  const [field = '', direction = ''] = value.split(':');
  return {
    field: isAnomalySortField(field) ? field : DEFAULT_ANOMALY_SORT.field,
    direction: isSortDirection(direction)
      ? direction
      : DEFAULT_ANOMALY_SORT.direction
  };
}
