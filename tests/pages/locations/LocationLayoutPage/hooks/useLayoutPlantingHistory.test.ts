import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useLayoutPlantingHistory,
  type PlantingDraftOps
} from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPlantingHistory';
import { useLayoutPlantingDraft } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPlantingDraft';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

const BED_ID = 'bed-1';

const serverCrop = buildCropPlacementItem({
  id: 'crop-1',
  bedId: BED_ID,
  position: { x: 50, y: 50 }
});

function buildDraft(): PlantingDraftOps {
  return {
    addCrop: vi.fn(() => 'new-1'),
    addCrops: vi.fn(() => ['new-1']),
    moveCrop: vi.fn(),
    removeCrops: vi.fn(),
    restoreCrops: vi.fn()
  };
}

function setup(
  crops: readonly CropPlacementItem[] = [serverCrop]
) {
  const draft = buildDraft();
  const effective = new Map([[BED_ID, crops]]);
  const view = renderHook(() => useLayoutPlantingHistory(draft, effective));
  return { ...view, draft };
}

describe('useLayoutPlantingHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks a planting action and undoes it by removing the created crops', () => {
    const { result, draft } = setup();
    act(() =>
      result.current.addCrops([
        {
          bedId: BED_ID,
          plantId: 'plant-1',
          commonName: 'Lechuga',
          vitalRadius: 20,
          position: { x: 10, y: 10 }
        }
      ])
    );
    expect(draft.addCrops).toHaveBeenCalledTimes(1);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(draft.removeCrops).toHaveBeenCalledWith(['new-1']);
    expect(result.current.canUndo).toBe(false);
  });

  it('tracks a move and undoes it back to the original position', () => {
    const { result, draft } = setup();
    act(() => result.current.moveCrop('crop-1', { x: 70, y: 70 }));
    expect(draft.moveCrop).toHaveBeenLastCalledWith('crop-1', { x: 70, y: 70 });

    act(() => result.current.undo());
    expect(draft.moveCrop).toHaveBeenLastCalledWith('crop-1', { x: 50, y: 50 });
  });

  it('does not record a move that keeps the same position', () => {
    const { result } = setup();
    act(() => result.current.moveCrop('crop-1', { x: 50, y: 50 }));
    expect(result.current.canUndo).toBe(false);
  });

  it('tracks a removal and undoes it by restoring the crops', () => {
    const { result, draft } = setup();
    act(() => result.current.removeCrops(['crop-1']));
    expect(draft.removeCrops).toHaveBeenCalledWith(['crop-1']);

    act(() => result.current.undo());
    expect(draft.restoreCrops).toHaveBeenCalledWith([serverCrop]);
  });

  it('clears the stack without reverting', () => {
    const { result, draft } = setup();
    act(() => result.current.removeCrops(['crop-1']));

    act(() => result.current.clear());

    expect(result.current.canUndo).toBe(false);
    expect(draft.restoreCrops).not.toHaveBeenCalled();
  });

  it('resets the stack without reverting', () => {
    const { result, draft } = setup();
    act(() => result.current.removeCrops(['crop-1']));

    act(() => result.current.reset());

    expect(result.current.canUndo).toBe(false);
    expect(draft.restoreCrops).not.toHaveBeenCalled();
  });
});

describe('useLayoutPlantingHistory wired to the real planting draft', () => {
  function cropsOf(
    map: ReadonlyMap<string, readonly CropPlacementItem[]>,
    bedId: string
  ): readonly CropPlacementItem[] {
    return map.get(bedId) ?? [];
  }

  function setupWithRealDraft(
    crops: readonly CropPlacementItem[] = [serverCrop]
  ) {
    const invalidateBed = vi.fn(async () => {});
    const cropsByBed = new Map([[BED_ID, crops]]);
    return renderHook(() => {
      const draft = useLayoutPlantingDraft({ cropsByBed, invalidateBed });
      const history = useLayoutPlantingHistory(draft, draft.effectiveCropsByBed);
      return { draft, history };
    });
  }

  it('removes a planted crop from the effective map when undone', () => {
    const { result } = setupWithRealDraft();

    act(() =>
      result.current.history.addCrop({
        bedId: BED_ID,
        plantId: 'plant-1',
        commonName: 'Lechuga',
        vitalRadius: 20,
        position: { x: 10, y: 10 }
      })
    );
    expect(cropsOf(result.current.draft.effectiveCropsByBed, BED_ID)).toHaveLength(
      2
    );

    act(() => result.current.history.undo());

    const remaining = cropsOf(result.current.draft.effectiveCropsByBed, BED_ID);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('crop-1');
    expect(result.current.draft.hasChanges).toBe(false);
    expect(result.current.history.canUndo).toBe(false);
  });

  it('restores the original position of a moved crop when undone', () => {
    const { result } = setupWithRealDraft();

    act(() => result.current.history.moveCrop('crop-1', { x: 70, y: 70 }));
    expect(
      cropsOf(result.current.draft.effectiveCropsByBed, BED_ID)[0].position
    ).toEqual({ x: 70, y: 70 });

    act(() => result.current.history.undo());

    const reverted = cropsOf(result.current.draft.effectiveCropsByBed, BED_ID)[0];
    expect(reverted.position).toEqual({ x: 50, y: 50 });
    expect(reverted.hasMoved).toBeUndefined();
    expect(result.current.draft.hasChanges).toBe(false);
  });

  it('brings back a removed server crop into the effective map when undone', () => {
    const { result } = setupWithRealDraft();

    act(() => result.current.history.removeCrops(['crop-1']));
    expect(cropsOf(result.current.draft.effectiveCropsByBed, BED_ID)).toHaveLength(
      0
    );

    act(() => result.current.history.undo());

    const restored = cropsOf(result.current.draft.effectiveCropsByBed, BED_ID);
    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe('crop-1');
    expect(result.current.draft.hasChanges).toBe(false);
  });
});
