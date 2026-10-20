import {
  createPlant,
  deletePlant,
  getFamilyPlants,
  getPlantById,
  getPlantForEdit,
  getPlantList,
  updatePlant
} from '../../src/services/plants.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../src/shared/errors/PreconditionFailedError';
import type {
  CreatePlantRequest,
  UpdatePlantRequest
} from '../../src/types/Plants/Plant';
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

describe('getPlantForEdit', () => {
  it('requests plant for edit without include or fields and extracts ETag from response', async () => {
    const plant = buildPlant({ id: 'abc' });
    const fetchMock = stubFetchOk(plant, { ETag: '"1"' });

    const result = await getPlantForEdit('abc');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/abc`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(validateRequest('get', url)).toEqual([]);
    expect(result).toEqual({ plant, etag: '"1"' });
  });

  it('returns empty etag when ETag header is missing', async () => {
    const plant = buildPlant({ id: 'abc' });
    stubFetchOk(plant);

    const result = await getPlantForEdit('abc');

    expect(result).toEqual({ plant, etag: '' });
  });

  it('rejects with ApiError when plant does not exist', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getPlantForEdit('abc').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('updatePlant', () => {
  it('sends PATCH with If-Match and returns updated plant with its new ETag', async () => {
    const updated = buildPlant({ id: 'abc', version: 2 });
    const patch: UpdatePlantRequest = {
      identity: { name: { primary: 'Tomate cherry' } }
    };
    const fetchMock = stubFetchOk(updated, { ETag: '"2"' });

    const result = await updatePlant('abc', patch, '"1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/abc`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'If-Match': '"1"'
    });
    expect(JSON.parse(init?.body as string)).toEqual(patch);
    expect(result).toEqual({ plant: updated, etag: '"2"' });
  });

  it('rejects with PreconditionFailedError when server returns 412', async () => {
    stubFetchError(412, { message: 'Precondition failed' });

    const error = await updatePlant('abc', {}, '"1"').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(PreconditionFailedError);
    expect((error as PreconditionFailedError).status).toBe(412);
  });
});

describe('deletePlant', () => {
  it('sends DELETE to /api/v1/plants/:id with If-Match header', async () => {
    const fetchMock = stubFetchOk(undefined);

    await deletePlant('p-del-1', '"etag-1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/p-del-1`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({
      'If-Match': '"etag-1"'
    });
  });

  it('rejects with PreconditionFailedError when server returns 412', async () => {
    stubFetchError(412, { message: 'Precondition failed' });

    const error = await deletePlant('p-del-1', '"stale-etag"').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(PreconditionFailedError);
  });
});

describe('createPlant', () => {
  it('sends POST to /api/v1/plants and returns created plant with its ETag', async () => {
    const created = buildPlant({ id: 'new-id', version: 1 });
    const input: CreatePlantRequest = {
      id: 'new-id',
      identity: {
        name: { primary: 'Tomate' },
        scientificName: 'Solanum lycopersicum',
        family: '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
      },
      traits: {
        lifecycle: 'annual',
        size: {
          height: { min: 100, max: 200 },
          spread: { min: 40, max: 60 }
        },
        spacingCm: { min: 40, max: 50 }
      },
      phenology: {
        sowing: {
          months: [2, 3],
          seedsPerHole: { min: 2, max: 3 },
          germinationDays: { min: 6, max: 10 },
          methods: {
            direct: { depthCm: { min: 1, max: 2 } }
          }
        }
      },
      knowledge: {
        soil: {
          ph: { min: 6, max: 7 },
          availableDepthCm: { min: 30, max: 50 }
        },
        rootSystem: {
          type: 'taproot',
          depthCm: { min: 40, max: 80 },
          spreadCm: { min: 30, max: 50 }
        },
        watering: { frequency: 'regular' },
        light: { hoursMin: 6, type: 'full_sun' },
        propagation: { methods: {} },
        resources: [
          {
            type: 'image',
            url: 'https://example.com/tomate.jpg'
          }
        ]
      }
    };
    const fetchMock = stubFetchOk(created, { ETag: '"1"' });

    const result = await createPlant(input);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json'
    });
    expect(result).toEqual({ plant: created, etag: '"1"' });
  });
});
