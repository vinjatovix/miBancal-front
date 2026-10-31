import {
  addPlantBookmark,
  getBookmarkedPlantIds,
  removePlantBookmark
} from '../../src/services/bookmarks.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import {
  buildBookmark,
  buildUserBookmarksResponse
} from '../fixtures/bookmarks/buildBookmark';
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

describe('getBookmarkedPlantIds', () => {
  it('proyecta la respuesta a un Set de plantId', async () => {
    const bookmarks = [
      buildBookmark({ plantId: 'a' }),
      buildBookmark({ plantId: 'b' })
    ];
    stubFetchOk(buildUserBookmarksResponse(bookmarks));

    const result = await getBookmarkedPlantIds();

    expect(result).toEqual(new Set(['a', 'b']));
  });

  it('devuelve un Set vacío sin favoritas', async () => {
    stubFetchOk(buildUserBookmarksResponse([]));

    const result = await getBookmarkedPlantIds();

    expect(result).toEqual(new Set());
  });

  it('rechaza con ApiError ante un 401', async () => {
    stubFetchError(401, { message: 'Unauthorized' });

    const error = await getBookmarkedPlantIds().catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('addPlantBookmark', () => {
  it('hace POST con el plantId y Content-Type json', async () => {
    const fetchMock = stubFetchOk(buildBookmark({ plantId: 'p-1' }));

    const result = await addPlantBookmark('p-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/bookmarks/plants`);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ plantId: 'p-1' }));
    expect(init?.headers).toMatchObject(JSON_HEADERS);
    expect(result).toEqual(buildBookmark({ plantId: 'p-1' }));
  });

  it('es idempotente: una planta ya marcada devuelve 200 con la misma referencia', async () => {
    stubFetchOk(buildBookmark({ plantId: 'p-1' }));

    const result = await addPlantBookmark('p-1');

    expect(result.plantId).toBe('p-1');
  });
});

describe('removePlantBookmark', () => {
  it('makes DELETE to the route with plantId', async () => {
    const fetchMock = stubFetchOk(undefined, { 'content-length': '0' });

    await removePlantBookmark('p-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/bookmarks/plants/p-1`);
    expect(init?.method).toBe('DELETE');
  });

  it('resuelve sin error aunque la planta no estuviera marcada (idempotente, 204)', async () => {
    stubFetchOk(undefined, { 'content-length': '0' });

    await expect(removePlantBookmark('no-existe')).resolves.toBeUndefined();
  });

  it('rechaza con ApiError ante un 400', async () => {
    stubFetchError(400, { message: 'Invalid plantId' });

    const error = await removePlantBookmark('bad-id').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
  });
});
