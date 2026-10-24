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
  it('declara solo las claves de filtro del contrato', () => {
    expect(ANOMALY_FILTER_QUERY_KEYS).toEqual({
      category: 'filter[category][eq]'
    });
  });

  it('pide en el listado solo los campos que se pintan', () => {
    expect(ANOMALY_FIELDS_QUERY_KEY).toBe('fields[anomalies]');
    expect(ANOMALY_LIST_FIELDS.join(',')).toBe(
      'slug,name,scientificName,category,status,deletedAt'
    );
  });

  it('ordena por name o slug con name ascendente por defecto', () => {
    expect(ANOMALY_SORT_FIELDS).toEqual(['name', 'slug']);
    expect(DEFAULT_ANOMALY_SORT).toEqual({ field: 'name', direction: 'asc' });
    expect(anomalySortQueryKey('name')).toBe('sort[name]');
    expect(anomalySortQueryKey('slug')).toBe('sort[slug]');
  });

  it('reconoce solo campos de orden declarados', () => {
    expect(isAnomalySortField('slug')).toBe(true);
    expect(isAnomalySortField('category')).toBe(false);
  });
});
