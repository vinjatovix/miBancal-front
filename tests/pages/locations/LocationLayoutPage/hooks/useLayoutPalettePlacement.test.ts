import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  toPlacingPlant,
  useLayoutPalettePlacement
} from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPalettePlacement';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import { buildPlantListItem } from '../../../../fixtures/plants/buildPlantListItem';

const bed: ResolvedBed = {
  id: 'bed-a',
  name: 'Bancal A',
  width: 100,
  height: 100,
  position: { x: 0, y: 0 },
  rotation: 0
};

const plant = buildPlantListItem({ id: 'plant-1' });

function setup(
  evaluation: { hasCollision: boolean; isOutOfBounds: boolean } = {
    hasCollision: false,
    isOutOfBounds: false
  }
) {
  const evaluateStored = vi.fn(() => evaluation);
  const addCrop = vi.fn();
  const onAnnounceError = vi.fn();
  const onClearSelection = vi.fn();
  const utils = renderHook(() =>
    useLayoutPalettePlacement({
      beds: [bed],
      evaluateStored,
      addCrop,
      onAnnounceError,
      onClearSelection
    })
  );
  return {
    ...utils,
    evaluateStored,
    addCrop,
    onAnnounceError,
    onClearSelection
  };
}

describe('toPlacingPlant', () => {
  it('maps a plant list item to a placing plant', () => {
    const placing = toPlacingPlant(plant);
    expect(placing.plantId).toBe('plant-1');
    expect(placing.commonName).toBe(plant.identity.name.primary);
    expect(placing.vitalRadius).toBeGreaterThan(0);
  });
});

describe('useLayoutPalettePlacement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects and toggles the active palette plant', () => {
    const { result, onClearSelection } = setup();
    act(() => result.current.selectPalettePlant(plant));
    expect(result.current.activePlantId).toBe('plant-1');
    expect(result.current.activePlantName).toBe(plant.identity.name.primary);
    expect(onClearSelection).toHaveBeenCalled();
    act(() => result.current.selectPalettePlant(plant));
    expect(result.current.activePlantId).toBeNull();
  });

  it('cancels the active palette plant', () => {
    const { result } = setup();
    act(() => result.current.selectPalettePlant(plant));
    act(() => result.current.cancelPalettePlant());
    expect(result.current.activePlantId).toBeNull();
  });

  it('tap-places the active plant on a bed', () => {
    const { result, addCrop } = setup();
    act(() => result.current.selectPalettePlant(plant));
    act(() => result.current.tapPlace({ x: 50, y: 50 }));
    expect(addCrop).toHaveBeenCalledWith(
      expect.objectContaining({ bedId: 'bed-a', plantId: 'plant-1' })
    );
  });

  it('clears the selection when tap-placing without an active plant', () => {
    const { result, addCrop, onClearSelection } = setup();
    act(() => result.current.tapPlace({ x: 50, y: 50 }));
    expect(addCrop).not.toHaveBeenCalled();
    expect(onClearSelection).toHaveBeenCalled();
  });

  it('does not place outside any bed', () => {
    const { result, addCrop } = setup();
    act(() => result.current.selectPalettePlant(plant));
    act(() => result.current.tapPlace({ x: 500, y: 500 }));
    expect(addCrop).not.toHaveBeenCalled();
  });

  it('announces out-of-bounds and collision placements', () => {
    const outside = setup({ hasCollision: false, isOutOfBounds: true });
    act(() => outside.result.current.selectPalettePlant(plant));
    act(() => outside.result.current.tapPlace({ x: 50, y: 50 }));
    expect(outside.addCrop).not.toHaveBeenCalled();
    expect(outside.onAnnounceError).toHaveBeenCalledTimes(1);

    const colliding = setup({ hasCollision: true, isOutOfBounds: false });
    act(() => colliding.result.current.selectPalettePlant(plant));
    act(() => colliding.result.current.tapPlace({ x: 50, y: 50 }));
    expect(colliding.addCrop).not.toHaveBeenCalled();
    expect(colliding.onAnnounceError).toHaveBeenCalledTimes(1);
  });

  it('drops a dragged plant and updates the drop preview', () => {
    const { result, addCrop } = setup();
    act(() => result.current.dragPalettePlant(plant));
    act(() => result.current.updateDropPreview({ x: 50, y: 50 }));
    expect(result.current.preview).toMatchObject({ bedId: 'bed-a' });
    act(() => result.current.updateDropPreview({ x: 500, y: 500 }));
    expect(result.current.preview).toBeNull();
    act(() => result.current.dropPlant({ x: 50, y: 50 }, 'plant-1'));
    expect(addCrop).toHaveBeenCalled();
  });

  it('ignores drop preview updates without a dragging plant', () => {
    const { result } = setup();
    act(() => result.current.updateDropPreview({ x: 50, y: 50 }));
    expect(result.current.preview).toBeNull();
  });

  it('ignores dropping an unknown plant id', () => {
    const { result, addCrop } = setup();
    act(() => result.current.dropPlant({ x: 50, y: 50 }, 'unknown'));
    expect(addCrop).not.toHaveBeenCalled();
  });

  it('clears the preview and resets the palette', () => {
    const { result } = setup();
    act(() => result.current.dragPalettePlant(plant));
    act(() => result.current.updateDropPreview({ x: 50, y: 50 }));
    act(() => result.current.clearPreview());
    expect(result.current.preview).toBeNull();
    act(() => result.current.selectPalettePlant(plant));
    act(() => result.current.resetPalette());
    expect(result.current.activePlantId).toBeNull();
    expect(result.current.preview).toBeNull();
  });
});
