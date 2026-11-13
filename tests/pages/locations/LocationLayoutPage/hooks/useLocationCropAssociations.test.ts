import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import { useLocationCropAssociations } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLocationCropAssociations';
import { getPlantRelations } from '../../../../../src/services/plantRelations.service';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';
import {
  buildPaginatedPlantRelationsResponse,
  buildPlantRelation
} from '../../../../fixtures/plantRelations/buildPlantRelation';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/plantRelations.service', () => ({
  getPlantRelations: vi.fn()
}));

const mockedGetPlantRelations = vi.mocked(getPlantRelations);

function createMockCrop(
  id: string,
  bedId: string,
  plantId: string,
  x: number,
  y: number,
  commonName = 'Planta'
): CropPlacementItem {
  return {
    id,
    bedId,
    plantId,
    commonName,
    position: { x, y },
    vitalRadius: 20,
    growthStatus: 'planted',
    version: 1
  };
}

describe('useLocationCropAssociations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('transforms crop coordinates to global location space and detects cross-bed associations', async () => {
    const relation = buildPlantRelation({
      sourcePlantId: 'plant-tomato',
      targetPlantId: 'plant-basil',
      type: 'beneficial',
      proximity: { minDistanceCm: 0, maxDistanceCm: 80 }
    });

    mockedGetPlantRelations.mockResolvedValue(
      buildPaginatedPlantRelationsResponse([relation])
    );

    const bedA: ResolvedBed = {
      id: 'bed-a',
      name: 'Bancal A',
      width: 120,
      height: 240,
      position: { x: 100, y: 100 },
      rotation: 0
    };

    const bedB: ResolvedBed = {
      id: 'bed-b',
      name: 'Bancal B',
      width: 120,
      height: 240,
      position: { x: 260, y: 100 },
      rotation: 0
    };

    const tomatoInBedA = createMockCrop(
      'crop-tomato',
      'bed-a',
      'plant-tomato',
      110,
      50,
      'Tomate'
    );
    const basilInBedB = createMockCrop(
      'crop-basil',
      'bed-b',
      'plant-basil',
      10,
      50,
      'Albahaca'
    );

    const cropsByBed = new Map<string, readonly CropPlacementItem[]>([
      ['bed-a', [tomatoInBedA]],
      ['bed-b', [basilInBedB]]
    ]);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(
      () => useLocationCropAssociations([bedA, bedB], cropsByBed),
      {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children
          )
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.links).toHaveLength(1);
    const link = result.current.links[0];
    expect(link.scope).toBe('cross_bed');
    expect(link.cropA.x).toBe(210);
    expect(link.cropB.x).toBe(270);
    expect(link.distanceCm).toBe(60);
  });

  it('handles beds with no placed crops gracefully', async () => {
    mockedGetPlantRelations.mockResolvedValue(
      buildPaginatedPlantRelationsResponse([])
    );

    const emptyBed: ResolvedBed = {
      id: 'bed-empty',
      name: 'Bancal Vacío',
      width: 100,
      height: 200,
      position: { x: 0, y: 0 },
      rotation: 0
    };

    const queryClient = createTestQueryClient();
    const { result } = renderHook(
      () => useLocationCropAssociations([emptyBed], new Map()),
      {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children
          )
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.links).toHaveLength(0);
  });
});
