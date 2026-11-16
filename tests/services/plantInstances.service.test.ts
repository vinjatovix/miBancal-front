import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  batchPlacePlantInstances,
  batchRemovePlantInstances,
  batchUpdatePlantInstances,
  createPlantInstance,
  deletePlantInstance,
  getPlantInstancesByBed,
  updatePlantInstance
} from '../../src/services/plantInstances.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../src/shared/errors/PreconditionFailedError';
import { buildPlantInstance } from '../fixtures/plantInstances/buildPlantInstance';
import {
  API_URL,
  lastRequest,
  stubFetchError,
  stubFetchOk,
  stubFetchSequence
} from '../test-utils/stubFetch';

const BED_ID = 'd3b07384-d113-48e0-bb12-f0183f05b0c8';
const INSTANCE_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const ETAG = 'W/"abc123"';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createPlantInstance', () => {
  it('posts to the plant instances collection and returns the created resource with etag', async () => {
    const instance = buildPlantInstance();
    const fetchMock = stubFetchOk(instance, { ETag: ETAG });

    const result = await createPlantInstance({
      id: INSTANCE_ID,
      bedId: BED_ID,
      plantId: instance.plantId,
      position: { x: 60, y: 40 }
    });

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plant-instances`);
    expect(init?.method).toBe('POST');
    expect(result.data).toEqual(instance);
    expect(result.etag).toBe('"abc123"');
  });

  it('throws ApiError on a failed creation', async () => {
    stubFetchError(400, { message: 'Invalid' });

    await expect(
      createPlantInstance({ id: INSTANCE_ID, bedId: BED_ID, plantId: BED_ID })
    ).rejects.toThrow(ApiError);
  });
});

describe('getPlantInstancesByBed', () => {
  it('requests the collection filtered by bed and returns data with etag', async () => {
    const instance = buildPlantInstance();
    const fetchMock = stubFetchOk(
      { data: [instance], pagination: {} },
      { ETag: ETAG }
    );

    const result = await getPlantInstancesByBed(BED_ID);

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/plant-instances?filter[bedId][eq]=${BED_ID}`
    );
    expect(result.data).toEqual([instance]);
    expect(result.etag).toBe('"abc123"');
  });

  it('requests the collection with pagination and sort parameters', async () => {
    const fetchMock = stubFetchOk({ data: [], pagination: {} });

    await getPlantInstancesByBed(BED_ID, { page: 1, limit: 100, sort: 'asc' });

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/plant-instances?filter[bedId][eq]=${BED_ID}&` +
        'pagination[page]=1&pagination[limit]=100&sort[plantedAt]=asc'
    );
  });
});

describe('updatePlantInstance', () => {
  it('patches an instance sending the If-Match header', async () => {
    const instance = buildPlantInstance({ position: { x: 80, y: 55 } });
    const fetchMock = stubFetchOk(instance, { ETag: 'W/"next"' });

    const result = await updatePlantInstance(
      INSTANCE_ID,
      { position: { x: 80, y: 55 } },
      '"abc123"'
    );

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plant-instances/${INSTANCE_ID}`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({ 'If-Match': '"abc123"' });
    expect(result.data).toEqual(instance);
    expect(result.etag).toBe('"next"');
  });

  it('throws PreconditionFailedError on a 412 concurrency conflict', async () => {
    stubFetchError(412, { message: 'Conflict' });

    await expect(
      updatePlantInstance(INSTANCE_ID, { position: { x: 1, y: 2 } }, '"stale"')
    ).rejects.toThrow(PreconditionFailedError);
  });
});

describe('deletePlantInstance', () => {
  it('deletes an instance sending the If-Match header and resolves on 204', async () => {
    const fetchMock = stubFetchSequence({
      ok: true,
      status: 204,
      body: undefined
    });

    await expect(
      deletePlantInstance(INSTANCE_ID, '"abc123"')
    ).resolves.toBeUndefined();

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plant-instances/${INSTANCE_ID}`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({ 'If-Match': '"abc123"' });
  });
});

describe('batchPlacePlantInstances', () => {
  it('posts batch items to the batch endpoint and returns created instances with etag', async () => {
    const instance = buildPlantInstance();
    const fetchMock = stubFetchOk([instance], { ETag: ETAG });

    const result = await batchPlacePlantInstances({
      bedId: BED_ID,
      items: [
        {
          id: INSTANCE_ID,
          plantId: instance.plantId,
          position: { x: 60, y: 40 },
          growthStatus: 'planted'
        }
      ]
    });

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plant-instances/batch`);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(
      JSON.stringify({
        bedId: BED_ID,
        items: [
          {
            id: INSTANCE_ID,
            plantId: instance.plantId,
            position: { x: 60, y: 40 },
            growthStatus: 'planted'
          }
        ]
      })
    );
    expect(result.data).toEqual([instance]);
    expect(result.etag).toBe('"abc123"');
  });

  it('throws ApiError on batch placement failure', async () => {
    stubFetchError(400, { message: 'Invalid batch items' });

    await expect(
      batchPlacePlantInstances({
        bedId: BED_ID,
        items: [{ id: INSTANCE_ID, plantId: BED_ID }]
      })
    ).rejects.toThrow(ApiError);
  });
});

describe('batchUpdatePlantInstances', () => {
  it('patches batch items to the batch endpoint and returns updated instances with etag', async () => {
    const instance = buildPlantInstance({
      position: { x: 80, y: 55 },
      version: 2
    });
    const fetchMock = stubFetchOk([instance], { ETag: 'W/"next"' });

    const result = await batchUpdatePlantInstances({
      items: [
        {
          id: INSTANCE_ID,
          version: 1,
          position: { x: 80, y: 55 }
        }
      ]
    });

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plant-instances/batch`);
    expect(init?.method).toBe('PATCH');
    expect(init?.body).toBe(
      JSON.stringify({
        items: [
          {
            id: INSTANCE_ID,
            version: 1,
            position: { x: 80, y: 55 }
          }
        ]
      })
    );
    expect(result.data).toEqual([instance]);
    expect(result.etag).toBe('"next"');
  });

  it('throws PreconditionFailedError on 412 batch update version conflict', async () => {
    stubFetchError(412, { message: 'OCC Conflict' });

    await expect(
      batchUpdatePlantInstances({
        items: [{ id: INSTANCE_ID, version: 1, position: { x: 10, y: 10 } }]
      })
    ).rejects.toThrow(PreconditionFailedError);
  });
});

describe('batchRemovePlantInstances', () => {
  it('deletes batch items with version and resolves on 204', async () => {
    const fetchMock = stubFetchSequence({
      ok: true,
      status: 204,
      body: undefined
    });

    await expect(
      batchRemovePlantInstances({
        items: [{ id: INSTANCE_ID, version: 1 }]
      })
    ).resolves.toBeUndefined();

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plant-instances/batch`);
    expect(init?.method).toBe('DELETE');
    expect(init?.body).toBe(
      JSON.stringify({
        items: [{ id: INSTANCE_ID, version: 1 }]
      })
    );
  });

  it('throws PreconditionFailedError on 412 batch remove version conflict', async () => {
    stubFetchError(412, { message: 'OCC Conflict' });

    await expect(
      batchRemovePlantInstances({
        items: [{ id: INSTANCE_ID, version: 1 }]
      })
    ).rejects.toThrow(PreconditionFailedError);
  });
});
