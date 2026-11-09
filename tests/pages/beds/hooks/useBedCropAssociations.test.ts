import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBedCropAssociations } from '../../../../src/pages/beds/hooks/useBedCropAssociations';
import { getPlantRelations } from '../../../../src/services/plantRelations.service';
import type { CropPlacementItem } from '../../../../src/types/PlantInstance/plantPlacementTypes';
import {
  buildPaginatedPlantRelationsResponse,
  buildPlantRelation
} from '../../../fixtures/plantRelations/buildPlantRelation';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plantRelations.service', () => ({
  getPlantRelations: vi.fn()
}));

const mockedGetPlantRelations = vi.mocked(getPlantRelations);

function createMockCrop(
  id: string,
  plantId: string,
  x: number,
  y: number,
  commonName = 'Planta'
): CropPlacementItem {
  return {
    id,
    bedId: 'bed-1',
    plantId,
    commonName,
    position: { x, y },
    vitalRadius: 20,
    growthStatus: 'planted',
    version: 1
  };
}

describe('useBedCropAssociations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries relations per unique plantId without duplicate N+1 queries', async () => {
    mockedGetPlantRelations.mockResolvedValue(
      buildPaginatedPlantRelationsResponse([])
    );

    const crops: CropPlacementItem[] = [
      createMockCrop('c1', 'plant-tomato', 50, 50, 'Tomate'),
      createMockCrop('c2', 'plant-tomato', 100, 50, 'Tomate 2'),
      createMockCrop('c3', 'plant-basil', 80, 50, 'Albahaca')
    ];

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useBedCropAssociations(crops), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetPlantRelations).toHaveBeenCalledTimes(2);
    expect(mockedGetPlantRelations).toHaveBeenCalledWith({
      filters: { appliesToPlantId: 'plant-tomato' },
      pagination: { limit: 100 }
    });
    expect(mockedGetPlantRelations).toHaveBeenCalledWith({
      filters: { appliesToPlantId: 'plant-basil' },
      pagination: { limit: 100 }
    });
  });

  it('computes active links for crops within effective reach', async () => {
    const relation = buildPlantRelation({
      sourcePlantId: 'plant-tomato',
      targetPlantId: 'plant-basil',
      type: 'beneficial',
      proximity: { minDistanceCm: 0, maxDistanceCm: 80 }
    });

    mockedGetPlantRelations.mockImplementation(async (request) => {
      if (request?.filters?.appliesToPlantId === 'plant-tomato') {
        return buildPaginatedPlantRelationsResponse([relation]);
      }
      return buildPaginatedPlantRelationsResponse([relation]);
    });

    const crops: CropPlacementItem[] = [
      createMockCrop('crop-1', 'plant-tomato', 50, 50, 'Tomate'),
      createMockCrop('crop-2', 'plant-basil', 80, 50, 'Albahaca')
    ];

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useBedCropAssociations(crops), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.links).toHaveLength(1);
    expect(result.current.links[0].visualPolarity).toBe('beneficial');
    expect(result.current.links[0].distanceCm).toBe(30);
  });

  it('accepts AssociationCropPoint directly and ignores crops without plantId', async () => {
    mockedGetPlantRelations.mockResolvedValue(
      buildPaginatedPlantRelationsResponse([])
    );

    const crops = [
      {
        id: 'p1',
        bedId: 'bed-1',
        plantId: 'plant-tomato',
        commonName: 'Tomate',
        x: 10,
        y: 10,
        vitalRadius: 15
      },
      {
        id: 'p2',
        bedId: 'bed-1',
        plantId: '',
        commonName: 'Desconocido',
        x: 40,
        y: 10,
        vitalRadius: 15
      }
    ];

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useBedCropAssociations(crops), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        )
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetPlantRelations).toHaveBeenCalledTimes(1);
  });

  it('sets isError when relation query rejects', async () => {
    mockedGetPlantRelations.mockRejectedValue(new Error('Network error'));

    const crops = [createMockCrop('c1', 'plant-err', 10, 10)];

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useBedCropAssociations(crops), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
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
});
