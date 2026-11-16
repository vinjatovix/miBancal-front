import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutMarqueeSelection } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutMarqueeSelection';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

function buildBed(overrides: Partial<ResolvedBed> = {}): ResolvedBed {
  return {
    id: 'bed-a',
    name: 'Bancal A',
    width: 100,
    height: 100,
    position: { x: 0, y: 0 },
    rotation: 0,
    ...overrides
  };
}

const bedA = buildBed();
const bedB = buildBed({ id: 'bed-b', position: { x: 200, y: 0 } });

const cropA1 = buildCropPlacementItem({
  id: 'crop-a1',
  bedId: 'bed-a',
  position: { x: 30, y: 30 },
  vitalRadius: 10
});
const cropA2 = buildCropPlacementItem({
  id: 'crop-a2',
  bedId: 'bed-a',
  position: { x: 60, y: 60 },
  vitalRadius: 10
});

function buildCropsByBed(
  crops: readonly CropPlacementItem[] = [cropA1, cropA2]
): ReadonlyMap<string, readonly CropPlacementItem[]> {
  return new Map([['bed-a', crops]]);
}

function setup(
  overrides: Partial<Parameters<typeof useLayoutMarqueeSelection>[0]> = {}
) {
  const addCrops = vi.fn<(inputs: readonly unknown[]) => readonly string[]>(
    () => ['crop-new']
  );
  const moveCrops = vi.fn();
  const removeCrops = vi.fn();
  const onAnnounceError = vi.fn();
  const params = {
    isEnabled: true,
    beds: [bedA, bedB],
    cropsByBed: buildCropsByBed(),
    activeBedId: null,
    addCrops,
    moveCrops,
    removeCrops,
    onAnnounceError,
    ...overrides
  };
  const utils = renderHook((props) => useLayoutMarqueeSelection(props), {
    initialProps: params
  });
  return { ...utils, addCrops, moveCrops, removeCrops, onAnnounceError };
}

describe('useLayoutMarqueeSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with an empty selection', () => {
    const { result } = setup();
    expect(result.current.selectedCropIds.size).toBe(0);
    expect(result.current.selectedCropCount).toBe(0);
    expect(result.current.boundingBox).toBeNull();
    expect(result.current.marqueeBox).toBeNull();
    expect(result.current.groupMovePreview).toBeNull();
  });

  it('toggles crop selection on and off', () => {
    const { result } = setup();
    act(() => result.current.toggleCropSelection('crop-a1'));
    expect(result.current.selectedCropIds.has('crop-a1')).toBe(true);
    act(() => result.current.toggleCropSelection('crop-a1'));
    expect(result.current.selectedCropIds.has('crop-a1')).toBe(false);
  });

  it('selects an explicit set of ids and a single crop', () => {
    const { result } = setup();
    act(() => result.current.selectCropIds(new Set(['crop-a1', 'crop-a2'])));
    expect(result.current.selectedCropCount).toBe(2);
    act(() => result.current.selectSingleCrop('crop-a2'));
    expect(Array.from(result.current.selectedCropIds)).toEqual(['crop-a2']);
    act(() => result.current.selectSingleCrop(null));
    expect(result.current.selectedCropCount).toBe(0);
  });

  it('computes a bounding box for the current selection', () => {
    const { result } = setup();
    act(() => result.current.selectSingleCrop('crop-a1'));
    expect(result.current.boundingBox).not.toBeNull();
    expect(result.current.boundingBoxBedId).toBe('bed-a');
  });

  it('handleCropClick single-selects and shift-toggles, honoring isEnabled', () => {
    const { result, rerender } = setup();
    const stopPropagation = vi.fn();
    act(() =>
      result.current.handleCropClick(
        { stopPropagation, shiftKey: false } as unknown as React.MouseEvent,
        'crop-a1'
      )
    );
    expect(Array.from(result.current.selectedCropIds)).toEqual(['crop-a1']);
    act(() =>
      result.current.handleCropClick(
        { stopPropagation, shiftKey: true } as unknown as React.MouseEvent,
        'crop-a2'
      )
    );
    expect(result.current.selectedCropCount).toBe(2);

    rerender({
      isEnabled: false,
      beds: [bedA, bedB],
      cropsByBed: buildCropsByBed(),
      activeBedId: null,
      addCrops: vi.fn(() => []),
      moveCrops: vi.fn(),
      removeCrops: vi.fn(),
      onAnnounceError: vi.fn()
    });
    const before = result.current.selectedCropCount;
    act(() =>
      result.current.handleCropClick(
        { stopPropagation, shiftKey: false } as unknown as React.MouseEvent,
        'crop-a1'
      )
    );
    expect(result.current.selectedCropCount).toBe(before);
  });

  it('ignores pointer interactions while disabled', () => {
    const { result } = setup({ isEnabled: false });
    act(() => result.current.handlePointerDown({ x: 30, y: 30 }));
    expect(result.current.isMarqueeActive).toBe(false);
  });

  it('runs a marquee selection over crops inside the drawn box', () => {
    const { result } = setup();
    act(() => result.current.handlePointerDown({ x: 10, y: 10 }));
    expect(result.current.isMarqueeActive).toBe(true);
    expect(result.current.marqueeBedId).toBe('bed-a');
    act(() => result.current.handlePointerMove({ x: 70, y: 70 }));
    expect(result.current.marqueeBox).not.toBeNull();
    expect(result.current.selectedCropIds.has('crop-a1')).toBe(true);
    expect(result.current.selectedCropIds.has('crop-a2')).toBe(true);
    act(() => result.current.handlePointerUp());
    expect(result.current.isMarqueeActive).toBe(false);
  });

  it('extends a marquee selection additively with shift', () => {
    const { result } = setup();
    act(() => result.current.selectSingleCrop('crop-a2'));
    act(() => result.current.handlePointerDown({ x: 10, y: 10 }, true));
    act(() => result.current.handlePointerMove({ x: 40, y: 40 }, true));
    expect(result.current.selectedCropIds.has('crop-a1')).toBe(true);
    expect(result.current.selectedCropIds.has('crop-a2')).toBe(true);
  });

  it('clears selection when pointer down hits empty space without shift', () => {
    const { result } = setup();
    act(() => result.current.selectSingleCrop('crop-a1'));
    act(() => result.current.handlePointerDown({ x: 1000, y: 1000 }));
    expect(result.current.selectedCropCount).toBe(0);
  });

  it('moves a selected group when dragged to a valid position', () => {
    const { result, moveCrops } = setup();
    act(() => result.current.selectSingleCrop('crop-a1'));
    act(() => result.current.handlePointerDown({ x: 30, y: 30 }));
    act(() => result.current.handlePointerMove({ x: 35, y: 35 }));
    expect(result.current.groupMovePreview).not.toBeNull();
    act(() => result.current.handlePointerUp());
    expect(moveCrops).toHaveBeenCalledTimes(1);
  });

  it('announces an error when a group drag ends out of bounds', () => {
    const { result, moveCrops, onAnnounceError } = setup();
    act(() => result.current.selectSingleCrop('crop-a2'));
    act(() => result.current.handlePointerDown({ x: 60, y: 60 }));
    act(() => result.current.handlePointerMove({ x: 500, y: 500 }));
    act(() => result.current.handlePointerUp());
    expect(moveCrops).not.toHaveBeenCalled();
    expect(onAnnounceError).toHaveBeenCalledTimes(1);
  });

  it('deletes the selected crops and clears the selection', () => {
    const { result, removeCrops } = setup();
    act(() => result.current.deleteSelectedCrops());
    expect(removeCrops).not.toHaveBeenCalled();
    act(() => result.current.selectCropIds(new Set(['crop-a1', 'crop-a2'])));
    act(() => result.current.deleteSelectedCrops());
    expect(removeCrops).toHaveBeenCalledWith(['crop-a1', 'crop-a2']);
    expect(result.current.selectedCropCount).toBe(0);
  });

  it('duplicates the selected crops into the same bed', () => {
    const { result, addCrops } = setup();
    act(() => result.current.duplicateSelectedCrops());
    expect(addCrops).not.toHaveBeenCalled();
    act(() => result.current.selectSingleCrop('crop-a1'));
    act(() => result.current.duplicateSelectedCrops());
    expect(addCrops).toHaveBeenCalledTimes(1);
    expect(result.current.selectedCropIds.has('crop-new')).toBe(true);
  });

  it('clears all transient marquee state', () => {
    const { result } = setup();
    act(() => result.current.handlePointerDown({ x: 10, y: 10 }));
    act(() => result.current.clearSelection());
    expect(result.current.isMarqueeActive).toBe(false);
    expect(result.current.marqueeBox).toBeNull();
    expect(result.current.selectedCropCount).toBe(0);
  });
});
