import { describe, expect, it, afterEach, vi } from 'vitest';
import {
  likePlant,
  unlikePlant,
  checkPlantLike
} from '../../src/services/plantLikes.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import {
  buildPlantLikeItem,
  buildCheckPlantLikeResponse
} from '../fixtures/plants/buildPlantLike';
import {
  API_URL,
  lastRequest,
  stubFetchError,
  stubFetchOk
} from '../test-utils/stubFetch';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('likePlant', () => {
  it('hace POST con el plantId', async () => {
    const fetchMock = stubFetchOk(buildPlantLikeItem({ plantId: 'p-1' }));

    const result = await likePlant('p-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/p-1/likes`);
    expect(init?.method).toBe('POST');
    expect(result.plantId).toBe('p-1');
  });

  it('rechaza con ApiError ante un 401', async () => {
    stubFetchError(401, { message: 'Unauthorized' });

    const error = await likePlant('p-1').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('unlikePlant', () => {
  it('hace DELETE a la ruta con plantId', async () => {
    const fetchMock = stubFetchOk(undefined, { 'content-length': '0' });

    await unlikePlant('p-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/p-1/likes`);
    expect(init?.method).toBe('DELETE');
  });

  it('resuelve sin error ante 204', async () => {
    stubFetchOk(undefined, { 'content-length': '0' });

    await expect(unlikePlant('p-1')).resolves.toBeUndefined();
  });
});

describe('checkPlantLike', () => {
  it('hace GET a la ruta con plantId', async () => {
    const fetchMock = stubFetchOk(buildCheckPlantLikeResponse({ liked: true }));

    const result = await checkPlantLike('p-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/plants/p-1/likes/me`);
    expect(init?.method ?? 'GET').toBe('GET');
    expect(result.liked).toBe(true);
  });

  it('devuelve falso si no esta liked', async () => {
    stubFetchOk(buildCheckPlantLikeResponse({ liked: false }));

    const result = await checkPlantLike('p-1');

    expect(result.liked).toBe(false);
  });
});
