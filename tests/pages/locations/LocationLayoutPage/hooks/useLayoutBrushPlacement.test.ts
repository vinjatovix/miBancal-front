import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutBrushPlacement } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutBrushPlacement';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../../src/types/PlantInstance/plantPlacementTypes';
import { buildPlantListItem } from '../../../../fixtures/plants/buildPlantListItem';
import { buildCropPlacementItem } from '../../../../fixtures/plantInstances/buildPlantInstance';

const bed: ResolvedBed = {
  id: 'bed-a',
  name: 'Bancal A',
  width: 100,
  height: 100,
  position: { x: 0, y: 0 },
  rotation: 0
};

const plant = buildPlantListItem({
  id: 'plant-1',
  traits: { ...buildPlantListItem().traits, spacingCm: { min: 20, max: 40 } }
});

type Params = Parameters<typeof useLayoutBrushPlacement>[0];

function setup(overrides: Partial<Params> = {}) {
  const onAnnounceSuccess = vi.fn();
  const onAnnounceWarning = vi.fn();
  const onAnnounceError = vi.fn();
  const addCrops = vi.fn();
  const params: Params = {
    isEnabled: true,
    beds: [bed],
    cropsByBed: new Map<string, readonly CropPlacementItem[]>(),
    activePlant: plant,
    activeBedId: null,
    onAnnounceSuccess,
    onAnnounceWarning,
    onAnnounceError,
    addCrops,
    ...overrides
  };
  const utils = renderHook((props: Params) => useLayoutBrushPlacement(props), {
    initialProps: params
  });
  return {
    ...utils,
    onAnnounceSuccess,
    onAnnounceWarning,
    onAnnounceError,
    addCrops
  };
}

function drawStroke(result: {
  current: ReturnType<typeof useLayoutBrushPlacement>;
}) {
  act(() => result.current.handlePointerDown({ x: 10, y: 50 }));
  act(() => result.current.handlePointerMove({ x: 90, y: 50 }));
}

describe('useLayoutBrushPlacement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts idle with a default pattern', () => {
    const { result } = setup();
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.brushPattern).toBe('single-row');
    expect(result.current.directrix).toBeNull();
    expect(result.current.candidates).toEqual([]);
  });

  it('ignores a pointer down while disabled', () => {
    const { result } = setup({ isEnabled: false });
    act(() => result.current.handlePointerDown({ x: 10, y: 50 }));
    expect(result.current.isDrawing).toBe(false);
  });

  it('ignores a pointer down outside any bed', () => {
    const { result } = setup();
    act(() => result.current.handlePointerDown({ x: 500, y: 500 }));
    expect(result.current.isDrawing).toBe(false);
  });

  it('ignores a pointer down on a non-active bed', () => {
    const { result } = setup({ activeBedId: 'other-bed' });
    act(() => result.current.handlePointerDown({ x: 10, y: 50 }));
    expect(result.current.isDrawing).toBe(false);
  });

  it('announces an error when brushing without an active plant', () => {
    const { result, onAnnounceError } = setup({ activePlant: null });
    act(() => result.current.handlePointerDown({ x: 10, y: 50 }));
    expect(onAnnounceError).toHaveBeenCalledTimes(1);
    expect(result.current.isDrawing).toBe(false);
  });

  it('draws a stroke and computes candidates', () => {
    const { result } = setup();
    drawStroke(result);
    expect(result.current.isDrawing).toBe(true);
    expect(result.current.strokeBedId).toBe('bed-a');
    expect(result.current.directrix).not.toBeNull();
    expect(result.current.candidates.length).toBeGreaterThan(0);
  });

  it('computes a single position when pattern is individual', () => {
    const { result } = setup();
    act(() => result.current.setBrushPattern('individual'));
    drawStroke(result);
    expect(result.current.candidates.length).toBe(1);
  });

  it('ignores pointer moves when not drawing', () => {
    const { result } = setup();
    act(() => result.current.handlePointerMove({ x: 90, y: 50 }));
    expect(result.current.directrix).toBeNull();
  });

  it('plants all candidates and announces success on pointer up', () => {
    const { result, addCrops, onAnnounceSuccess } = setup();
    drawStroke(result);
    act(() => result.current.handlePointerUp());
    expect(addCrops).toHaveBeenCalledTimes(1);
    expect(onAnnounceSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isDrawing).toBe(false);
  });

  it('warns with a summary when some candidates are omitted', () => {
    const existing = buildCropPlacementItem({
      id: 'existing',
      bedId: 'bed-a',
      position: { x: 31, y: 50 },
      vitalRadius: 10
    });
    const { result, addCrops, onAnnounceWarning } = setup({
      cropsByBed: new Map([['bed-a', [existing]]])
    });
    drawStroke(result);
    act(() => result.current.handlePointerUp());
    expect(addCrops).toHaveBeenCalledTimes(1);
    expect(onAnnounceWarning).toHaveBeenCalledTimes(1);
  });

  it('cancels a stroke on pointer up when there is nothing drawn', () => {
    const { result, addCrops } = setup();
    act(() => result.current.handlePointerUp());
    expect(addCrops).not.toHaveBeenCalled();
    expect(result.current.isDrawing).toBe(false);
  });

  it('switches the brush pattern and still generates candidates', () => {
    const { result } = setup();
    act(() => result.current.setBrushPattern('double-row'));
    drawStroke(result);
    expect(result.current.candidates.length).toBeGreaterThan(0);
    act(() => result.current.setBrushPattern('staggered-triangle'));
    expect(result.current.candidates.length).toBeGreaterThan(0);
  });

  it('cancels the stroke when Escape is pressed', () => {
    const { result } = setup();
    drawStroke(result);
    expect(result.current.isDrawing).toBe(true);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.isDrawing).toBe(false);
  });

  it('cancels the stroke explicitly', () => {
    const { result } = setup();
    drawStroke(result);
    act(() => result.current.cancelStroke());
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.strokeBedId).toBeNull();
  });
});
