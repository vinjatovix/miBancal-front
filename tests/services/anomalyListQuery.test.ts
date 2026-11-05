import { describe, expect, it } from 'vitest';

import {
  ANOMALY_FIELDS_QUERY_KEY,
  ANOMALY_FILTER_QUERY_KEYS,
  ANOMALY_LIST_FIELDS,
  ANOMALY_SORT_FIELDS,
  DEFAULT_ANOMALY_SORT,
  anomalySortQueryKey,
  isAnomalySortField
} from '../../src/services/anomalyListQuery';

describe('anomalyListQuery', () => {
  it('declares only contract filter keys', () => {
    const keys = ANOMALY_FILTER_QUERY_KEYS;

    expect(keys).toEqual({
      category: 'filter[category][eq]'
    });
  });

  it('declares the sparse fieldset query key as fields[anomalies]', () => {
    const key = ANOMALY_FIELDS_QUERY_KEY;

    expect(key).toBe('fields[anomalies]');
  });

  it('includes resources in the list sparse fieldset fields', () => {
    const fieldsString = ANOMALY_LIST_FIELDS.join(',');

    expect(fieldsString).toBe(
      'slug,name,scientificName,category,status,deletedAt,resources'
    );
  });

  it('sorts by name or slug with ascending name by default', () => {
    const defaultSort = DEFAULT_ANOMALY_SORT;

    expect(ANOMALY_SORT_FIELDS).toEqual(['name', 'slug']);
    expect(defaultSort).toEqual({ field: 'name', direction: 'asc' });
    expect(anomalySortQueryKey('name')).toBe('sort[name]');
    expect(anomalySortQueryKey('slug')).toBe('sort[slug]');
  });

  it('recognizes only declared sort fields', () => {
    const isSlug = isAnomalySortField('slug');
    const isCategory = isAnomalySortField('category');

    expect(isSlug).toBe(true);
    expect(isCategory).toBe(false);
  });
});
