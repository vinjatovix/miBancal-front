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
import {
  assertContractRequest,
  validateRequest,
  validateSchema
} from './openApiContract';

const PLANT_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('OpenAPI bookmarks contract', () => {
  it.each([
    ['get', '/api/v1/bookmarks'],
    ['post', '/api/v1/bookmarks/plants'],
    ['delete', `/api/v1/bookmarks/plants/${PLANT_ID}`]
  ] as const)('validates contract route for %s %s', (method, path) => {
    expect(validateRequest(method, path)).toEqual([]);
  });

  describe('fixtures against schemas', () => {
    it('FavoritePlantItem conforms to schema', () => {
      expect(validateSchema('FavoritePlantItem', buildBookmark())).toEqual([]);
    });

    it('UserBookmarksResponse conforms to schema', () => {
      expect(
        validateSchema('UserBookmarksResponse', buildUserBookmarksResponse())
      ).toEqual([]);
    });
  });

  describe('getBookmarkedPlantIds', () => {
    it('performs GET /api/v1/bookmarks without include query', async () => {
      const fetchMock = stubFetchOk(buildUserBookmarksResponse());

      await getBookmarkedPlantIds();

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/bookmarks`);
      expect(init?.method ?? 'GET').toBe('GET');
      await expect(
        assertContractRequest({
          req: {
            url,
            method: init?.method ?? 'GET',
            headers: init?.headers
          }
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('addPlantBookmark', () => {
    it('performs POST /api/v1/bookmarks/plants with { plantId } and JSON Content-Type', async () => {
      const fetchMock = stubFetchOk(buildBookmark({ plantId: PLANT_ID }));

      await addPlantBookmark(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/bookmarks/plants`);
      expect(init?.method).toBe('POST');
      expect(JSON.parse(init?.body as string)).toEqual({ plantId: PLANT_ID });
      expect((init?.headers as Record<string, string>)['Content-Type']).toBe(
        'application/json'
      );
      await expect(
        assertContractRequest({
          req: {
            url,
            method: init?.method,
            headers: init?.headers,
            body: init?.body
          }
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('removePlantBookmark', () => {
    it('performs DELETE /api/v1/bookmarks/plants/{plantId}', async () => {
      const fetchMock = stubFetchOk(undefined, { 'content-length': '0' });

      await removePlantBookmark(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/bookmarks/plants/${PLANT_ID}`);
      expect(init?.method).toBe('DELETE');
      await expect(
        assertContractRequest({
          req: {
            url,
            method: init?.method,
            headers: init?.headers
          }
        })
      ).resolves.toBeUndefined();
    });
  });
});
