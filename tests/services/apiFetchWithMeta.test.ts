import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiFetchWithMeta } from '../../src/services/api';
import { ApiError } from '../../src/shared/errors/ApiError';

describe('apiFetchWithMeta', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns data and etag when response includes ETag header', async () => {
    const payload = { id: 'test-1', name: 'Solanaceae' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          ETag: '"etag-123"'
        }),
        json: () => Promise.resolve(payload)
      } as unknown as Response)
    );

    const result = await apiFetchWithMeta<typeof payload>('/api/v1/test');

    expect(result).toEqual({
      data: payload,
      etag: '"etag-123"'
    });
  });

  it.each([
    { rawEtag: 'W/"1"', expectedEtag: '"1"' },
    { rawEtag: 'w/"1"', expectedEtag: '"1"' },
    { rawEtag: 'W/"etag-xyz"', expectedEtag: '"etag-xyz"' }
  ])(
    'sanitizes weak ETag $rawEtag to strong ETag $expectedEtag',
    async ({ rawEtag, expectedEtag }) => {
      const payload = { id: 'test-weak' };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type': 'application/json',
            ETag: rawEtag
          }),
          json: () => Promise.resolve(payload)
        } as unknown as Response)
      );

      const result = await apiFetchWithMeta<typeof payload>('/api/v1/test');

      expect(result).toEqual({
        data: payload,
        etag: expectedEtag
      });
    }
  );

  it('returns data and null etag when response lacks ETag header', async () => {
    const payload = { id: 'test-2' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: () => Promise.resolve(payload)
      } as unknown as Response)
    );

    const result = await apiFetchWithMeta<typeof payload>('/api/v1/test');

    expect(result).toEqual({
      data: payload,
      etag: null
    });
  });

  it('throws ApiError when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: () => Promise.resolve({ message: 'Resource not found' })
      } as unknown as Response)
    );

    const action = apiFetchWithMeta('/api/v1/test');

    await expect(action).rejects.toBeInstanceOf(ApiError);
  });
});
