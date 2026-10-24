import { describe, it, expect } from 'vitest';
import { getQueryViewState } from '../../../src/shared/reactQuery/queryViewState';

describe('getQueryViewState', () => {
  it('is success when there is data even if a refetch failed', () => {
    expect(
      getQueryViewState({ data: [], isError: true, isFetching: false })
    ).toBe('success');
  });

  it('is error when the query failed and is not fetching', () => {
    expect(
      getQueryViewState({ data: undefined, isError: true, isFetching: false })
    ).toBe('error');
  });

  it('is loading while a manual retry is in flight after an error', () => {
    expect(
      getQueryViewState({ data: undefined, isError: true, isFetching: true })
    ).toBe('loading');
  });

  it('is loading when there is neither data nor error', () => {
    expect(
      getQueryViewState({ data: undefined, isError: false, isFetching: true })
    ).toBe('loading');
  });
});
