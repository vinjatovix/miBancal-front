import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useBedPlacementDraft,
  type PlantPlacementInput
} from '../../../../src/pages/beds/hooks/useBedPlacementDraft';
import { batchPlacePlantInstances } from '../../../../src/services/plantInstances.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import {
  buildCropPlacementItem,
  buildPlantInstance
} from '../../../fixtures/plantInstances/buildPlantInstance';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plantInstances.service', () => ({
  batchPlacePlantInstances: vi.fn(),
  batchUpdatePlantInstances: vi.fn(),
  batchRemovePlantInstances: vi.fn()
}));

const mockedBatchPlace = vi.mocked(batchPlacePlantInstances);

const BED = {
  id: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
  width: 200,
  height: 100
};

const TOMATO: PlantPlacementInput = {
  plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  commonName: 'Tomate',
  scientificName: 'Solanum lycopersicum',
  spacingCmMin: 50
};

function renderDraft(initialCrops = [buildCropPlacementItem()]) {
  const queryClient = createTestQueryClient();
  return renderHook(() => useBedPlacementDraft({ bed: BED, initialCrops }), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
});

describe('useBedPlacementDraft', () => {
  it('populates current crops from the initial crops', () => {
    const initial = [buildCropPlacementItem({ id: 'crop-1' })];

    const { result } = renderDraft(initial);

    expect(result.current.currentCrops).toEqual(initial);
    expect(result.current.hasChanges).toBe(false);
  });

  it('adds a new crop computing the vital radius and marking the draft dirty', () => {
    const { result } = renderDraft([]);

    act(() => {
      result.current.addCrop(TOMATO, { x: 60, y: 40 });
    });

    expect(result.current.currentCrops).toHaveLength(1);
    expect(result.current.currentCrops[0].vitalRadius).toBe(25);
    expect(result.current.currentCrops[0].isNew).toBe(true);
    expect(result.current.pendingCreations).toHaveLength(1);
    expect(result.current.hasChanges).toBe(true);
  });

  it('persists pending creations through batchPlacePlantInstances on save', async () => {
    mockedBatchPlace.mockResolvedValue({
      data: [buildPlantInstance()]
    });
    const { result } = renderDraft([]);

    act(() => {
      result.current.addCrop(TOMATO, { x: 60, y: 40 });
    });

    await act(async () => {
      await result.current.save();
    });

    await waitFor(() => {
      expect(mockedBatchPlace).toHaveBeenCalledTimes(1);
    });
    expect(mockedBatchPlace).toHaveBeenCalledWith({
      bedId: BED.id,
      items: [
        expect.objectContaining({
          plantId: TOMATO.plantId,
          position: { x: 60, y: 40 },
          growthStatus: 'planted'
        })
      ]
    });
    expect(result.current.isSaving).toBe(false);
  });

  it('restores the baseline crops when discarding changes', () => {
    const initial = [buildCropPlacementItem({ id: 'crop-1' })];
    const { result } = renderDraft(initial);

    act(() => {
      result.current.addCrop(TOMATO, { x: 10, y: 10 });
    });
    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.discardChanges();
    });

    expect(result.current.currentCrops).toEqual(initial);
    expect(result.current.hasChanges).toBe(false);
  });
});
