import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlantSearch } from '../../../../src/pages/plantRelations/hooks/usePlantSearch';
import { searchPlants } from '../../../../src/services/plants.service';
import { listPlantsResponse } from '../../../fixtures/plants/listPlants';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plants.service', () => ({
  searchPlants: vi.fn()
}));

const mockedSearchPlants = vi.mocked(searchPlants);

describe('usePlantSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not execute search when query has fewer than 2 characters', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlantSearch('a'), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedSearchPlants).not.toHaveBeenCalled();
  });

  it('debounces search by 300ms before calling searchPlants', async () => {
    mockedSearchPlants.mockResolvedValue(listPlantsResponse);
    const queryClient = createTestQueryClient();

    const { result, rerender } = renderHook(
      ({ query }) => usePlantSearch(query),
      {
        initialProps: { query: '' },
        wrapper: ({ children }) =>
          React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children
          )
      }
    );

    rerender({ query: 'to' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(mockedSearchPlants).not.toHaveBeenCalled();

    rerender({ query: 'toma' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(mockedSearchPlants).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(mockedSearchPlants).toHaveBeenCalledExactlyOnceWith('toma', 5);

    await vi.runAllTimersAsync();

    expect(result.current.data).toEqual(listPlantsResponse);
  });

  it('does not search when enabled is false', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlantSearch('tomate', false), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedSearchPlants).not.toHaveBeenCalled();
  });
});
