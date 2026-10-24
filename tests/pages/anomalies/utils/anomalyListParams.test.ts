import {
  countActiveFilters,
  parseAnomalyListSearchParams,
  withListPage,
  withListParam,
  withListSort,
  withoutListPage
} from '../../../../src/pages/anomalies/utils/anomalyListParams';

function parse(search: string) {
  return parseAnomalyListSearchParams(new URLSearchParams(search));
}

describe('parseAnomalyListSearchParams', () => {
  it('devuelve valores por defecto sin parámetros', () => {
    expect(parse('')).toEqual({
      filters: {},
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' }
    });
  });

  it('lee categoría, orden, página y límite tipados', () => {
    expect(
      parse('category=weed&sortField=slug&sortDirection=desc&page=3&limit=50')
    ).toEqual({
      filters: { category: 'weed' },
      pagination: { page: 3, limit: 50 },
      sort: { field: 'slug', direction: 'desc' }
    });
  });

  it('descarta categoría, orden y límite no declarados', () => {
    expect(
      parse(
        'category=virus&sortField=category&sortDirection=up&limit=7&page=-1'
      )
    ).toEqual({
      filters: {},
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' }
    });
  });

  it('ignora claves de URL no declaradas', () => {
    const request = parse('filter[category][in]=pest&foo=bar&status=DELETED');

    expect(request.filters).toEqual({});
  });
});

describe('countActiveFilters', () => {
  it('cuenta solo los filtros tipados presentes', () => {
    expect(countActiveFilters(parse(''))).toBe(0);
    expect(countActiveFilters(parse('category=pest'))).toBe(1);
    expect(countActiveFilters(parse('category=virus&foo=1'))).toBe(0);
  });
});

describe('escrituras de parámetros', () => {
  it('withListParam fija el valor y reinicia la página', () => {
    const next = withListParam(
      new URLSearchParams('page=4&category=pest'),
      'category',
      'weed'
    );

    expect(next.get('category')).toBe('weed');
    expect(next.has('page')).toBe(false);
  });

  it('withListParam con valor vacío elimina el parámetro', () => {
    const next = withListParam(
      new URLSearchParams('page=2&category=pest'),
      'category',
      ''
    );

    expect(next.has('category')).toBe(false);
    expect(next.has('page')).toBe(false);
  });

  it('withListPage fija la página sin tocar los filtros', () => {
    const next = withListPage(new URLSearchParams('category=pest'), 5);

    expect(next.get('page')).toBe('5');
    expect(next.get('category')).toBe('pest');
  });

  it('withListSort fija campo y dirección y reinicia la página', () => {
    const next = withListSort(new URLSearchParams('page=2'), 'slug', 'desc');

    expect(next.get('sortField')).toBe('slug');
    expect(next.get('sortDirection')).toBe('desc');
    expect(next.has('page')).toBe(false);
  });

  it('withoutListPage elimina solo la página', () => {
    const next = withoutListPage(new URLSearchParams('page=2&category=pest'));

    expect(next.toString()).toBe('category=pest');
  });
});
