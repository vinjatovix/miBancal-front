type FetchCall = [url: string, init?: RequestInit];

type FetchFn = (...args: FetchCall) => Promise<unknown>;

export type FetchMock = ReturnType<typeof vi.fn<FetchFn>>;

export const API_URL = import.meta.env.VITE_API_URL;

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

function buildHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(customHeaders)) {
      for (const [key, value] of customHeaders) headers.set(key, value);
    } else {
      for (const [key, value] of Object.entries(customHeaders)) {
        headers.set(key, value);
      }
    }
  }
  return headers;
}

function fetchResponse(
  ok: boolean,
  status: number,
  body: unknown,
  customHeaders?: HeadersInit
) {
  return Promise.resolve({
    ok,
    status,
    statusText: '',
    headers: buildHeaders(customHeaders),
    json: () => Promise.resolve(body)
  });
}

function stubFetch(
  ok: boolean,
  status: number,
  body: unknown,
  headers?: HeadersInit
): FetchMock {
  const fetchMock = vi.fn<FetchFn>(() =>
    fetchResponse(ok, status, body, headers)
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

type StubResponse = {
  readonly ok: boolean;
  readonly status: number;
  readonly body: unknown;
  readonly headers?: HeadersInit;
};

export function okResponse(body: unknown, headers?: HeadersInit): StubResponse {
  return { ok: true, status: 200, body, headers };
}

export function errorResponse(
  status: number,
  body: unknown,
  headers?: HeadersInit
): StubResponse {
  return { ok: false, status, body, headers };
}

export function stubFetchSequence(...responses: StubResponse[]): FetchMock {
  const fetchMock = responses.reduce<FetchMock>(
    (mock, { ok, status, body, headers }) =>
      mock.mockImplementationOnce(() =>
        fetchResponse(ok, status, body, headers)
      ),
    vi.fn<FetchFn>()
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function stubFetchOk(body: unknown, headers?: HeadersInit): FetchMock {
  return stubFetch(true, 200, body, headers);
}

export function stubFetchError(
  status: number,
  body: unknown,
  headers?: HeadersInit
): FetchMock {
  return stubFetch(false, status, body, headers);
}

export function lastRequest(fetchMock: FetchMock): {
  url: string;
  init?: RequestInit;
} {
  const [url, init] = fetchMock.mock.lastCall as FetchCall;
  return { url: decodeURIComponent(url), init };
}

export function requestUrls(fetchMock: FetchMock): string[] {
  return fetchMock.mock.calls.map(([url]) => decodeURIComponent(url));
}
