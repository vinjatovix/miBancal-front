import { API_URL } from '../config/env';
import {
  clearStoredToken,
  getStoredToken,
  notifySessionPurged
} from '../shared/auth/session';
import { ApiError } from '../shared/errors/ApiError';
import { NetworkError } from '../shared/errors/NetworkError';
import { PreconditionFailedError } from '../shared/errors/PreconditionFailedError';

export const DEFAULT_TIMEOUT_MS = 15_000;
export const MUTATION_TIMEOUT_MS = 45_000;

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function defaultTimeoutFor(method?: string): number {
  return method && MUTATION_METHODS.has(method.toUpperCase())
    ? MUTATION_TIMEOUT_MS
    : DEFAULT_TIMEOUT_MS;
}

export interface ApiFetchOptions extends RequestInit {
  timeout?: number;
}

type ErrorBody = {
  message?: string;
  errors?: Record<string, string>;
};

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

function combineSignals(
  timeoutSignal: AbortSignal,
  customSignal?: AbortSignal | null
): { signal: AbortSignal; cleanup: () => void } {
  if (!customSignal) {
    return { signal: timeoutSignal, cleanup: () => {} };
  }
  if (typeof AbortSignal.any === 'function') {
    return {
      signal: AbortSignal.any([customSignal, timeoutSignal]),
      cleanup: () => {}
    };
  }
  const controller = new AbortController();
  const onAbort = () => {
    const reason = customSignal.aborted
      ? customSignal.reason
      : timeoutSignal.reason;
    controller.abort(reason);
  };
  if (customSignal.aborted || timeoutSignal.aborted) {
    onAbort();
    return { signal: controller.signal, cleanup: () => {} };
  }
  customSignal.addEventListener('abort', onAbort, { once: true });
  timeoutSignal.addEventListener('abort', onAbort, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      customSignal.removeEventListener('abort', onAbort);
      timeoutSignal.removeEventListener('abort', onAbort);
    }
  };
}

function resolveSignal(
  timeoutMs: number,
  customSignal?: AbortSignal | null
): { signal?: AbortSignal; cleanup: () => void } {
  if (timeoutMs <= 0) {
    return { signal: customSignal ?? undefined, cleanup: () => {} };
  }
  if (typeof AbortSignal.timeout === 'function') {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    return combineSignals(timeoutSignal, customSignal);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(
      new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      )
    );
  }, timeoutMs);
  const combined = combineSignals(controller.signal, customSignal);
  return {
    signal: combined.signal,
    cleanup: () => {
      clearTimeout(timer);
      combined.cleanup();
    }
  };
}

function isJsonResponse(response: Response): boolean {
  return (
    response.headers.get('content-type')?.includes('application/json') ?? false
  );
}

async function readErrorBody(response: Response): Promise<ErrorBody> {
  if (!isJsonResponse(response)) return {};
  try {
    const body: unknown = await response.json();
    return typeof body === 'object' && body !== null ? body : {};
  } catch {
    return {};
  }
}

function baseErrorMessage(response: Response): string {
  const statusText = response.statusText ? ` ${response.statusText}` : '';
  return `API error: ${response.status}${statusText}`;
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readErrorBody(response);
  const message =
    body.message ||
    (body.errors
      ? Object.values(body.errors).flat().join('; ')
      : baseErrorMessage(response));

  if (response.status === 412) {
    return new PreconditionFailedError(message, body.errors);
  }

  return new ApiError(message, response.status, body.errors);
}

async function request(
  url: string,
  init: RequestInit,
  timeoutMs?: number
): Promise<Response> {
  const effectiveTimeout = timeoutMs ?? defaultTimeoutFor(init.method);
  const { signal, cleanup } = resolveSignal(effectiveTimeout, init.signal);
  try {
    return await fetch(url, { ...init, signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new NetworkError(error);
  } finally {
    cleanup();
  }
}

function mergeHeaders(
  customHeaders?: HeadersInit,
  token?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(customHeaders)) {
      for (const [key, value] of customHeaders) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  return headers;
}

function isPublicGetEndpoint(path: string, method?: string): boolean {
  const isGet = !method || method.toUpperCase() === 'GET';
  if (!isGet) return false;
  return /^\/(?:api\/v1\/)?(plants|families|anomalies)(\/|\?|$)/.test(path);
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 202) {
    return undefined as T;
  }
  if (response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function handleResponseError(
  response: Response,
  url: string,
  path: string,
  options: ApiFetchOptions | undefined,
  hadToken: boolean
): Promise<Response> {
  if (response.status === 401) {
    clearStoredToken();
    notifySessionPurged();

    if (hadToken && isPublicGetEndpoint(path, options?.method)) {
      const retryHeaders = mergeHeaders(options?.headers, null);
      delete retryHeaders['Authorization'];
      delete retryHeaders['authorization'];
      return request(
        url,
        { ...options, headers: retryHeaders },
        options?.timeout
      );
    }
  }

  return response;
}

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<T> {
  const result = await apiFetchWithMeta<T>(path, options);
  return result.data;
}

export async function apiFetchWithMeta<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<{ data: T; etag: string | null }> {
  const token = getStoredToken();
  const hadToken = token !== null;
  const headers = mergeHeaders(options?.headers, token);
  const url = `${API_URL}${path}`;

  const response = await request(
    url,
    {
      ...options,
      headers
    },
    options?.timeout
  );

  const finalResponse = response.ok
    ? response
    : await handleResponseError(response, url, path, options, hadToken);

  if (!finalResponse.ok) {
    throw await toApiError(finalResponse);
  }

  const data = await parseResponseBody<T>(finalResponse);
  const rawEtag = finalResponse.headers.get('ETag');
  const etag = rawEtag ? rawEtag.replace(/^W\//i, '') : null;

  return { data, etag };
}
