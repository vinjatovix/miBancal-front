import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  addBatchCrops,
  duplicateBatchCrops,
  moveBatchCrops,
  removeBatchCrops
} from '../../../../src/pages/beds/hooks/bedPlacementBatchOperations';
import { useBedPlacementDraft } from '../../../../src/pages/beds/hooks/useBedPlacementDraft';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import type {
  BatchCropCreationItem,
  BatchCropMoveItem,
  PlantPlacementInput
} from '../../../../src/types/PlantInstance/brushSelectionTypes';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

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

const STRAWBERRY: PlantPlacementInput = {
  plantId: 'strawberry-id-1',
  commonName: 'Fresa',
  scientificName: 'Fragaria ananassa',
  spacingCmMin: 30
};

function renderDraftHook(initialCrops = [buildCropPlacementItem()]) {
  const queryClient = createTestQueryClient();
  return renderHook(() => useBedPlacementDraft({ bed: BED, initialCrops }), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  });
}

describe('bedPlacementBatchOperations', () => {
  describe('addBatchCrops', () => {
    it('adds multiple crops to existing list and assigns unique ids', () => {
      const initial = [buildCropPlacementItem({ id: 'c1' })];
      const items: readonly BatchCropCreationItem[] = [
        { plant: STRAWBERRY, position: { x: 20, y: 20 } },
        { plant: STRAWBERRY, position: { x: 50, y: 20 } }
      ];

      const result = addBatchCrops(initial, BED.id, items);

      expect(result.nextCrops).toHaveLength(3);
      expect(result.createdIds).toHaveLength(2);
      expect(result.createdIds[0]).not.toBe(result.createdIds[1]);
      expect(result.nextCrops[1].isNew).toBe(true);
      expect(result.nextCrops[1].vitalRadius).toBe(15);
    });

    it('returns empty createdIds when items array is empty', () => {
      const initial = [buildCropPlacementItem({ id: 'c1' })];

      const result = addBatchCrops(initial, BED.id, []);

      expect(result.nextCrops).toHaveLength(1);
      expect(result.createdIds).toEqual([]);
    });
  });

  describe('moveBatchCrops', () => {
    it.each([
      {
        scenario: 'single crop displacement',
        moves: [{ id: 'c1', position: { x: 80, y: 60 } }],
        expected: [{ id: 'c1', x: 80, y: 60, hasMoved: true }]
      },
      {
        scenario: 'multiple crops displacement',
        moves: [
          { id: 'c1', position: { x: 100, y: 50 } },
          { id: 'c2', position: { x: 150, y: 50 } }
        ],
        expected: [
          { id: 'c1', x: 100, y: 50, hasMoved: true },
          { id: 'c2', x: 150, y: 50, hasMoved: true }
        ]
      }
    ])(
      'moves crops according to delta instructions: $scenario',
      ({ moves, expected }) => {
        const initial = [
          buildCropPlacementItem({ id: 'c1', position: { x: 10, y: 10 } }),
          buildCropPlacementItem({ id: 'c2', position: { x: 40, y: 10 } })
        ];

        const result = moveBatchCrops(
          initial,
          moves as readonly BatchCropMoveItem[]
        );

        for (const item of expected) {
          const matched = result.find((crop) => crop.id === item.id);
          expect(matched?.position).toEqual({ x: item.x, y: item.y });
          expect(matched?.hasMoved).toBe(item.hasMoved);
        }
      }
    );
  });

  describe('removeBatchCrops', () => {
    it('removes target crops and tracks persisted crops in deletedCrops', () => {
      const initial = [
        buildCropPlacementItem({ id: 'persisted-1', isNew: false }),
        buildCropPlacementItem({ id: 'persisted-2', isNew: false }),
        buildCropPlacementItem({ id: 'new-1', isNew: true })
      ];

      const result = removeBatchCrops(initial, [], ['persisted-1', 'new-1']);

      expect(result.nextCrops.map((c) => c.id)).toEqual(['persisted-2']);
      expect(result.nextDeletedCrops.map((c) => c.id)).toEqual(['persisted-1']);
    });

    it('does not add new unsaved crops to deletedCrops', () => {
      const initial = [buildCropPlacementItem({ id: 'new-1', isNew: true })];

      const result = removeBatchCrops(initial, [], ['new-1']);

      expect(result.nextCrops).toHaveLength(0);
      expect(result.nextDeletedCrops).toHaveLength(0);
    });
  });

  describe('duplicateBatchCrops', () => {
    it('creates shifted copies of specified crops with new ids and marks them as new', () => {
      const initial = [
        buildCropPlacementItem({
          id: 'c1',
          position: { x: 10, y: 10 },
          isNew: false
        }),
        buildCropPlacementItem({
          id: 'c2',
          position: { x: 40, y: 10 },
          isNew: false
        })
      ];

      const result = duplicateBatchCrops(initial, BED.id, ['c1', 'c2'], {
        x: 20,
        y: 15
      });

      expect(result.nextCrops).toHaveLength(4);
      expect(result.clonedIds).toHaveLength(2);
      expect(result.clonedIds[0]).not.toBe('c1');
      expect(result.clonedIds[1]).not.toBe('c2');

      const clone1 = result.nextCrops.find((c) => c.id === result.clonedIds[0]);
      expect(clone1?.position).toEqual({ x: 30, y: 25 });
      expect(clone1?.isNew).toBe(true);
      expect(clone1?.hasMoved).toBe(false);
    });

    it('returns empty clonedIds when no matching crop ids are given', () => {
      const initial = [buildCropPlacementItem({ id: 'c1' })];

      const result = duplicateBatchCrops(initial, BED.id, ['unknown-id']);

      expect(result.nextCrops).toHaveLength(1);
      expect(result.clonedIds).toEqual([]);
    });
  });
});

describe('useBedPlacementDraft batch & selection integration', () => {
  it('toggles crop selection into multi-selection state', () => {
    const { result } = renderDraftHook([
      buildCropPlacementItem({ id: 'c1' }),
      buildCropPlacementItem({ id: 'c2' })
    ]);

    act(() => {
      result.current.toggleCropSelection('c1');
    });

    expect(result.current.selectedCropIds.has('c1')).toBe(true);
    expect(result.current.selectedCropId).toBe('c1');
  });

  it('clears multi-selection on clearSelection', () => {
    const { result } = renderDraftHook([
      buildCropPlacementItem({ id: 'c1' }),
      buildCropPlacementItem({ id: 'c2' })
    ]);
    act(() => {
      result.current.toggleCropSelection('c1');
      result.current.toggleCropSelection('c2');
    });

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCropIds.size).toBe(0);
    expect(result.current.selectedCropId).toBeNull();
  });

  it('adds batch crops through the hook and updates current crops', () => {
    const { result } = renderDraftHook([
      buildCropPlacementItem({ id: 'initial-1', position: { x: 10, y: 10 } })
    ]);

    let createdIds: readonly string[] = [];
    act(() => {
      createdIds = result.current.addCrops([
        { plant: STRAWBERRY, position: { x: 50, y: 20 } },
        { plant: STRAWBERRY, position: { x: 80, y: 20 } }
      ]);
    });

    expect(result.current.currentCrops).toHaveLength(3);
    expect(createdIds).toHaveLength(2);
  });

  it('moves multiple crops through the hook and updates their positions', () => {
    const { result } = renderDraftHook([
      buildCropPlacementItem({ id: 'initial-1', position: { x: 10, y: 10 } })
    ]);

    act(() => {
      result.current.moveCrops([
        { id: 'initial-1', position: { x: 55, y: 25 } }
      ]);
    });

    expect(result.current.currentCrops[0].position).toEqual({ x: 55, y: 25 });
  });

  it('duplicates crops through the hook and selects cloned items', () => {
    const { result } = renderDraftHook([
      buildCropPlacementItem({ id: 'initial-1', position: { x: 10, y: 10 } })
    ]);

    let clonedIds: readonly string[] = [];
    act(() => {
      clonedIds = result.current.duplicateCrops(['initial-1'], {
        x: 10,
        y: 10
      });
    });

    expect(result.current.currentCrops).toHaveLength(2);
    expect(result.current.selectedCropIds.has(clonedIds[0])).toBe(true);
  });

  it('removes multiple crops through the hook and cleans up selection', () => {
    const { result } = renderDraftHook([
      buildCropPlacementItem({ id: 'c1' }),
      buildCropPlacementItem({ id: 'c2' })
    ]);
    act(() => {
      result.current.toggleCropSelection('c1');
    });

    act(() => {
      result.current.removeCrops(['c1']);
    });

    expect(result.current.currentCrops).toHaveLength(1);
    expect(result.current.currentCrops[0].id).toBe('c2');
    expect(result.current.selectedCropIds.has('c1')).toBe(false);
  });
});
