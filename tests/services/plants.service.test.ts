import {
  getFamilyPlants,
  getPlantById,
  getPlantList
} from '../../src/services/plants.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import { buildPlant } from '../fixtures/plants/buildPlant';
import { listPlantsResponse } from '../fixtures/plants/listPlants';
import { validateRequest } from '../contract/openApiContract';
import {
  DEFAULT_PLANT_SORT,
  PLANT_FILTER_QUERY_KEYS,
  type PlantFilterParams,
  type PlantListRequest
} from '../../src/services/plantListQuery';
import {
  API_URL,
  JSON_HEADERS,
  lastRequest,
  stubFetchError,
  stubFetchOk
} from '../test-utils/stubFetch';

const NOT_FOUND_BODY = {
  message: 'Plant not found',
  errors: { id: 'not found' }
};

afterEach(() => {
  vi.unstubAllGlobals();
});

const FAMILY_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

const LIST_FIELDS = 'fields[plants]=identity,traits,image,status';

const DEFAULT_LIST_REQUEST: PlantListRequest = {
  filters: {},
  pagination: { page: 1, limit: 25 },
  sort: DEFAULT_PLANT_SORT
};

const DEFAULT_TAIL = 'pagination[page]=1&pagination[limit]=25&sort[name]=asc';

function listUrl(query: string): string {
  return `${API_URL}/api/v1/plants?${query}&${LIST_FIELDS}`;
}

function withFilters(filters: PlantFilterParams): PlantListRequest {
  return { ...DEFAULT_LIST_REQUEST, filters };
}

describe('getPlantList: combinaciones de orden', () => {
  it.each([
    ['name', 'asc'],
    ['name', 'desc'],
    ['scientificName', 'asc'],
    ['scientificName', 'desc']
  ] as const)('sort[%s]=%s', async (field, direction) => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList({ ...DEFAULT_LIST_REQUEST, sort: { field, direction } });

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      listUrl(
        `pagination[page]=1&pagination[limit]=25&sort[${field}]=${direction}`
      )
    );
    expect(url.match(/sort\[/g)).toHaveLength(1);
    expect(validateRequest('get', url)).toEqual([]);
  });
});

describe('getPlantList: query completa', () => {
  it('envía filtros, paginación, orden y campos en el orden de construcción', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList({
      filters: {
        identity: '  tomate  ',
        family: 'solanaceae',
        lifeCycle: 'annual',
        sowingMethod: 'starter',
        sowingMonths: [3, 4],
        soilPh: '6',
        soilAvailableDepthCm: '30',
        spacingCm: '40',
        lightType: 'full_sun',
        lightHoursMin: '6',
        rootSystem: 'taproot'
      },
      pagination: { page: 2, limit: 50 },
      sort: { field: 'name', direction: 'desc' }
    });

    expect(lastRequest(fetchMock).url).toBe(
      listUrl(
        [
          'filter[identity][contains]=tomate',
          'filter[family][eq]=solanaceae',
          'filter[lifeCycle][eq]=annual',
          'filter[sowingMethod][eq]=starter',
          'filter[sowingMonths][hasAny]=3,4',
          'filter[soilPh][eq]=6',
          'filter[soilAvailableDepthCm][eq]=30',
          'filter[spacingCm][eq]=40',
          'filter[lightType][eq]=full_sun',
          'filter[lightHoursMin][eq]=6',
          'filter[rootSystem][eq]=taproot',
          'pagination[page]=2',
          'pagination[limit]=50',
          'sort[name]=desc'
        ].join('&')
      )
    );
  });

  it('un mes de siembra suelto se envía como hasAny de un valor', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList(withFilters({ sowingMonths: [5] }));

    expect(lastRequest(fetchMock).url).toBe(
      listUrl(`filter[sowingMonths][hasAny]=5&${DEFAULT_TAIL}`)
    );
  });

  it('un identity solo con espacios no se envía', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList(withFilters({ identity: '   ' }));

    expect(lastRequest(fetchMock).url).toBe(listUrl(DEFAULT_TAIL));
  });

  it('rechaza con ApiError si la API responde con error', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getPlantList(DEFAULT_LIST_REQUEST).catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(404);
    expect(apiError.message).toBe('Plant not found');
  });
});

const VALID_FILTER_VALUES: Required<PlantFilterParams> = {
  identity: 'tomate',
  family: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  lifeCycle: 'annual',
  sowingMethod: 'direct',
  sowingMonths: [3, 5],
  soilPh: '6.5',
  soilAvailableDepthCm: '30',
  spacingCm: '40',
  lightType: 'full_sun',
  lightHoursMin: '6',
  rootSystem: 'taproot',
  edible: 'true',
  toxic: 'false'
};

function formatFilterValue(value: string | number[]): string {
  return Array.isArray(value) ? value.join(',') : value;
}

describe('getPlantList: filtros de comestible y tóxica', () => {
  it.each([
    [{ edible: 'true' as const }, 'filter[edible][eq]=true'],
    [{ toxic: 'false' as const }, 'filter[toxic][eq]=false']
  ])('%j envía %s', async (filters, query) => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList(withFilters(filters));

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(listUrl(`${query}&${DEFAULT_TAIL}`));
    expect(validateRequest('get', url)).toEqual([]);
  });

  it('se envían tras lifeCycle en el orden de PLANT_FILTER_QUERY_KEYS', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList(
      withFilters({ toxic: 'false', edible: 'true', lifeCycle: 'annual' })
    );

    expect(lastRequest(fetchMock).url).toBe(
      listUrl(
        [
          'filter[lifeCycle][eq]=annual',
          'filter[edible][eq]=true',
          'filter[toxic][eq]=false',
          DEFAULT_TAIL
        ].join('&')
      )
    );
  });
});

describe('getPlantList: cada clave de filtro', () => {
  const fields = Object.keys(PLANT_FILTER_QUERY_KEYS) as Array<
    keyof PlantFilterParams
  >;

  it.each(fields)('%s envía su clave del contrato', async (field) => {
    const fetchMock = stubFetchOk(listPlantsResponse);
    const value = VALID_FILTER_VALUES[field];

    await getPlantList(withFilters({ [field]: value }));

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      listUrl(
        `${PLANT_FILTER_QUERY_KEYS[field]}=${formatFilterValue(value)}&${DEFAULT_TAIL}`
      )
    );
    expect(validateRequest('get', url)).toEqual([]);
  });
});

describe('getPlantList', () => {
  it.each<[string, PlantListRequest, string]>([
    [
      'sin filtros',
      DEFAULT_LIST_REQUEST,
      'pagination[page]=1&pagination[limit]=25&sort[name]=asc'
    ],
    [
      'con varios filtros',
      {
        ...DEFAULT_LIST_REQUEST,
        filters: { family: FAMILY_ID, lifeCycle: 'annual', edible: 'true' }
      },
      [
        `filter[family][eq]=${FAMILY_ID}`,
        'filter[lifeCycle][eq]=annual',
        'filter[edible][eq]=true',
        'pagination[page]=1',
        'pagination[limit]=25',
        'sort[name]=asc'
      ].join('&')
    ],
    [
      'ordenado por scientificName',
      {
        ...DEFAULT_LIST_REQUEST,
        sort: { field: 'scientificName', direction: 'desc' }
      },
      'pagination[page]=1&pagination[limit]=25&sort[scientificName]=desc'
    ],
    [
      'en otra página',
      { ...DEFAULT_LIST_REQUEST, pagination: { page: 3, limit: 50 } },
      'pagination[page]=3&pagination[limit]=50&sort[name]=asc'
    ]
  ])('%s pide solo los campos que pinta', async (_, request, query) => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getPlantList(request);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants?${query}&${LIST_FIELDS}`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(validateRequest('get', url)).toEqual([]);
  });

  it('devuelve los datos y la paginación de la respuesta', async () => {
    stubFetchOk(listPlantsResponse);

    await expect(getPlantList(DEFAULT_LIST_REQUEST)).resolves.toEqual(
      listPlantsResponse
    );
  });
});

describe('getFamilyPlants', () => {
  it('pide las plantas de la familia por nombre y solo identity y status', async () => {
    const fetchMock = stubFetchOk(listPlantsResponse);

    await getFamilyPlants(FAMILY_ID);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/plants?filter[family][eq]=${FAMILY_ID}&sort[name]=asc&fields[plants]=identity,status`
    );
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(validateRequest('get', url)).toEqual([]);
  });

  it('devuelve los datos y la paginación de la respuesta', async () => {
    stubFetchOk(listPlantsResponse);

    await expect(getFamilyPlants(FAMILY_ID)).resolves.toEqual(
      listPlantsResponse
    );
  });

  it('rechaza con ApiError si la API responde con error', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getFamilyPlants(FAMILY_ID).catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('getPlantById', () => {
  it('pide la planta por id incluyendo la familia', async () => {
    const plant = buildPlant({ id: 'abc' });
    const fetchMock = stubFetchOk(plant);

    await getPlantById('abc');

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/abc?include=family`);
  });

  it('la petición de planta cumple el contrato', async () => {
    const plant = buildPlant({ id: 'abc' });
    const fetchMock = stubFetchOk(plant);

    await getPlantById('abc');

    const { url } = lastRequest(fetchMock);
    expect(validateRequest('get', url)).toEqual([]);
  });

  it('pide la planta con las cabeceras por defecto', async () => {
    const plant = buildPlant({ id: 'abc' });
    const fetchMock = stubFetchOk(plant);

    await getPlantById('abc');

    expect(lastRequest(fetchMock).init).toEqual({ headers: JSON_HEADERS });
  });

  it('devuelve el cuerpo de la planta', async () => {
    const plant = buildPlant({ id: 'abc' });
    stubFetchOk(plant);

    const result = await getPlantById('abc');

    expect(result).toEqual(plant);
  });

  it('rechaza con ApiError si la planta no existe', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getPlantById('abc').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(404);
    expect(apiError.message).toBe('Plant not found');
  });
});
