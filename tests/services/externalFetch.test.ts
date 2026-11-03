import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { externalFetch } from '../../src/services/api';
import {
  clearStoredToken,
  setStoredToken
} from '../../src/shared/auth/session';
import { ApiError } from '../../src/shared/errors/ApiError';
import { NetworkError } from '../../src/shared/errors/NetworkError';
import { VALID_TEST_TOKEN } from '../fixtures/auth/authFixtures';

describe('externalFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    setStoredToken(VALID_TEST_TOKEN);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearStoredToken();
  });

  it('realiza una petición GET sin cabecera Authorization aunque haya token en sesión', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ results: [] })
    } as Response;
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    const result = await externalFetch<{ results: unknown[] }>(
      'https://geocoding-api.open-meteo.com/v1/search?name=Sevilla'
    );

    expect(result).toEqual({ results: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const capturedInit = fetchMock.mock.calls[0]?.[1];
    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['authorization']).toBeUndefined();
  });

  it('realiza una petición GET sin cabecera Content-Type para evitar preflight CORS', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ results: [] })
    } as Response;
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    await externalFetch<{ results: unknown[] }>(
      'https://geocoding-api.open-meteo.com/v1/search?name=Ames'
    );

    const capturedInit = fetchMock.mock.calls[0]?.[1];
    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('incluye cabecera Content-Type cuando la petición tiene cuerpo', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true })
    } as Response;
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    await externalFetch<{ success: boolean }>(
      'https://api.external.example.com/data',
      {
        method: 'POST',
        body: JSON.stringify({ query: 'test' })
      }
    );

    const capturedInit = fetchMock.mock.calls[0]?.[1];
    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('respeta las cabeceras personalizadas proporcionadas en las opciones', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ results: [] })
    } as Response;
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    await externalFetch<{ results: unknown[] }>(
      'https://geocoding-api.open-meteo.com/v1/search?name=Ames',
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const capturedInit = fetchMock.mock.calls[0]?.[1];
    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers['Accept']).toBe('application/json');
  });

  it('lanza ApiError cuando la respuesta no es exitosa', async () => {
    const errorResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Server down' })
    } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse));

    await expect(
      externalFetch('https://geocoding-api.open-meteo.com/v1/search?name=Error')
    ).rejects.toThrow(ApiError);
  });

  it('lanza NetworkError cuando fetch falla por error de red', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Failed to fetch'))
    );

    await expect(
      externalFetch(
        'https://geocoding-api.open-meteo.com/v1/search?name=Offline'
      )
    ).rejects.toThrow(NetworkError);
  });
});
