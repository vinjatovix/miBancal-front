import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutSingleCropDrag } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutSingleCropDrag';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

const bed: ResolvedBed = {
  id: 'bed-a',
  name: 'Bancal A',
  width: 100,
  height: 100,
  position: { x: 0, y: 0 },
  rotation: 0
};

const crop = buildCropPlacementItem({
  id: 'crop-a1',
  bedId: 'bed-a',
  position: { x: 50, y: 50 },
  vitalRadius: 10
});

function setup(
  evaluation: { hasCollision: boolean; isOutOfBounds: boolean } = {
    hasCollision: false,
    isOutOfBounds: false
  }
) {
  const evaluateStored = vi.fn(() => evaluation);
  const moveCrop = vi.fn();
  const setPreview = vi.fn();
  const onSelectSingleCrop = vi.fn();
  const onAnnounceError = vi.fn();
  const utils = renderHook(() =>
    useLayoutSingleCropDrag({
      bedsById: new Map([['bed-a', bed]]),
      cropsByBed: new Map([['bed-a', [crop]]]),
      evaluateStored,
      moveCrop,
      setPreview,
      onSelectSingleCrop,
      onAnnounceError
    })
  );
  return {
    ...utils,
    evaluateStored,
    moveCrop,
    setPreview,
    onSelectSingleCrop,
    onAnnounceError
  };
}

describe('useLayoutSingleCropDrag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('begins a drag, selects the crop, and tracks the dragging id', () => {
    const { result, onSelectSingleCrop } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    expect(result.current.draggingCropId).toBe('crop-a1');
    expect(onSelectSingleCrop).toHaveBeenCalledWith('crop-a1');
  });

  it('updates the preview while moving a dragged crop', () => {
    const { result, setPreview } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.moveCropDrag({ x: 60, y: 60 }));
    expect(setPreview).toHaveBeenCalledWith(
      expect.objectContaining({ bedId: 'bed-a', commonName: crop.commonName })
    );
  });

  it('does nothing on move when no drag is active', () => {
    const { result, setPreview } = setup();
    act(() => result.current.moveCropDrag({ x: 60, y: 60 }));
    expect(setPreview).not.toHaveBeenCalled();
  });

  it('ignores moves for an unknown bed or crop', () => {
    const { result, setPreview } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'missing-bed'));
    act(() => result.current.moveCropDrag({ x: 60, y: 60 }));
    act(() => result.current.beginCropDrag('missing-crop', 'bed-a'));
    act(() => result.current.moveCropDrag({ x: 60, y: 60 }));
    expect(setPreview).not.toHaveBeenCalled();
  });

  it('commits a valid drop by moving the crop', () => {
    const { result, moveCrop, setPreview } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.endCropDrag({ x: 70, y: 70 }));
    expect(moveCrop).toHaveBeenCalledWith('crop-a1', { x: 70, y: 70 });
    expect(setPreview).toHaveBeenLastCalledWith(null);
    expect(result.current.draggingCropId).toBeNull();
  });

  it('does not move when dropped at the same position', () => {
    const { result, moveCrop } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.endCropDrag({ x: 50, y: 50 }));
    expect(moveCrop).not.toHaveBeenCalled();
  });

  it('does not move when dropped outside the bed', () => {
    const { result, moveCrop } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.endCropDrag({ x: 500, y: 500 }));
    expect(moveCrop).not.toHaveBeenCalled();
  });

  it('announces an out-of-bounds drop and skips the move', () => {
    const { result, moveCrop, onAnnounceError } = setup({
      hasCollision: false,
      isOutOfBounds: true
    });
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.endCropDrag({ x: 70, y: 70 }));
    expect(moveCrop).not.toHaveBeenCalled();
    expect(onAnnounceError).toHaveBeenCalledTimes(1);
  });

  it('announces a collision drop and skips the move', () => {
    const { result, moveCrop, onAnnounceError } = setup({
      hasCollision: true,
      isOutOfBounds: false
    });
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.endCropDrag({ x: 70, y: 70 }));
    expect(moveCrop).not.toHaveBeenCalled();
    expect(onAnnounceError).toHaveBeenCalledTimes(1);
  });

  it('ignores a drop with no drag or no pointer', () => {
    const { result, moveCrop } = setup();
    act(() => result.current.endCropDrag(null));
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.endCropDrag(null));
    expect(moveCrop).not.toHaveBeenCalled();
  });

  it('resets the drag state', () => {
    const { result } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a'));
    act(() => result.current.resetCropDrag());
    expect(result.current.draggingCropId).toBeNull();
  });
});

describe('useLayoutSingleCropDrag long-press to drag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('selects on a short touch without ever moving the crop', () => {
    const { result, moveCrop, onSelectSingleCrop, setPreview } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a', 'touch'));
    expect(onSelectSingleCrop).toHaveBeenCalledWith('crop-a1');
    expect(result.current.draggingCropId).toBeNull();

    act(() => result.current.moveCropDrag({ x: 70, y: 70 }));
    expect(setPreview).not.toHaveBeenCalled();

    act(() => result.current.endCropDrag({ x: 70, y: 70 }));
    expect(moveCrop).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(result.current.draggingCropId).toBeNull();
    expect(moveCrop).not.toHaveBeenCalled();
  });

  it('moves a crop on touch only after the long-press has elapsed', () => {
    const { result, moveCrop, setPreview } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a', 'touch'));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.draggingCropId).toBe('crop-a1');

    act(() => result.current.moveCropDrag({ x: 70, y: 70 }));
    expect(setPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ bedId: 'bed-a', commonName: crop.commonName })
    );

    act(() => result.current.endCropDrag({ x: 70, y: 70 }));
    expect(moveCrop).toHaveBeenCalledWith('crop-a1', { x: 70, y: 70 });
  });

  it('drags directly with a mouse pointer without waiting for a long-press', () => {
    const { result, moveCrop, setPreview } = setup();
    act(() => result.current.beginCropDrag('crop-a1', 'bed-a', 'mouse'));
    expect(result.current.draggingCropId).toBe('crop-a1');

    act(() => result.current.moveCropDrag({ x: 70, y: 70 }));
    expect(setPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ bedId: 'bed-a', commonName: crop.commonName })
    );

    act(() => result.current.endCropDrag({ x: 70, y: 70 }));
    expect(moveCrop).toHaveBeenCalledWith('crop-a1', { x: 70, y: 70 });
  });
});
