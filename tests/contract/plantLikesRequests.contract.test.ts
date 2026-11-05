import { describe, expect, it } from 'vitest';

import {
  likePlant,
  unlikePlant,
  checkPlantLike
} from '../../src/services/plantLikes.service';

import {
  buildPlantLikeItem,
  buildCheckPlantLikeResponse
} from '../fixtures/plants/buildPlantLike';
import { API_URL, lastRequest, stubFetchOk } from '../test-utils/stubFetch';
import {
  assertContractRequest,
  validateRequest,
  validateSchema
} from './openApiContract';

const PLANT_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('OpenAPI plant likes contract', () => {
  it.each([
    ['post', `/api/v1/plants/${PLANT_ID}/likes`],
    ['delete', `/api/v1/plants/${PLANT_ID}/likes`],
    ['get', `/api/v1/plants/${PLANT_ID}/likes/me`]
  ] as const)('validates contract route for %s %s', (method, path) => {
    expect(validateRequest(method, path)).toEqual([]);
  });

  describe('fixtures against schemas', () => {
    it('PlantLikeItem conforms to schema', () => {
      expect(validateSchema('PlantLikeItem', buildPlantLikeItem())).toEqual([]);
    });

    it('CheckPlantLikeResponse conforms to schema', () => {
      expect(
        validateSchema('CheckPlantLikeResponse', buildCheckPlantLikeResponse())
      ).toEqual([]);
    });
  });

  describe('likePlant', () => {
    it('performs POST /api/v1/plants/{plantId}/likes', async () => {
      const fetchMock = stubFetchOk(buildPlantLikeItem({ plantId: PLANT_ID }));

      await likePlant(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/plants/${PLANT_ID}/likes`);
      expect(init?.method).toBe('POST');
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

  describe('unlikePlant', () => {
    it('performs DELETE /api/v1/plants/{plantId}/likes', async () => {
      const fetchMock = stubFetchOk(undefined, { 'content-length': '0' });

      await unlikePlant(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/plants/${PLANT_ID}/likes`);
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

  describe('checkPlantLike', () => {
    it('performs GET /api/v1/plants/{plantId}/likes/me', async () => {
      const fetchMock = stubFetchOk(buildCheckPlantLikeResponse());

      await checkPlantLike(PLANT_ID);

      const { url, init } = lastRequest(fetchMock);
      expect(url).toBe(`${API_URL}/api/v1/plants/${PLANT_ID}/likes/me`);
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
});
