import {
  createFamily,
  getFamilyById,
  getFamilyForEdit,
  getFamilyList,
  updateFamily
} from '../../src/services/families.service';
import { ApiError } from '../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../src/shared/errors/PreconditionFailedError';
import type {
  CreateFamilyRequest,
  UpdateFamilyRequest
} from '../../src/types/Family';
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

describe('getFamilyForEdit', () => {
  it('requests family for edit without fields and extracts ETag', async () => {
    const family = buildFamily({ slug: 'solanaceae' });
    const fetchMock = stubFetchOk(family, { ETag: '"1"' });

    const result = await getFamilyForEdit('solanaceae');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/families/solanaceae`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(result).toEqual({ family, etag: '"1"' });
  });

  it('returns empty etag when ETag header is missing', async () => {
    const family = buildFamily({ slug: 'solanaceae' });
    stubFetchOk(family);

    const result = await getFamilyForEdit('solanaceae');

    expect(result).toEqual({ family, etag: '' });
  });

  it('rejects with ApiError when family does not exist', async () => {
    stubFetchError(404, NOT_FOUND_BODY);

    const error = await getFamilyForEdit('solanaceae').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('updateFamily', () => {
  it('sends PATCH with If-Match and returns updated family and new ETag', async () => {
    const updated = buildFamily({ slug: 'solanaceae', version: 2 });
    const patch: UpdateFamilyRequest = { name: 'Solanáceas actualizadas' };
    const fetchMock = stubFetchOk(updated, { ETag: '"2"' });

    const result = await updateFamily('solanaceae', patch, '"1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/families/solanaceae`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'If-Match': '"1"'
    });
    expect(JSON.parse(init?.body as string)).toEqual(patch);
    expect(result).toEqual({ family: updated, etag: '"2"' });
  });

  it('rejects with PreconditionFailedError on 412 version conflict', async () => {
    stubFetchError(412, { message: 'Precondition Failed' });

    const error = await updateFamily('solanaceae', {}, '"1"').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(PreconditionFailedError);
    expect((error as PreconditionFailedError).status).toBe(412);
  });
});

describe('createFamily', () => {
  it('sends POST to /api/v1/families and returns created family with its ETag', async () => {
    const created = buildFamily({ slug: 'solanaceae', version: 1 });
    const input: CreateFamilyRequest = {
      id: 'f-1',
      slug: 'solanaceae',
      name: 'Solanáceas',
      scientificName: 'Solanaceae',
      shortDescription: 'Familia botánica',
      highlights: ['Aspecto clave']
    };
    const fetchMock = stubFetchOk(created, { ETag: '"1"' });

    const result = await createFamily(input);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/families`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json'
    });
    expect(result).toEqual({ family: created, etag: '"1"' });
  });
});
