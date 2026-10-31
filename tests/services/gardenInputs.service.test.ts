import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createGardenInput,
  deleteGardenInput,
  getGardenInput,
  getGardenInputList,
  getGardenInputWithMeta,
  updateGardenInput
} from '../../src/services/gardenInputs.service';
import type { GardenInputListRequest } from '../../src/services/gardenInputListQuery';
import { ApiError } from '../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../src/shared/errors/PreconditionFailedError';
import type { PaginatedResponse } from '../../src/types/api';
import type {
  CreateGardenInputRequest,
  GardenInputListItem,
  UpdateGardenInputRequest
} from '../../src/types/GardenInput/GardenInput';
import {
  buildGardenInput,
  buildGardenInputListItem
} from '../fixtures/gardenInputs/gardenInputFixtures';
import {
  API_URL,
  JSON_HEADERS,
  errorResponse,
  lastRequest,
  stubFetchError,
  stubFetchOk,
  stubFetchSequence
} from '../test-utils/stubFetch';

const ETAG = '"v1"';
const GARDEN_INPUTS_URL = `${API_URL}/api/v1/garden-inputs`;

afterEach(() => {
  vi.unstubAllGlobals();
});

function createPage(
  pageNumber: number,
  totalPages: number,
  data: GardenInputListItem[]
): PaginatedResponse<GardenInputListItem> {
  return {
    data,
    pagination: {
      page: pageNumber,
      limit: 25,
      totalPages,
      totalItems: data.length * totalPages
    }
  };
}

const defaultRequest: GardenInputListRequest = {
  filters: {},
  pagination: { page: 1, limit: 25 },
  sort: { field: 'name', direction: 'asc' }
};

describe('getGardenInputList', () => {
  it('requests pagination, sort and sparse fieldset list fields', async () => {
    const response = createPage(1, 1, [buildGardenInputListItem()]);
    const fetchMock = stubFetchOk(response);

    const result = await getGardenInputList(defaultRequest);

    expect(result).toEqual(response);
    expect(lastRequest(fetchMock)).toEqual({
      url: `${GARDEN_INPUTS_URL}?pagination[page]=1&pagination[limit]=25&sort[name]=asc&fields[gardenInputs]=id,slug,name,category,actions,description,status,deletedAt`,
      init: { headers: JSON_HEADERS }
    });
  });

  it('includes category filter with in operator', async () => {
    const fetchMock = stubFetchOk(createPage(1, 1, []));

    await getGardenInputList({
      ...defaultRequest,
      filters: { category: ['defense', 'fertilizer'] },
      sort: { field: 'slug', direction: 'desc' }
    });

    expect(lastRequest(fetchMock).url).toBe(
      `${GARDEN_INPUTS_URL}?pagination[page]=1&pagination[limit]=25&sort[slug]=desc&fields[gardenInputs]=id,slug,name,category,actions,description,status,deletedAt&filter[category][in]=defense,fertilizer`
    );
  });

  it('includes action filter with in operator', async () => {
    const fetchMock = stubFetchOk(createPage(1, 1, []));

    await getGardenInputList({
      ...defaultRequest,
      filters: { action: ['fungicide', 'insecticide'] }
    });

    expect(lastRequest(fetchMock).url).toBe(
      `${GARDEN_INPUTS_URL}?pagination[page]=1&pagination[limit]=25&sort[name]=asc&fields[gardenInputs]=id,slug,name,category,actions,description,status,deletedAt&filter[action][in]=fungicide,insecticide`
    );
  });

  it('includes status filter with eq operator when single status provided', async () => {
    const fetchMock = stubFetchOk(createPage(1, 1, []));

    await getGardenInputList({
      ...defaultRequest,
      filters: { status: 'active' }
    });

    expect(lastRequest(fetchMock).url).toBe(
      `${GARDEN_INPUTS_URL}?pagination[page]=1&pagination[limit]=25&sort[name]=asc&fields[gardenInputs]=id,slug,name,category,actions,description,status,deletedAt&filter[status][eq]=active`
    );
  });
});

describe('getGardenInput', () => {
  it('requests garden input by slug', async () => {
    const gardenInput = buildGardenInput();
    const fetchMock = stubFetchOk(gardenInput);

    const result = await getGardenInput('purin-ortiga');

    expect(result).toEqual(gardenInput);
    expect(lastRequest(fetchMock)).toEqual({
      url: `${GARDEN_INPUTS_URL}/purin-ortiga`,
      init: { headers: JSON_HEADERS }
    });
  });

  it('propagates 404 response as ApiError', async () => {
    stubFetchError(404, { message: 'Insumo no encontrado' });

    await expect(getGardenInput('inexistente')).rejects.toMatchObject({
      status: 404
    });
  });
});

describe('getGardenInputWithMeta', () => {
  it('returns garden input with ETag header from response', async () => {
    const gardenInput = buildGardenInput();
    const fetchMock = stubFetchOk(gardenInput, { ETag: ETAG });

    const result = await getGardenInputWithMeta('purin-ortiga');

    expect(result).toEqual({ gardenInput, etag: ETAG });
    expect(lastRequest(fetchMock).url).toBe(
      `${GARDEN_INPUTS_URL}/purin-ortiga`
    );
  });

  it('returns empty string etag if ETag header is missing', async () => {
    stubFetchOk(buildGardenInput());

    const result = await getGardenInputWithMeta('purin-ortiga');

    expect(result.etag).toBe('');
  });
});

describe('createGardenInput', () => {
  const payload: CreateGardenInputRequest = {
    id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
    slug: 'purin-ortiga',
    name: 'Purín de ortiga',
    category: 'fertilizer'
  };

  it('performs POST request with body and returns entity and ETag', async () => {
    const created = buildGardenInput();
    const fetchMock = stubFetchOk(created, { ETag: ETAG });

    const result = await createGardenInput(payload);

    expect(result).toEqual({ gardenInput: created, etag: ETAG });
    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(GARDEN_INPUTS_URL);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(payload);
  });

  it('generates randomUUID when id is not provided', async () => {
    const fetchMock = stubFetchOk(buildGardenInput(), { ETag: ETAG });
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90'
    );

    await createGardenInput({ ...payload, id: '' });

    const sent = JSON.parse(lastRequest(fetchMock).init?.body as string);
    expect(sent.id).toBe('7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90');
  });

  it('propagates 409 conflict error', async () => {
    stubFetchError(409, { message: 'Slug already exists' });

    await expect(createGardenInput(payload)).rejects.toMatchObject({
      status: 409
    });
  });
});

describe('updateGardenInput', () => {
  const patch: UpdateGardenInputRequest = {
    name: 'Purín enriquecido'
  };

  it('performs PATCH with If-Match header and returns updated entity and new ETag', async () => {
    const updated = buildGardenInput({ name: 'Purín enriquecido' });
    const fetchMock = stubFetchOk(updated, { ETag: '"v2"' });

    const result = await updateGardenInput('purin-ortiga', patch, ETAG);

    expect(result).toEqual({ gardenInput: updated, etag: '"v2"' });
    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${GARDEN_INPUTS_URL}/purin-ortiga`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({ 'If-Match': ETAG });
    expect(init?.body).toBe(JSON.stringify(patch));
  });

  it('throws PreconditionFailedError on 412 status', async () => {
    stubFetchError(412, { message: 'Precondition Failed' });

    await expect(
      updateGardenInput('purin-ortiga', patch, ETAG)
    ).rejects.toBeInstanceOf(PreconditionFailedError);
  });

  it('propagates other errors as ApiError', async () => {
    stubFetchError(400, { message: 'Bad request' });

    await expect(
      updateGardenInput('purin-ortiga', patch, ETAG)
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('deleteGardenInput', () => {
  it('performs DELETE with If-Match header', async () => {
    const fetchMock = stubFetchOk(undefined);

    await deleteGardenInput('purin-ortiga', ETAG);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${GARDEN_INPUTS_URL}/purin-ortiga`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({ 'If-Match': ETAG });
  });

  it('throws PreconditionFailedError on 412 status', async () => {
    stubFetchSequence(errorResponse(412, { message: 'Precondition Failed' }));

    await expect(
      deleteGardenInput('purin-ortiga', ETAG)
    ).rejects.toBeInstanceOf(PreconditionFailedError);
  });
});
