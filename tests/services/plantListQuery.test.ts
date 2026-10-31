import {
  DEFAULT_PLANT_SORT,
  FAMILY_PLANTS_FIELDS,
  PLANT_FIELDS,
  PLANT_FIELDS_QUERY_KEY,
  PLANT_FILTER_QUERY_KEYS,
  PLANT_LIST_FIELDS,
  PLANT_SORT_FIELDS,
  isPlantsSortField,
  sortQueryKey
} from '../../src/services/plantListQuery';

describe('plantListQuery', () => {
  it('declara las claves de orden del contrato', () => {
    expect(PLANT_SORT_FIELDS).toEqual(['name', 'scientificName']);
    expect(DEFAULT_PLANT_SORT).toEqual({ field: 'name', direction: 'asc' });
  });

  it('construye la clave de orden', () => {
    expect(sortQueryKey('scientificName')).toBe('sort[scientificName]');
  });

  it('cada clave de filtro tiene la forma filter[campo][operador]', () => {
    Object.values(PLANT_FILTER_QUERY_KEYS).forEach((key) => {
      expect(key).toMatch(/^filter\[[a-zA-Z]+\]\[[a-zA-Z]+\]$/);
    });
  });

  it('reconoce solo claves de orden declaradas', () => {
    expect(isPlantsSortField('scientificName')).toBe(true);
    expect(isPlantsSortField('identity.name.primary')).toBe(false);
  });

  it('declara la clave y los campos de primer nivel de fields[plants]', () => {
    expect(PLANT_FIELDS_QUERY_KEY).toBe('fields[plants]');
    expect([...PLANT_FIELDS].sort()).toEqual(
      [
        'id',
        'slug',
        'identity',
        'traits',
        'phenology',
        'knowledge',
        'image',
        'metadata',
        'status',
        'deletedAt',
        'version',
        'likesCount'
      ].sort()
    );
  });

  it('declara la selección de cada listado en orden y sin id', () => {
    expect(PLANT_LIST_FIELDS).toEqual([
      'slug',
      'identity',
      'traits',
      'image',
      'status',
      'likesCount'
    ]);
    expect(FAMILY_PLANTS_FIELDS).toEqual(['slug', 'identity', 'status']);
    expect(PLANT_LIST_FIELDS).not.toContain('id');
    expect(FAMILY_PLANTS_FIELDS).not.toContain('id');
  });
});
