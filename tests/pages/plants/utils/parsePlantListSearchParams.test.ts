import { parsePlantListSearchParams } from '../../../../src/pages/plants/utils/parsePlantListSearchParams';

function parse(query: string) {
  return parsePlantListSearchParams(new URLSearchParams(query));
}

describe('parsePlantListSearchParams: orden', () => {
  it('sin parámetros devuelve la petición por defecto', () => {
    expect(parse('')).toEqual({
      filters: {},
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' }
    });
  });

  it.each([
    ['sortField=scientificName&sortDirection=desc', 'scientificName', 'desc'],
    ['sortField=identity.name.primary', 'name', 'asc'],
    ['sortField=foo&sortField=scientificName', 'scientificName', 'asc'],
    ['sortDirection=%20desc%20', 'name', 'desc'],
    ['sortDirection=up', 'name', 'asc'],
    ['sortField=scientificName', 'scientificName', 'asc'],
    ['sortDirection=desc', 'name', 'desc']
  ])('%s → %s %s', (query, field, direction) => {
    expect(parse(query).sort).toEqual({ field, direction });
  });
});

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const LONG_TEXT = 'a'.repeat(201);

describe('parsePlantListSearchParams: paginación', () => {
  it.each([
    ['limit=500', 1, 25],
    ['limit=37', 1, 25],
    ['limit=%2050%20', 1, 50],
    ['limit=100', 1, 100],
    ['page=0', 1, 25],
    ['page=-3', 1, 25],
    ['page=abc', 1, 25],
    ['page=2.5', 1, 25],
    ['page=4', 4, 25]
  ])('%s → página %i, límite %i', (query, page, limit) => {
    expect(parse(query).pagination).toEqual({ page, limit });
  });
});

describe('parsePlantListSearchParams: filtros', () => {
  it.each([
    ['family=rosaceae&lifeCycle=annual', { lifeCycle: 'annual' }],
    [`family=${UUID}`, { family: UUID }],
    ['sowingMonth=13&sowingMonth=0&sowingMonth=3.5', {}],
    ['sowingMonth=3&sowingMonth=13&sowingMonth=5,3', { sowingMonths: [3, 5] }],
    ['soilPh=1e3', {}],
    ['soilPh=abc', {}],
    ['soilPh=Infinity', {}],
    ['soilPh=6.5', { soilPh: '6.5' }],
    ['lightHoursMin=6', { lightHoursMin: '6' }],
    ['lightHoursMin=1e1', {}],
    ['spacingCm=40', { spacingCm: '40' }],
    ['spacingCm=abc', {}],
    ['soilAvailableDepthCm=30.5', { soilAvailableDepthCm: '30.5' }],
    ['soilAvailableDepthCm=Infinity', {}],
    ['identity=%20%20', {}],
    [`identity=${LONG_TEXT}`, {}],
    ['identity=%20tomate%20', { identity: 'tomate' }],
    ['lifeCycle=weekly', {}],
    ['sowingMethod=air', {}],
    ['lightType=moon', {}],
    ['rootSystem=none', {}],
    ['sowingMethod=%20direct%20', { sowingMethod: 'direct' }],
    ['hemisphere=south', {}],
    ['unknown=1&other=x', {}],
    ['edible=true', { edible: 'true' }],
    ['edible=false', { edible: 'false' }],
    ['toxic=true', { toxic: 'true' }],
    ['toxic=false', { toxic: 'false' }],
    ['edible=%20true%20', { edible: 'true' }],
    ['edible=quiza', {}],
    ['toxic=FALSE', {}],
    ['edible=quiza&edible=false&edible=true', { edible: 'false' }]
  ])('%s → %j', (query, filters) => {
    expect(parse(query).filters).toEqual(filters);
  });

  it('una URL con todo inválido no lanza y da la petición por defecto', () => {
    expect(() =>
      parse('limit=x&page=y&sortField=z&soilPh=1e3&family=no&sowingMonth=99')
    ).not.toThrow();
    expect(
      parse('limit=x&page=y&sortField=z&soilPh=1e3&family=no&sowingMonth=99')
    ).toEqual(parse(''));
  });
});
