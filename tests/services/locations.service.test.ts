import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createLocation,
  deleteLocation,
  getLocationForEdit,
  getLocationLayout,
  getLocationList,
  updateBedsLayout,
  updateLocation
} from '../../src/services/locations.service';
import {
  DEFAULT_LOCATION_SORT,
  type LocationListRequest
} from '../../src/services/locationListQuery';
import { ApiError } from '../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../src/shared/errors/PreconditionFailedError';
import type {
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../src/types/Location/Location';
import type { BedLayoutPlacementInput } from '../../src/types/Location/LocationLayout';
import { buildLocation } from '../fixtures/locations/buildLocation';
import { buildLocationLayout } from '../fixtures/locations/buildLocationLayout';
import { listLocationsResponse } from '../fixtures/locations/listLocations';
import { validateRequest } from '../contract/openApiContract';
import {
  API_URL,
  JSON_HEADERS,
  lastRequest,
  stubFetchError,
  stubFetchOk
} from '../test-utils/stubFetch';

const DEFAULT_REQUEST: LocationListRequest = {
  pagination: { page: 1, limit: 25 },
  sort: DEFAULT_LOCATION_SORT
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getLocationList', () => {
  it('pide la lista con paginación y orden por defecto', async () => {
    const fetchMock = stubFetchOk(listLocationsResponse);

    await getLocationList(DEFAULT_REQUEST);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/locations?pagination[page]=1&pagination[limit]=25&sort[name]=asc`
    );
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(validateRequest('get', url)).toEqual([]);
  });

  it.each([
    ['name', 'asc'],
    ['name', 'desc'],
    ['createdAt', 'asc'],
    ['createdAt', 'desc']
  ] as const)('ordena por sort[%s]=%s', async (field, direction) => {
    const fetchMock = stubFetchOk(listLocationsResponse);

    await getLocationList({ ...DEFAULT_REQUEST, sort: { field, direction } });

    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      `${API_URL}/api/v1/locations?pagination[page]=1&pagination[limit]=25&sort[${field}]=${direction}`
    );
    expect(validateRequest('get', url)).toEqual([]);
  });

  it('devuelve los datos y la paginación', async () => {
    stubFetchOk(listLocationsResponse);

    await expect(getLocationList(DEFAULT_REQUEST)).resolves.toEqual(
      listLocationsResponse
    );
  });

  it('rechaza con ApiError ante un error de la API', async () => {
    stubFetchError(401, { message: 'Unauthorized' });

    const error = await getLocationList(DEFAULT_REQUEST).catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
  });
});

describe('getLocationForEdit', () => {
  it('hace GET completo y extrae el ETag', async () => {
    const location = buildLocation({ id: 'loc-1' });
    const fetchMock = stubFetchOk(location, { ETag: '"1"' });

    const result = await getLocationForEdit('loc-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/locations/loc-1`);
    expect(init).toEqual({ headers: JSON_HEADERS });
    expect(result).toEqual({ location, etag: '"1"' });
  });

  it('devuelve etag vacío cuando falta la cabecera', async () => {
    const location = buildLocation({ id: 'loc-1' });
    stubFetchOk(location);

    const result = await getLocationForEdit('loc-1');

    expect(result).toEqual({ location, etag: '' });
  });
});

describe('createLocation', () => {
  it('hace POST, devuelve la ubicación y su ETag', async () => {
    const created = buildLocation({ id: 'new-id' });
    const input: CreateLocationRequest = {
      id: 'new-id',
      name: 'Huerto nuevo',
      latitude: 40.4168,
      longitude: -3.7038
    };
    const fetchMock = stubFetchOk(created, { ETag: '"1"' });

    const result = await createLocation(input);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/locations`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject(JSON_HEADERS);
    expect(JSON.parse(init?.body as string)).toEqual(input);
    expect(result).toEqual({ location: created, etag: '"1"' });
  });

  it('genera el id con crypto.randomUUID cuando falta', async () => {
    const created = buildLocation();
    const fetchMock = stubFetchOk(created, { ETag: '"1"' });
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '33333333-3333-4333-8333-333333333333'
    );

    await createLocation({
      id: '',
      name: 'Solo nombre',
      latitude: 40.4168,
      longitude: -3.7038
    });

    const body = JSON.parse(lastRequest(fetchMock).init?.body as string);
    expect(body.id).toBe('33333333-3333-4333-8333-333333333333');
    expect(body.latitude).toBe(40.4168);
    expect(body.longitude).toBe(-3.7038);
    vi.restoreAllMocks();
  });
});

describe('updateLocation', () => {
  it('hace PATCH con If-Match y devuelve el nuevo ETag', async () => {
    const updated = buildLocation({ id: 'loc-1', name: 'Renombrada' });
    const patch: UpdateLocationRequest = {
      name: 'Renombrada',
      latitude: 37.3891,
      longitude: -5.9845
    };
    const fetchMock = stubFetchOk(updated, { ETag: '"2"' });

    const result = await updateLocation('loc-1', patch, '"1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/locations/loc-1`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'If-Match': '"1"'
    });
    expect(JSON.parse(init?.body as string)).toEqual(patch);
    expect(result).toEqual({ location: updated, etag: '"2"' });
  });

  it('propaga PreconditionFailedError ante un 412', async () => {
    stubFetchError(412, { message: 'Precondition failed' });

    const error = await updateLocation('loc-1', {}, '"1"').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(PreconditionFailedError);
    expect((error as PreconditionFailedError).status).toBe(412);
  });
});

describe('getLocationLayout', () => {
  it('does a GET on the layout path and extracts the ETag', async () => {
    const layout = buildLocationLayout();
    const fetchMock = stubFetchOk(layout, { ETag: 'W/"7"' });

    const result = await getLocationLayout('loc-1');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/locations/loc-1/layout`);
    expect(init).toEqual({ cache: 'no-store', headers: JSON_HEADERS });
    expect(result).toEqual({ layout, etag: '"7"' });
    expect(validateRequest('get', url)).toEqual([]);
  });

  it('returns an empty etag when the header is missing', async () => {
    const layout = buildLocationLayout();
    stubFetchOk(layout);

    const result = await getLocationLayout('loc-1');

    expect(result).toEqual({ layout, etag: '' });
  });

  it('rejects with ApiError on a 404', async () => {
    stubFetchError(404, { message: 'Not found' });

    const error = await getLocationLayout('loc-1').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
  });
});

describe('updateBedsLayout', () => {
  const PLACEMENTS: readonly BedLayoutPlacementInput[] = [
    {
      id: '22222222-2222-4222-8222-222222222221',
      position: { x: 10, y: 20 },
      rotation: 90
    },
    { id: '33333333-3333-4333-8333-333333333331', position: null }
  ];

  it('does a PATCH with If-Match, an array body and returns the new ETag', async () => {
    const fetchMock = stubFetchOk(undefined, { ETag: '"9"' });

    const result = await updateBedsLayout('loc-1', PLACEMENTS, '"7"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/locations/loc-1/beds-layout`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'If-Match': '"7"'
    });
    expect(JSON.parse(init?.body as string)).toEqual(PLACEMENTS);
    expect(result).toEqual({ etag: '"9"' });
    expect(validateRequest('patch', url)).toEqual([]);
  });

  it('does not parse a body on a 204 response', async () => {
    const fetchMock = stubFetchError(204, undefined, { ETag: '"9"' });
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        statusText: '',
        headers: new Headers({ ETag: '"9"' }),
        json: () => Promise.reject(new Error('body must not be read'))
      })
    );

    const result = await updateBedsLayout('loc-1', PLACEMENTS, '"7"');

    expect(result).toEqual({ etag: '"9"' });
  });

  it.each([400, 401, 404, 409, 428])(
    'maps a %s response to an ApiError',
    async (status) => {
      stubFetchError(status, { message: 'error' });

      const error = await updateBedsLayout('loc-1', PLACEMENTS, '"7"').catch(
        (caught: unknown) => caught
      );

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
    }
  );

  it('maps a 412 response to a PreconditionFailedError', async () => {
    stubFetchError(412, { message: 'Precondition failed' });

    const error = await updateBedsLayout('loc-1', PLACEMENTS, '"7"').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(PreconditionFailedError);
    expect((error as PreconditionFailedError).status).toBe(412);
  });
});

describe('deleteLocation', () => {
  it('hace DELETE con If-Match y sin cuerpo', async () => {
    const fetchMock = stubFetchOk(undefined);

    await deleteLocation('loc-1', '"etag-1"');

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/api/v1/locations/loc-1`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({ 'If-Match': '"etag-1"' });
    expect(init?.body).toBeUndefined();
  });

  it('propaga PreconditionFailedError ante un 412', async () => {
    stubFetchError(412, { message: 'Precondition failed' });

    const error = await deleteLocation('loc-1', '"stale"').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(PreconditionFailedError);
  });
});
