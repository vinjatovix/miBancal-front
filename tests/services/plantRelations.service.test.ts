import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildPlantRelationsQuery,
  DEFAULT_PLANT_RELATION_SORT,
  PLANT_RELATION_FILTER_QUERY_KEYS
} from '../../src/services/plantRelationListQuery';
import {
  createPlantRelation,
  deletePlantRelation,
  getPlantRelationById,
  getPlantRelations,
  PLANT_RELATIONS_PATH,
  updatePlantRelation
} from '../../src/services/plantRelations.service';
import type {
  CreatePlantRelationInput,
  PlantRelationListRequest,
  UpdatePlantRelationInput
} from '../../src/types/Plants/PlantRelation';
import { validateRequest } from '../contract/openApiContract';
import {
  buildPaginatedPlantRelationsResponse,
  buildPlantRelation
} from '../fixtures/plantRelations/buildPlantRelation';
import {
  API_URL,
  lastRequest,
  stubFetchError,
  stubFetchOk
} from '../test-utils/stubFetch';

const PLANT_ID = '11111111-1111-4111-8111-111111111111';
const TARGET_ID = '22222222-2222-4222-8222-222222222222';
const RELATION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildPlantRelationsQuery', () => {
  it('builds default query with default includes', () => {
    const query = buildPlantRelationsQuery({});

    expect(query).toBe(
      'include=sourcePlant%2CtargetPlant%2CsourceFamily%2CtargetFamily'
    );
  });

  it('serializes appliesToPlantId and scope filters', () => {
    const query = buildPlantRelationsQuery({
      filters: {
        appliesToPlantId: PLANT_ID,
        sourceScope: 'genus',
        targetScope: 'all',
        genus: 'Solanum',
        familyId: TARGET_ID
      }
    });

    const params = new URLSearchParams(query);
    expect(params.get('filter[appliesToPlantId][eq]')).toBe(PLANT_ID);
    expect(params.get('filter[sourceScope][eq]')).toBe('genus');
    expect(params.get('filter[targetScope][eq]')).toBe('all');
    expect(params.get('filter[genus][eq]')).toBe('Solanum');
    expect(params.get('filter[familyId][eq]')).toBe(TARGET_ID);
  });

  it('serializes plantId filter', () => {
    const request: PlantRelationListRequest = {
      filters: { plantId: PLANT_ID }
    };

    const query = buildPlantRelationsQuery(request);

    expect(query).toContain(
      `${encodeURIComponent(PLANT_RELATION_FILTER_QUERY_KEYS.plantId)}=${PLANT_ID}`
    );
  });

  it('serializes sourcePlantId and targetPlantId filters', () => {
    const request: PlantRelationListRequest = {
      filters: { sourcePlantId: PLANT_ID, targetPlantId: TARGET_ID }
    };

    const query = buildPlantRelationsQuery(request);

    expect(query).toContain(
      `${encodeURIComponent(PLANT_RELATION_FILTER_QUERY_KEYS.sourcePlantId)}=${PLANT_ID}`
    );
    expect(query).toContain(
      `${encodeURIComponent(PLANT_RELATION_FILTER_QUERY_KEYS.targetPlantId)}=${TARGET_ID}`
    );
  });

  it('serializes type and mechanism filters', () => {
    const request: PlantRelationListRequest = {
      filters: { type: 'beneficial', mechanism: 'pest_repellent' }
    };

    const query = buildPlantRelationsQuery(request);

    expect(query).toContain(
      `${encodeURIComponent(PLANT_RELATION_FILTER_QUERY_KEYS.type)}=beneficial`
    );
    expect(query).toContain(
      `${encodeURIComponent(PLANT_RELATION_FILTER_QUERY_KEYS.mechanism)}=pest_repellent`
    );
  });

  it('serializes sort parameter', () => {
    const request: PlantRelationListRequest = {
      sort: DEFAULT_PLANT_RELATION_SORT
    };

    const query = buildPlantRelationsQuery(request);

    expect(query).toContain(
      `sort=${encodeURIComponent(DEFAULT_PLANT_RELATION_SORT)}`
    );
  });

  it('serializes pagination parameters and clamps limit to 100', () => {
    const request: PlantRelationListRequest = {
      pagination: { page: 2, limit: 150 }
    };

    const query = buildPlantRelationsQuery(request);

    expect(query).toContain('pagination%5Bpage%5D=2');
    expect(query).toContain('pagination%5Blimit%5D=100');
  });

  it('overrides include parameter when provided', () => {
    const request: PlantRelationListRequest = {
      include: ['sourcePlant']
    };

    const query = buildPlantRelationsQuery(request);

    expect(query).toContain('include=sourcePlant');
    expect(query).not.toContain('targetPlant');
  });
});

describe('getPlantRelations', () => {
  it('requests GET /api/v1/plant-relations with serialized query and validates contract', async () => {
    const mockResponse = buildPaginatedPlantRelationsResponse();
    const fetchMock = stubFetchOk(mockResponse);
    const request: PlantRelationListRequest = {
      filters: { plantId: PLANT_ID },
      pagination: { page: 1, limit: 25 }
    };

    const result = await getPlantRelations(request);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}${PLANT_RELATIONS_PATH}?filter[plantId][eq]=${PLANT_ID}&pagination[page]=1&pagination[limit]=25&include=sourcePlant,targetPlant,sourceFamily,targetFamily`
    );
    expect(init?.method ?? 'GET').toBe('GET');
    expect(validateRequest('get', url)).toEqual([]);
    expect(result).toEqual(mockResponse);
  });

  it('propagates error when apiFetch fails', async () => {
    stubFetchError(500, { message: 'Server error' });

    await expect(getPlantRelations()).rejects.toThrow();
  });
});

describe('getPlantRelationById', () => {
  it('requests GET /api/v1/plant-relations/:id and returns relation with etag', async () => {
    const mockRelation = buildPlantRelation();
    const fetchMock = stubFetchOk(mockRelation, { etag: '"rel-v1"' });

    const result = await getPlantRelationById(RELATION_ID);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}${PLANT_RELATIONS_PATH}/${RELATION_ID}?include=sourcePlant,targetPlant,sourceFamily,targetFamily`
    );
    expect(init?.method ?? 'GET').toBe('GET');
    expect(result).toEqual({ relation: mockRelation, etag: '"rel-v1"' });
  });
});

describe('createPlantRelation', () => {
  it('requests POST /api/v1/plant-relations and returns created relation with etag', async () => {
    const mockRelation = buildPlantRelation();
    const payload: CreatePlantRelationInput = {
      source: { scope: 'plant', value: PLANT_ID },
      target: { scope: 'plant', value: TARGET_ID },
      type: 'beneficial',
      mechanism: 'pest_repellent',
      strength: 4,
      proximity: { minDistanceCm: 0, maxDistanceCm: 50 },
      reason: 'Repulsa plagas comunes de la familia.'
    };
    const fetchMock = stubFetchOk(mockRelation, { etag: '"new-rel-1"' });

    const result = await createPlantRelation(payload);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}${PLANT_RELATIONS_PATH}`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json'
    });
    const sentBody = JSON.parse(init?.body as string);
    expect(sentBody.id).toBeDefined();
    expect(typeof sentBody.id).toBe('string');
    expect(result).toEqual({ relation: mockRelation, etag: '"new-rel-1"' });
  });

  it('preserves client-provided id when present in payload', async () => {
    const mockRelation = buildPlantRelation();
    const customId = '0192e201-0000-7000-8000-000000000001';
    const payload: CreatePlantRelationInput = {
      id: customId,
      source: { scope: 'plant', value: PLANT_ID },
      target: { scope: 'plant', value: TARGET_ID },
      type: 'beneficial',
      mechanism: 'pest_repellent',
      strength: 4,
      proximity: { minDistanceCm: 0, maxDistanceCm: 50 },
      reason: 'Repulsa plagas comunes.'
    };
    const fetchMock = stubFetchOk(mockRelation, { etag: '"new-rel-1"' });

    await createPlantRelation(payload);

    const { init } = lastRequest(fetchMock);
    const sentBody = JSON.parse(init?.body as string);
    expect(sentBody.id).toBe(customId);
  });
});

describe('updatePlantRelation', () => {
  it('requests PATCH /api/v1/plant-relations/:id with If-Match header', async () => {
    const mockRelation = buildPlantRelation({ strength: 5 });
    const patch: UpdatePlantRelationInput = { strength: 5 };
    const fetchMock = stubFetchOk(mockRelation, { etag: '"updated-rel-1"' });

    const result = await updatePlantRelation(RELATION_ID, patch, '"rel-v1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}${PLANT_RELATIONS_PATH}/${RELATION_ID}`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'If-Match': '"rel-v1"'
    });
    expect(result).toEqual({ relation: mockRelation, etag: '"updated-rel-1"' });
  });
});

describe('deletePlantRelation', () => {
  it('requests DELETE /api/v1/plant-relations/:id with If-Match header', async () => {
    const fetchMock = stubFetchOk(undefined);

    await deletePlantRelation(RELATION_ID, '"rel-v1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}${PLANT_RELATIONS_PATH}/${RELATION_ID}`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({
      'If-Match': '"rel-v1"'
    });
  });
});
