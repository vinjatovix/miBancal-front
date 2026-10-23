import { describe, expect, it } from 'vitest';

import {
  addPlantBookmark,
  getBookmarkedPlantIds,
  removePlantBookmark
} from '../../src/services/bookmarks.service';

import {
  buildBookmark,
  buildUserBookmarksResponse
} from '../fixtures/bookmarks/buildBookmark';
import { API_URL, lastRequest, stubFetchOk } from '../test-utils/stubFetch';
import { validateRequest, validateSchema } from './openApiContract';

const PLANT_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('OpenAPI bookmarks contract', () => {
  it.each([
    ['get', '/api/v1/bookmarks'],
    ['post', '/api/v1/bookmarks/plants'],
    ['delete', `/api/v1/bookmarks/plants/${PLANT_ID}`]
  ] as const)('valida la ruta del contrato para %s %s', (method, path) => {
    expect(validateRequest(method, path)).toEqual([]);
  });

  describe('fixtures frente a los schemas', () => {
    it('FavoritePlantItem cumple el schema', () => {
      expect(validateSchema('FavoritePlantItem', buildBookmark())).toEqual([]);
    });

    it('UserBookmarksResponse cumple el schema', () => {
      expect(
        validateSchema('UserBookmarksResponse', buildUserBookmarksResponse())
      ).toEqual([]);
    });
  });

  describe('getBookmarkedPlantIds', () => {
    it('hace GET /api/v1/bookmarks sin query include', async () => {
      const fetchMock = stubFetchOk(buildUserBookmarksResponse());

      await getBookmarkedPlantIds();

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/bookmarks`);
      expect(init?.method ?? 'GET').toBe('GET');
      expect(validateRequest('get', url)).toEqual([]);
    });
  });

  describe('addPlantBookmark', () => {
    it('hace POST /api/v1/bookmarks/plants con { plantId } y Content-Type json', async () => {
      const fetchMock = stubFetchOk(buildBookmark({ plantId: PLANT_ID }));

      await addPlantBookmark(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/bookmarks/plants`);
      expect(init?.method).toBe('POST');
      expect(JSON.parse(init?.body as string)).toEqual({ plantId: PLANT_ID });
      expect((init?.headers as Record<string, string>)['Content-Type']).toBe(
        'application/json'
      );
      expect(validateRequest('post', url)).toEqual([]);
    });
  });

  describe('removePlantBookmark', () => {
    it('hace DELETE /api/v1/bookmarks/plants/{plantId}', async () => {
      const fetchMock = stubFetchOk(undefined, { 'content-length': '0' });

      await removePlantBookmark(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/bookmarks/plants/${PLANT_ID}`);
      expect(init?.method).toBe('DELETE');
      expect(validateRequest('delete', url)).toEqual([]);
    });
  });
});
