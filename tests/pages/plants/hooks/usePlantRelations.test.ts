import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlantRelations } from '../../../../src/pages/plants/hooks/usePlantRelations';
import { getPlantRelations } from '../../../../src/services/plantRelations.service';
import { buildPaginatedPlantRelationsResponse } from '../../../fixtures/plantRelations/buildPlantRelation';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plantRelations.service', () => ({
  getPlantRelations: vi.fn()
}));

const mockedGetPlantRelations = vi.mocked(getPlantRelations);
const PLANT_ID = '11111111-1111-4111-8111-111111111111';

describe('usePlantRelations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes loading state initially while fetching', () => {
    mockedGetPlantRelations.mockImplementation(() => new Promise(() => {}));
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlantRelations(PLANT_ID), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    expect(result.current.isPending).toBe(true);
  });

  it('loads relations successfully for plant', async () => {
    const mockResponse = buildPaginatedPlantRelationsResponse();
    mockedGetPlantRelations.mockResolvedValue(mockResponse);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlantRelations(PLANT_ID), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  it('handles error state when service fails', async () => {
    mockedGetPlantRelations.mockRejectedValue(new Error('Network error'));
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlantRelations(PLANT_ID), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('does not execute query when plantId is undefined', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlantRelations(undefined), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedGetPlantRelations).not.toHaveBeenCalled();
  });
});
