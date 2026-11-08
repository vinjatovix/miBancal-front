import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useBedPlacementDraft,
  type PlantPlacementInput
} from '../../../../src/pages/beds/hooks/useBedPlacementDraft';
import {
  batchPlacePlantInstances,
  batchRemovePlantInstances,
  batchUpdatePlantInstances
} from '../../../../src/services/plantInstances.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';
import type { CropPlacementItem } from '../../../../src/types/PlantInstance/plantPlacementTypes';

vi.mock('../../../../src/services/plantInstances.service', () => ({
  batchPlacePlantInstances: vi.fn(),
  batchUpdatePlantInstances: vi.fn(),
  batchRemovePlantInstances: vi.fn()
}));

const mockedBatchPlace = vi.mocked(batchPlacePlantInstances);
const mockedBatchUpdate = vi.mocked(batchUpdatePlantInstances);
const mockedBatchRemove = vi.mocked(batchRemovePlantInstances);

const BED = {
  id: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
  width: 200,
  height: 100
};

const TOMATO: PlantPlacementInput = {
  plantId: 'tomato',
  commonName: 'Tomate',
  spacingCmMin: 50
};

function renderDraft(initialCrops: CropPlacementItem[] = []) {
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

describe('useBedPlacementDraft mutations', () => {
  it('stages an existing crop reposition as a pending update', () => {
    const crop = buildCropPlacementItem({ id: 'crop-1' });
    const { result } = renderDraft([crop]);

    act(() => {
      result.current.moveCrop('crop-1', { x: 90, y: 50 });
    });

    expect(result.current.pendingUpdates).toHaveLength(1);
    expect(result.current.currentCrops[0].position).toEqual({ x: 90, y: 50 });
  });

  it('stages an existing crop removal as a pending deletion', () => {
    const crop = buildCropPlacementItem({ id: 'crop-1' });
    const { result } = renderDraft([crop]);

    act(() => {
      result.current.removeCrop('crop-1');
    });

    expect(result.current.currentCrops).toHaveLength(0);
    expect(result.current.pendingDeletions).toHaveLength(1);
  });

  it('persists updates and deletions in batch through the services', async () => {
    mockedBatchUpdate.mockResolvedValue({ data: [] });
    mockedBatchRemove.mockResolvedValue();
    const first = buildCropPlacementItem({ id: 'crop-1', version: 1 });
    const second = buildCropPlacementItem({ id: 'crop-2', version: 3 });
    const { result } = renderDraft([first, second]);

    act(() => {
      result.current.moveCrop('crop-1', { x: 90, y: 50 });
      result.current.removeCrop('crop-2');
    });

    await act(async () => {
      await result.current.save();
    });

    await waitFor(() => {
      expect(mockedBatchUpdate).toHaveBeenCalledWith({
        items: [
          {
            id: 'crop-1',
            version: 1,
            position: { x: 90, y: 50 },
            growthStatus: 'planted'
          }
        ]
      });
    });
    expect(mockedBatchRemove).toHaveBeenCalledWith({
      items: [
        {
          id: 'crop-2',
          version: 3
        }
      ]
    });
  });

  it('discards staged updates and deletions restoring the baseline', () => {
    const crop = buildCropPlacementItem({ id: 'crop-1' });
    const { result } = renderDraft([crop]);

    act(() => {
      result.current.moveCrop('crop-1', { x: 90, y: 50 });
    });
    act(() => {
      result.current.discardChanges();
    });

    expect(result.current.pendingUpdates).toHaveLength(0);
    expect(result.current.currentCrops[0].position).toEqual(crop.position);
  });

  it('preserves pending creations and surfaces a conflict message on a 412 failure', async () => {
    mockedBatchPlace.mockRejectedValue(new PreconditionFailedError('conflict'));
    const { result } = renderDraft([]);

    act(() => {
      result.current.addCrop(TOMATO, { x: 60, y: 40 });
    });

    await act(async () => {
      await result.current.save();
    });

    await waitFor(() => {
      expect(result.current.saveError).toBe('bed.placement.save_conflict');
    });
    expect(result.current.pendingCreations).toHaveLength(1);
  });
});
