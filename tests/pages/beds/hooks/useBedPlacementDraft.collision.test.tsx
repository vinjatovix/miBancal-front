import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useBedPlacementDraft,
  type PlantPlacementInput
} from '../../../../src/pages/beds/hooks/useBedPlacementDraft';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';
import type { CropPlacementItem } from '../../../../src/types/PlantInstance/plantPlacementTypes';

vi.mock('../../../../src/services/plantInstances.service', () => ({
  createPlantInstance: vi.fn(),
  updatePlantInstance: vi.fn(),
  deletePlantInstance: vi.fn()
}));

const BED = {
  id: 'd3b07384-d113-48e0-bb12-f0183f05b0c8',
  width: 200,
  height: 100
};

const LETTUCE: PlantPlacementInput = {
  plantId: 'lettuce',
  commonName: 'Lechuga',
  spacingCmMin: 30
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

describe('useBedPlacementDraft collisions', () => {
  it('detects a conflicting pair when two crops overlap', () => {
    const existing = buildCropPlacementItem({
      id: 'crop-1',
      position: { x: 60, y: 40 },
      vitalRadius: 25
    });
    const { result } = renderDraft([existing]);

    act(() => {
      result.current.addCrop(LETTUCE, { x: 75, y: 40 });
    });

    expect(result.current.collisions).toHaveLength(1);
    expect(result.current.collisions[0]).toMatchObject({ cropIdA: 'crop-1' });
  });

  it('reports no collision when crops are placed far apart', () => {
    const existing = buildCropPlacementItem({
      id: 'crop-1',
      position: { x: 20, y: 20 },
      vitalRadius: 15
    });
    const { result } = renderDraft([existing]);

    act(() => {
      result.current.addCrop(LETTUCE, { x: 180, y: 80 });
    });

    expect(result.current.collisions).toHaveLength(0);
  });

  it('evaluates a candidate placement as colliding with an existing crop', () => {
    const existing = buildCropPlacementItem({
      id: 'crop-1',
      position: { x: 60, y: 40 },
      vitalRadius: 25
    });
    const { result } = renderDraft([existing]);

    const evaluation = result.current.evaluatePlacement({ x: 75, y: 40 }, 15);

    expect(evaluation.hasCollision).toBe(true);
    expect(evaluation.isOutOfBounds).toBe(false);
  });

  it('evaluates a candidate placement outside the bed as out of bounds', () => {
    const { result } = renderDraft([]);

    const evaluation = result.current.evaluatePlacement({ x: -5, y: 50 }, 15);

    expect(evaluation.isOutOfBounds).toBe(true);
  });
});
