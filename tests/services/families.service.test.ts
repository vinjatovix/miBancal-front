import {
  getFamilyById,
  getFamilyList
} from '../../src/services/families.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import { buildFamily } from '../fixtures/families/buildFamily';
import { buildFamilyListItem } from '../fixtures/families/buildFamilyListItem';
import {
  listFamilyItems,
  listFamilyItemsResponse
} from '../fixtures/families/listFamilyItems';
import type { PaginatedResponse } from '../../src/types/api';
import type { FamilyListItem } from '../../src/types/Family';
import {
  API_URL,
  JSON_HEADERS,
  errorResponse,
  lastRequest,
  okResponse,
  requestUrls,
  stubFetchError,
  stubFetchOk,
  stubFetchSequence
} from '../test-utils/stubFetch';

const NOT_FOUND_BODY = {
  message: 'Family not found',
  errors: { idOrSlug: 'not found' }
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function familyListUrl(page: number): string {
  return `${API_URL}/api/v1/families?pagination[page]=${page}&pagination[limit]=100&sort[name]=asc&fields[families]=name,scientificName`;
}

function familyListPage(
  page: number,
  totalPages: number,
  data: FamilyListItem[]
): PaginatedResponse<FamilyListItem> {
  return {
    data,
    pagination: {
      page,
      limit: 100,
      totalPages,
      totalItems: data.length * totalPages
    }
  };
}

describe('getFamilyList', () => {
  it('pide la primera página de 100 familias ordenadas por name con solo los campos del listado', async () => {
    const fetchMock = stubFetchOk(listFamilyItemsResponse);

    const result = await getFamilyList();

    expect(result).toEqual(listFamilyItems);
    expect(lastRequest(fetchMock)).toEqual({
      url: familyListUrl(1),
      init: { headers: JSON_HEADERS }
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('pide el resto de páginas y concatena las familias en orden', async () => {
    const [first, second, third] = ['f-1', 'f-2', 'f-3'].map((id) =>
      buildFamilyListItem({ id })
    );
    const fetchMock = stubFetchSequence(
      okResponse(familyListPage(1, 3, [first])),
      okResponse(familyListPage(2, 3, [second])),
      okResponse(familyListPage(3, 3, [third]))
    );

    const result = await getFamilyList();

    expect(result).toEqual([first, second, third]);
    expect(requestUrls(fetchMock)).toEqual([
      familyListUrl(1),
      familyListUrl(2),
      familyListUrl(3)
    ]);
  });

  it('pide una sola página si la API no devuelve familias', async () => {
    const fetchMock = stubFetchOk(familyListPage(1, 0, []));

    const result = await getFamilyList();

    expect(result).toEqual([]);
    expect(requestUrls(fetchMock)).toEqual([familyListUrl(1)]);
  });

  it('rechaza si falla una página posterior a la primera', async () => {
    stubFetchSequence(
      okResponse(familyListPage(1, 2, listFamilyItems)),
      errorResponse(500, { message: 'Internal error' })
    );

    const error = await getFamilyList().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500 });
  });

  it('rechaza con ApiError si la API responde con error', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getFamilyList().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(404);
    expect(apiError.message).toBe('Family not found');
  });
});

describe('getFamilyById', () => {
  it('pide la familia por id o slug', async () => {
    const family = buildFamily({ slug: 'solanaceae' });
    const fetchMock = stubFetchOk(family);

    const result = await getFamilyById('solanaceae');

    expect(result).toEqual(family);
    expect(lastRequest(fetchMock)).toEqual({
      url: `${API_URL}/api/v1/families/solanaceae`,
      init: { headers: JSON_HEADERS }
    });
  });

  it('rechaza con ApiError si la familia no existe', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getFamilyById('solanaceae').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(404);
    expect(apiError.message).toBe('Family not found');
  });
});
