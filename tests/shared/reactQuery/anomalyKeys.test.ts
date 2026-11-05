import type { AnomalyListRequest } from '../../../src/services/anomalyListQuery';
import { anomalyKeys } from '../../../src/shared/reactQuery/anomalyKeys';

const request: AnomalyListRequest = {
  filters: { category: 'pest' },
  pagination: { page: 1, limit: 25 },
  sort: { field: 'name', direction: 'asc' }
};

describe('anomalyKeys', () => {
  it('agrupa todas las keys de anomalías', () => {
    expect(anomalyKeys.all).toEqual(['anomalies']);
  });

  it('la key del listado incluye la petición y, si se pasa, el scope', () => {
    expect(anomalyKeys.list(request)).toEqual(['anomalies', 'list', request]);
    expect(anomalyKeys.list(request, 'editorial')).toEqual([
      'anomalies',
      'list',
      request,
      'editorial'
    ]);
  });

  it('la key del detalle incluye el slug y, si se pasa, el scope', () => {
    expect(anomalyKeys.detail('pulgon-verde')).toEqual([
      'anomalies',
      'detail',
      'pulgon-verde'
    ]);
    expect(anomalyKeys.detail('pulgon-verde', 'public')).toEqual([
      'anomalies',
      'detail',
      'pulgon-verde',
      'public'
    ]);
  });
});
