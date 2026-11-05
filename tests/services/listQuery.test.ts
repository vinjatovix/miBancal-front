import {
  PAGINATION_LIMIT_MAX,
  PAGINATION_QUERY_KEYS,
  SORT_DIRECTIONS,
  isSortDirection
} from '../../src/services/listQuery';
import { SUPPORTED_LIMITS } from '../../src/shared/components/constants';

describe('listQuery', () => {
  it('declara los sentidos de orden del contrato', () => {
    expect(SORT_DIRECTIONS).toEqual(['asc', 'desc']);
  });

  it('reconoce solo sentidos de orden declarados', () => {
    expect(isSortDirection('desc')).toBe(true);
    expect(isSortDirection('up')).toBe(false);
  });

  it('declara las claves de paginación y su máximo', () => {
    expect(PAGINATION_QUERY_KEYS).toEqual({
      page: 'pagination[page]',
      limit: 'pagination[limit]'
    });
    expect(PAGINATION_LIMIT_MAX).toBe(100);
  });

  it.each(SUPPORTED_LIMITS)(
    'el límite %i del selector no supera el máximo del contrato',
    (limit) => {
      expect(limit).toBeGreaterThanOrEqual(1);
      expect(limit).toBeLessThanOrEqual(PAGINATION_LIMIT_MAX);
    }
  );
});
