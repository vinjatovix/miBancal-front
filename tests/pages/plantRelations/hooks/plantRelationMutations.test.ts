import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreatePlantRelation } from '../../../../src/pages/plantRelations/hooks/useCreatePlantRelation';
import { useDeletePlantRelation } from '../../../../src/pages/plantRelations/hooks/useDeletePlantRelation';
import { useUpdatePlantRelation } from '../../../../src/pages/plantRelations/hooks/useUpdatePlantRelation';
import {
  createPlantRelation,
  deletePlantRelation,
  updatePlantRelation
} from '../../../../src/services/plantRelations.service';
import { buildPlantRelation } from '../../../fixtures/plantRelations/buildPlantRelation';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plantRelations.service', () => ({
  createPlantRelation: vi.fn(),
  updatePlantRelation: vi.fn(),
  deletePlantRelation: vi.fn()
}));

const mockedCreate = vi.mocked(createPlantRelation);
const mockedUpdate = vi.mocked(updatePlantRelation);
const mockedDelete = vi.mocked(deletePlantRelation);

const mockRelation = buildPlantRelation();

describe('plantRelation mutations hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes create mutation and returns created relation', async () => {
    mockedCreate.mockResolvedValue({
      relation: mockRelation,
      etag: '"v1"'
    });
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCreatePlantRelation(), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    result.current.mutate({
      source: mockRelation.source,
      target: mockRelation.target,
      type: 'beneficial',
      mechanism: 'pest_repellent',
      strength: 4,
      proximity: { minDistanceCm: 0, maxDistanceCm: 50 },
      reason: 'Repelente'
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(mockedCreate).toHaveBeenCalledTimes(1);
  });

  it('executes update mutation with patch and etag', async () => {
    mockedUpdate.mockResolvedValue({
      relation: mockRelation,
      etag: '"v2"'
    });
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useUpdatePlantRelation(), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    result.current.mutate({
      id: mockRelation.id,
      patch: { strength: 5 },
      etag: '"v1"'
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(mockedUpdate).toHaveBeenCalledWith(
      mockRelation.id,
      { strength: 5 },
      '"v1"'
    );
  });

  it('executes delete mutation with etag', async () => {
    mockedDelete.mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useDeletePlantRelation(), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    result.current.mutate({
      id: mockRelation.id,
      etag: '"v1"',
      plantId: mockRelation.sourcePlantId
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(mockedDelete).toHaveBeenCalledWith(mockRelation.id, '"v1"');
  });
});
