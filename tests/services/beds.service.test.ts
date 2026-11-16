import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createBed,
  deleteBed,
  getBedById,
  getBedForEdit,
  getBedList,
  updateBed
} from '../../src/services/beds.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import { buildBed, buildCreateBedRequest } from '../fixtures/beds/buildBed';
import {
  API_URL,
  JSON_HEADERS,
  lastRequest,
  stubFetchError,
  stubFetchOk
} from '../test-utils/stubFetch';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getBedList', () => {
  it('requests beds without query string when request parameters are omitted', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk([bed]);

    const result = await getBedList();

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(result).toEqual([bed]);
  });

  it('requests beds with include query parameter', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk([bed]);

    await getBedList({ include: 'location' });

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds?include=location`);
  });

  it('requests beds filtered by locationId', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk([bed]);

    await getBedList({ locationId: '7ca85f64-5717-4562-b3fc-2c963f66afa6' });

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/beds?filter[locationId]=7ca85f64-5717-4562-b3fc-2c963f66afa6`
    );
  });

  it('requests beds with both location filter and include parameters', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk([bed]);

    await getBedList({
      locationId: '7ca85f64-5717-4562-b3fc-2c963f66afa6',
      include: 'location'
    });

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/beds?filter[locationId]=7ca85f64-5717-4562-b3fc-2c963f66afa6&include=location`
    );
  });

  it('throws ApiError on failed response', async () => {
    stubFetchError(401, { message: 'Unauthorized' });

    await expect(getBedList()).rejects.toThrow(ApiError);
  });
});

describe('getBedById', () => {
  it('requests bed by identifier with default location include', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk(bed);

    const result = await getBedById(bed.id);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds/${bed.id}?include=location`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(result).toEqual(bed);
  });

  it('requests bed by identifier with specified include parameter', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk(bed);

    await getBedById(bed.id, 'plantInstances');

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds/${bed.id}?include=plantInstances`);
  });

  it('throws ApiError on 404 response', async () => {
    stubFetchError(404, { message: 'Not found' });

    await expect(getBedById('non-existent-id')).rejects.toThrow(ApiError);
  });
});

describe('createBed', () => {
  it('sends POST request with bed payload and returns bed with ETag', async () => {
    const payload = buildCreateBedRequest();
    const bed = buildBed();
    const fetchMock = stubFetchOk(bed, { ETag: '"version-1"' });

    const result = await createBed(payload);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds`);
    expect(init).toEqual({
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload)
    });
    expect(result).toEqual({ bed, etag: '"version-1"' });
  });

  it('throws ApiError on validation failure', async () => {
    const payload = buildCreateBedRequest();
    stubFetchError(400, {
      message: 'Validation error',
      errors: { name: 'Required field' }
    });

    await expect(createBed(payload)).rejects.toThrow(ApiError);
  });
});

describe('getBedForEdit', () => {
  it('requests bed by identifier without include to preserve ETag and returns bed with ETag', async () => {
    const bed = buildBed();
    const fetchMock = stubFetchOk(bed, { ETag: '"edit-etag-1"' });

    const result = await getBedForEdit(bed.id);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds/${bed.id}`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(result).toEqual({ bed, etag: '"edit-etag-1"' });
  });

  it('throws ApiError on failure', async () => {
    stubFetchError(404, { message: 'Bed not found' });

    await expect(getBedForEdit('non-existent-id')).rejects.toThrow(ApiError);
  });
});

describe('updateBed', () => {
  it('sends PATCH request with If-Match header and payload returning updated bed with new ETag', async () => {
    const bed = buildBed({ name: 'Bancal Actualizado' });
    const patch = { name: 'Bancal Actualizado' };
    const fetchMock = stubFetchOk(bed, { ETag: '"etag-v2"' });

    const result = await updateBed('bed-123', patch, '"etag-v1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds/bed-123`);
    expect(init).toEqual({
      method: 'PATCH',
      headers: { ...JSON_HEADERS, 'If-Match': '"etag-v1"' },
      body: JSON.stringify(patch)
    });
    expect(result).toEqual({ bed, etag: '"etag-v2"' });
  });

  it('throws ApiError on precondition failure', async () => {
    stubFetchError(412, { message: 'Precondition Failed' });

    await expect(
      updateBed('bed-123', { name: 'New Name' }, '"stale-etag"')
    ).rejects.toThrow(ApiError);
  });
});

describe('deleteBed', () => {
  it('sends DELETE request with If-Match header and no body', async () => {
    const fetchMock = stubFetchOk(undefined);

    await deleteBed('bed-123', '"etag-v1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/beds/bed-123`);
    expect(init).toEqual({
      method: 'DELETE',
      headers: { ...JSON_HEADERS, 'If-Match': '"etag-v1"' }
    });
  });

  it('throws ApiError on delete failure', async () => {
    stubFetchError(409, { message: 'Bed has plants' });

    await expect(deleteBed('bed-123', '"etag-v1"')).rejects.toThrow(ApiError);
  });
});
