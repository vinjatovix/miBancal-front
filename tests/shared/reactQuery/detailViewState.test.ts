import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { getDetailViewState } from '../../../src/shared/reactQuery/detailViewState';

function failedQuery(error: Error) {
  return { data: undefined, isError: true, isFetching: false, error };
}

describe('getDetailViewState', () => {
  it('is notFound without a route id', () => {
    expect(
      getDetailViewState(undefined, {
        data: undefined,
        isError: false,
        isFetching: false,
        error: null
      })
    ).toBe('notFound');
  });

  it.each([404, 400])(
    'is notFound when the request fails with %i',
    (status) => {
      expect(
        getDetailViewState('x', failedQuery(new ApiError('x', status)))
      ).toBe('notFound');
    }
  );

  it('is error for other failures', () => {
    expect(
      getDetailViewState('x', failedQuery(new NetworkError(new TypeError())))
    ).toBe('error');
  });

  it('follows the query view state otherwise', () => {
    expect(
      getDetailViewState('x', {
        data: {},
        isError: false,
        isFetching: false,
        error: null
      })
    ).toBe('success');
    expect(
      getDetailViewState('x', {
        data: undefined,
        isError: false,
        isFetching: true,
        error: null
      })
    ).toBe('loading');
  });
});
