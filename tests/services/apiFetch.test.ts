import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch } from '../../src/services/api';
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearStoredToken,
  setStoredToken
} from '../../src/shared/auth/session';
import { ApiError } from '../../src/shared/errors/ApiError';
import { NetworkError } from '../../src/shared/errors/NetworkError';
import {
  EXPIRED_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../fixtures/auth/authFixtures';

type MockFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  contentType: string | null;
  json: () => Promise<unknown>;
};

function createFetchMock(response: Partial<MockFetchResponse>) {
  const contentType =
    response.contentType === undefined
      ? 'application/json; charset=utf-8'
      : response.contentType;
  return vi.fn<(...args: [string, RequestInit?]) => Promise<Response>>(() =>
    Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.statusText ?? '',
      headers: new Headers(
        contentType === null ? {} : { 'content-type': contentType }
      ),
      json: response.json ?? (() => Promise.resolve({}))
    } as Response)
  );
}

function getCapturedInit(
  mock: ReturnType<typeof createFetchMock>
): RequestInit | undefined {
  return mock.mock.calls[0]?.[1];
}

function stubFetchRejection(reason: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(reason))
  );
}

async function captureError(promise: Promise<unknown>) {
  return promise.catch((caughtError: unknown) => caughtError);
}

describe('apiFetch', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it.each([
    [
      'returns data on 200 success',
      { ok: true, json: () => Promise.resolve({ ok: true }) },
      { ok: true }
    ],
    [
      'returns undefined for 204 No Content',
      { ok: true, status: 204, contentType: null },
      undefined
    ],
    [
      'returns data for 201 with json body',
      { ok: true, status: 201, json: () => Promise.resolve({ id: '123' }) },
      { id: '123' }
    ],
    [
      'returns undefined for 201 with empty or non-json body',
      { ok: true, status: 201, contentType: null },
      undefined
    ],
    [
      'returns undefined for 202 Accepted without attempting json parse',
      { ok: true, status: 202, contentType: 'application/json; charset=utf-8' },
      undefined
    ]
  ])('%s', async (_, mockConfig, expected) => {
    vi.stubGlobal('fetch', createFetchMock(mockConfig));
    const result = await apiFetch('/test');
    expect(result).toEqual(expected);
  });

  it('returns undefined when content-length header is 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'content-type': 'application/json',
            'content-length': '0'
          }),
          json: () => Promise.reject(new SyntaxError('Unexpected end of JSON'))
        } as unknown as Response)
      )
    );

    const result = await apiFetch('/test');

    expect(result).toBeUndefined();
  });

  it('throws when response declares application/json but body contains malformed json', async () => {
    vi.stubGlobal(
      'fetch',
      createFetchMock({
        ok: true,
        status: 200,
        contentType: 'application/json',
        json: () => Promise.reject(new SyntaxError('Unexpected token'))
      })
    );

    await expect(apiFetch('/test')).rejects.toThrow(SyntaxError);
  });

  it('merges custom headers with default Content-Type', async () => {
    const fetchMock = createFetchMock({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/test', {
      headers: {
        'If-Match': '"abc123etag"'
      }
    });

    const init = getCapturedInit(fetchMock);
    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('If-Match')).toBe('"abc123etag"');
  });

  it('injects Authorization Bearer header when token is stored', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const fetchMock = createFetchMock({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/test');

    const init = getCapturedInit(fetchMock);
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${VALID_TEST_TOKEN}`);
  });

  it('does not inject Authorization header when no token is stored', async () => {
    const fetchMock = createFetchMock({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/test');

    const init = getCapturedInit(fetchMock);
    const headers = new Headers(init?.headers);
    expect(headers.has('Authorization')).toBe(false);
  });

  it('clears expired token and does not inject Authorization header', async () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, EXPIRED_TEST_TOKEN);
    const fetchMock = createFetchMock({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/test');

    const init = getCapturedInit(fetchMock);
    const headers = new Headers(init?.headers);
    expect(headers.has('Authorization')).toBe(false);
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('purges session on 401 response', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    vi.stubGlobal(
      'fetch',
      createFetchMock({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      })
    );

    await captureError(apiFetch('/admin'));

    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('transparently retries public GET endpoint on 401 without Authorization', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Unauthorized' })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: ['plant-1'] })
      });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch('/api/v1/plants');

    expect(result).toEqual({ data: ['plant-1'] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = new Headers(
      (fetchMock.mock.calls[1][1] as RequestInit).headers
    );
    expect(retryHeaders.has('Authorization')).toBe(false);
  });

  it('strips any custom Authorization header on public endpoint retry', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Unauthorized' })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: ['plant-1'] })
      });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/v1/plants', {
      headers: {
        Authorization: 'Bearer custom-token'
      }
    });

    const retryHeaders = new Headers(
      (fetchMock.mock.calls[1][1] as RequestInit).headers
    );
    expect(retryHeaders.has('Authorization')).toBe(false);
  });

  it('does not retry non-public endpoint on 401', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Unauthorized' })
    });
    vi.stubGlobal('fetch', fetchMock);

    await captureError(apiFetch('/api/v1/user/profile'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry non-GET request on 401 for public endpoint', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Unauthorized' })
    });
    vi.stubGlobal('fetch', fetchMock);

    await captureError(
      apiFetch('/api/v1/plants', {
        method: 'POST',
        body: JSON.stringify({ name: 'tomato' })
      })
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError with json message and errors', async () => {
    vi.stubGlobal(
      'fetch',
      createFetchMock({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Invalid input',
            errors: { name: 'required' }
          })
      })
    );

    const error = await captureError(apiFetch('/test'));
    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(400);
    expect(apiError.message).toBe('Invalid input');
    expect(apiError.errors).toEqual({ name: 'required' });
  });

  it.each([
    [
      'handles a json error response whose body cannot be parsed',
      {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.reject(new SyntaxError('fail'))
      },
      500,
      'API error: 500 Server Error'
    ],
    [
      'does not read an html error body and keeps the status',
      {
        ok: false,
        status: 502,
        contentType: 'text/html',
        json: () => Promise.resolve({ message: 'ignored' })
      },
      502,
      'API error: 502'
    ],
    [
      'keeps the status of an error response without body or content-type',
      { ok: false, status: 503, contentType: null },
      503,
      'API error: 503'
    ],
    [
      'throws ApiError with status 401',
      {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      },
      401,
      'Unauthorized'
    ]
  ])('%s', async (_, mockConfig, expectedStatus, expectedMessage) => {
    vi.stubGlobal('fetch', createFetchMock(mockConfig));

    const error = await captureError(apiFetch('/test'));
    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(expectedStatus);
    if (expectedMessage) {
      expect(apiError.message).toBe(expectedMessage);
    }
  });

  it('rethrows the same AbortError when the request is cancelled', async () => {
    const abortError = new DOMException('x', 'AbortError');
    stubFetchRejection(abortError);

    const error = await captureError(apiFetch('/test'));
    expect(error).toBe(abortError);
  });

  it('throws a NetworkError keeping the original cause when fetch rejects', async () => {
    const cause = new TypeError('Failed to fetch');
    stubFetchRejection(cause);

    const error = await captureError(apiFetch('/test'));
    expect(error).toBeInstanceOf(NetworkError);
    expect((error as NetworkError).cause).toBe(cause);
  });
});
