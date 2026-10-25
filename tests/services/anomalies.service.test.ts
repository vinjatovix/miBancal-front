import {
  createAnomaly,
  deleteAnomaly,
  getAnomalyBySlug,
  getAnomalyForEdit,
  getAnomalyList,
  updateAnomaly
} from '../../src/services/anomalies.service';
import type { AnomalyListRequest } from '../../src/services/anomalyListQuery';
import { ApiError } from '../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../src/shared/errors/PreconditionFailedError';
import type { AnomalyListItem } from '../../src/types/Anomaly/Anomaly';
import type { PaginatedResponse } from '../../src/types/api';
import {
  buildAnomaly,
  buildAnomalyListItem
} from '../fixtures/anomalies/buildAnomaly';
import {
  API_URL,
  JSON_HEADERS,
  errorResponse,
  lastRequest,
  stubFetchError,
  stubFetchOk,
  stubFetchSequence
} from '../test-utils/stubFetch';

const ETAG = '"v3"';
const ANOMALIES_URL = `${API_URL}/api/v1/anomalies`;

afterEach(() => {
  vi.unstubAllGlobals();
});

function page(
  pageNumber: number,
  totalPages: number,
  data: AnomalyListItem[]
): PaginatedResponse<AnomalyListItem> {
  return {
    data,
    pagination: {
      page: pageNumber,
      limit: 100,
      totalPages,
      totalItems: data.length * totalPages
    }
  };
}

const request: AnomalyListRequest = {
  filters: {},
  pagination: { page: 1, limit: 25 },
  sort: { field: 'name', direction: 'asc' }
};

describe('getAnomalyList', () => {
  it('pide página, límite, orden y campos del listado', async () => {
    const response = page(1, 1, [buildAnomalyListItem()]);
    const fetchMock = stubFetchOk(response);

    const result = await getAnomalyList(request);

    expect(result).toEqual(response);
    expect(lastRequest(fetchMock)).toEqual({
      url: `${ANOMALIES_URL}?pagination[page]=1&pagination[limit]=25&sort[name]=asc&fields[anomalies]=slug,name,scientificName,category,status,deletedAt,resources`,
      init: { headers: JSON_HEADERS }
    });
  });

  it('añade el filtro de categoría con su clave tipada', async () => {
    const fetchMock = stubFetchOk(page(1, 1, []));

    await getAnomalyList({
      ...request,
      filters: { category: 'weed' },
      sort: { field: 'slug', direction: 'desc' }
    });

    expect(lastRequest(fetchMock).url).toBe(
      `${ANOMALIES_URL}?filter[category][eq]=weed&pagination[page]=1&pagination[limit]=25&sort[slug]=desc&fields[anomalies]=slug,name,scientificName,category,status,deletedAt,resources`
    );
  });
});

describe('getAnomalyBySlug', () => {
  it('pide la ficha por slug', async () => {
    const anomaly = buildAnomaly();
    const fetchMock = stubFetchOk(anomaly);

    const result = await getAnomalyBySlug('pulgon-verde');

    expect(result).toEqual(anomaly);
    expect(lastRequest(fetchMock)).toEqual({
      url: `${ANOMALIES_URL}/pulgon-verde`,
      init: { headers: JSON_HEADERS }
    });
  });

  it('devuelve anomalía con recursos multimedia y diagnóstico diferencial', async () => {
    const anomaly = buildAnomaly({
      resources: [
        {
          type: 'image',
          url: 'https://example.com/pulgon.jpg',
          title: 'Detalle'
        }
      ],
      confusedWith: ['pulgon-negro']
    });
    stubFetchOk(anomaly);

    const result = await getAnomalyBySlug('pulgon-verde');

    expect(result.resources).toHaveLength(1);
    expect(result.confusedWith).toEqual(['pulgon-negro']);
  });

  it('propaga el 404 como ApiError', async () => {
    stubFetchError(404, { message: 'not found' });

    await expect(getAnomalyBySlug('nada')).rejects.toMatchObject({
      status: 404
    });
  });
});

describe('getAnomalyForEdit', () => {
  it('devuelve la anomalía con el ETag de la respuesta', async () => {
    const anomaly = buildAnomaly();
    const fetchMock = stubFetchOk(anomaly, { ETag: ETAG });

    const result = await getAnomalyForEdit('pulgon-verde');

    expect(result).toEqual({ anomaly, etag: ETAG });
    expect(lastRequest(fetchMock).url).toBe(`${ANOMALIES_URL}/pulgon-verde`);
  });

  it('devuelve ETag vacío si la respuesta no lo trae', async () => {
    stubFetchOk(buildAnomaly());

    const result = await getAnomalyForEdit('pulgon-verde');

    expect(result.etag).toBe('');
  });
});

describe('createAnomaly', () => {
  const body = {
    id: 'id-1',
    slug: 'pulgon-verde',
    name: 'Pulgón verde',
    category: 'pest' as const
  };

  it('hace POST con el cuerpo y devuelve anomalía y ETag', async () => {
    const created = buildAnomaly();
    const fetchMock = stubFetchOk(created, { ETag: ETAG });

    const result = await createAnomaly(body);

    expect(result).toEqual({ anomaly: created, etag: ETAG });
    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(ANOMALIES_URL);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(body);
  });

  it('envía resources y confusedWith en el cuerpo de creación', async () => {
    const fullBody = {
      ...body,
      resources: [
        {
          type: 'image' as const,
          url: 'https://example.com/pulgon.jpg',
          title: 'Detalle'
        }
      ],
      confusedWith: ['pulgon-negro']
    };
    const created = buildAnomaly(fullBody);
    const fetchMock = stubFetchOk(created, { ETag: ETAG });

    const result = await createAnomaly(fullBody);

    expect(result.anomaly.resources).toHaveLength(1);
    expect(result.anomaly.confusedWith).toEqual(['pulgon-negro']);
    const sent = JSON.parse(lastRequest(fetchMock).init?.body as string);
    expect(sent.resources).toEqual(fullBody.resources);
    expect(sent.confusedWith).toEqual(fullBody.confusedWith);
  });

  it('genera el id con randomUUID si falta', async () => {
    const fetchMock = stubFetchOk(buildAnomaly(), { ETag: ETAG });
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-4111-8111-111111111111'
    );

    await createAnomaly({ ...body, id: '' });

    const sent = JSON.parse(lastRequest(fetchMock).init?.body as string);
    expect(sent.id).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('propaga el 409 de slug duplicado', async () => {
    stubFetchError(409, { message: 'duplicate' });

    await expect(createAnomaly(body)).rejects.toMatchObject({
      status: 409
    });
  });
});

describe('updateAnomaly', () => {
  it('hace PATCH con If-Match y devuelve el nuevo ETag', async () => {
    const updated = buildAnomaly({ name: 'Nuevo' });
    const fetchMock = stubFetchOk(updated, { ETag: '"v4"' });

    const result = await updateAnomaly('pulgon-verde', { name: 'Nuevo' }, ETAG);

    expect(result).toEqual({ anomaly: updated, etag: '"v4"' });
    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${ANOMALIES_URL}/pulgon-verde`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({ 'If-Match': ETAG });
    expect(init?.body).toBe(JSON.stringify({ name: 'Nuevo' }));
  });

  it('envía resources y confusedWith actualizados en PATCH', async () => {
    const patch = {
      resources: [
        {
          type: 'image' as const,
          url: 'https://example.com/nuevo-pulgon.jpg'
        }
      ],
      confusedWith: ['cochinilla-algodonosa']
    };
    const updated = buildAnomaly(patch);
    const fetchMock = stubFetchOk(updated, { ETag: '"v4"' });

    const result = await updateAnomaly('pulgon-verde', patch, ETAG);

    expect(result.anomaly.resources).toEqual(patch.resources);
    expect(result.anomaly.confusedWith).toEqual(patch.confusedWith);
    const { init } = lastRequest(fetchMock);
    expect(init?.body).toBe(JSON.stringify(patch));
  });

  it('envía null para limpiar resources y confusedWith en PATCH', async () => {
    const patch = {
      resources: null,
      confusedWith: null
    };
    const updated = buildAnomaly();
    const fetchMock = stubFetchOk(updated, { ETag: '"v4"' });

    const result = await updateAnomaly('pulgon-verde', patch, ETAG);

    expect(result.etag).toBe('"v4"');
    const { init } = lastRequest(fetchMock);
    expect(init?.body).toBe(JSON.stringify(patch));
  });

  it('lanza PreconditionFailedError ante 412', async () => {
    stubFetchError(412, { message: 'stale' });

    await expect(
      updateAnomaly('pulgon-verde', { name: 'x' }, ETAG)
    ).rejects.toBeInstanceOf(PreconditionFailedError);
  });

  it('propaga otros errores como ApiError', async () => {
    stubFetchError(400, { message: 'bad', errors: { name: 'required' } });

    await expect(
      updateAnomaly('pulgon-verde', { name: '' }, ETAG)
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('deleteAnomaly', () => {
  it('hace DELETE con If-Match', async () => {
    const fetchMock = stubFetchOk(undefined);

    await deleteAnomaly('pulgon-verde', ETAG);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${ANOMALIES_URL}/pulgon-verde`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({ 'If-Match': ETAG });
  });

  it('lanza PreconditionFailedError ante 412', async () => {
    stubFetchSequence(errorResponse(412, { message: 'stale' }));

    await expect(deleteAnomaly('pulgon-verde', ETAG)).rejects.toBeInstanceOf(
      PreconditionFailedError
    );
  });
});
