import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryClient } from '../../src/app/queryClient';
import { ApiError } from '../../src/shared/errors/ApiError';
import { NetworkError } from '../../src/shared/errors/NetworkError';
import { shouldRetryQuery } from '../../src/shared/reactQuery/retryPolicy';

const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

let queryCount = 0;

async function failQuery(error: unknown, meta?: Record<string, unknown>) {
  queryCount += 1;
  await queryClient
    .fetchQuery({
      queryKey: ['failing-query', queryCount],
      queryFn: () => Promise.reject(error),
      retry: false,
      meta
    })
    .catch(() => undefined);
}

function reportedPayloads() {
  return errorSpy.mock.calls
    .map((call) => call.at(-1))
    .filter(
      (payload): payload is Record<string, unknown> =>
        typeof payload === 'object' && payload !== null && 'kind' in payload
    );
}

describe('queryClient', () => {
  beforeEach(() => {
    errorSpy.mockClear();
  });

  it('retries with the shared retry policy and does not refetch on focus', () => {
    const queries = queryClient.getDefaultOptions().queries;

    expect(queries?.retry).toBe(shouldRetryQuery);
    expect(queries?.refetchOnWindowFocus).toBe(false);
  });

  it('reports a 500 once as unavailable with its status', async () => {
    await failQuery(new ApiError('boom', 500));

    expect(reportedPayloads()).toEqual([
      expect.objectContaining({ kind: 'unavailable', status: 500 })
    ]);
  });

  it.each([
    ['a NetworkError', new NetworkError(new TypeError())],
    ['a 404', new ApiError('x', 404)],
    ['a 429', new ApiError('x', 429)]
  ])('does not report %s', async (_label, error) => {
    await failQuery(error);

    expect(reportedPayloads()).toEqual([]);
  });

  it('reports a 400 as badRequest', async () => {
    await failQuery(new ApiError('x', 400));

    expect(reportedPayloads()).toEqual([
      expect.objectContaining({ kind: 'badRequest', status: 400 })
    ]);
  });

  it('does not report a 400 when the query treats it as not found', async () => {
    await failQuery(new ApiError('x', 400), { badRequestMeansNotFound: true });

    expect(reportedPayloads()).toEqual([]);
  });

  it('reports a 403 as forbidden', async () => {
    await failQuery(new ApiError('x', 403));

    expect(reportedPayloads()).toEqual([
      expect.objectContaining({ kind: 'forbidden', status: 403 })
    ]);
  });
});
