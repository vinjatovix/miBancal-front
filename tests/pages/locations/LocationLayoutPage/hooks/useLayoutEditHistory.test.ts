import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useLayoutEditHistory,
  type EditAction
} from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutEditHistory';

const moveCrop: EditAction = {
  type: 'move-crop',
  cropId: 'crop-1',
  from: { x: 1, y: 1 },
  to: { x: 2, y: 2 }
};

const plant: EditAction = {
  type: 'plant',
  cropIds: ['crop-a', 'crop-b'],
  bedId: 'bed-1'
};

const removeCrop: EditAction = {
  type: 'remove-crop',
  bedId: 'bed-1',
  crops: []
};

const moveBed: EditAction = {
  type: 'move-bed',
  bedId: 'bed-1',
  from: { position: { x: 0, y: 0 }, rotation: 0 },
  to: { position: { x: 10, y: 10 }, rotation: 0 }
};

const placeBed: EditAction = {
  type: 'place-bed',
  bedId: 'bed-2',
  from: { position: null, rotation: 0 }
};

function setup() {
  const onRevert = vi.fn();
  const utils = renderHook(() => useLayoutEditHistory({ onRevert }));
  return { ...utils, onRevert };
}

describe('useLayoutEditHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts empty and cannot undo', () => {
    const { result } = setup();
    expect(result.current.canUndo).toBe(false);
    expect(result.current.entries).toHaveLength(0);
  });

  it('pushes actions of every supported type and enables undo', () => {
    const { result } = setup();
    act(() => result.current.push(moveCrop));
    act(() => result.current.push(plant));
    act(() => result.current.push(removeCrop));
    act(() => result.current.push(moveBed));
    act(() => result.current.push(placeBed));
    expect(result.current.entries).toHaveLength(5);
    expect(result.current.canUndo).toBe(true);
  });

  it('reverts bed actions last-in-first-out', () => {
    const { result, onRevert } = setup();
    act(() => result.current.push(placeBed));
    act(() => result.current.push(moveBed));

    act(() => result.current.undo());
    expect(onRevert).toHaveBeenLastCalledWith(moveBed);

    act(() => result.current.undo());
    expect(onRevert).toHaveBeenLastCalledWith(placeBed);
    expect(result.current.canUndo).toBe(false);
  });

  it('undoes actions in last-in-first-out order, reverting each one', () => {
    const { result, onRevert } = setup();
    act(() => result.current.push(plant));
    act(() => result.current.push(moveCrop));

    act(() => result.current.undo());
    expect(onRevert).toHaveBeenLastCalledWith(moveCrop);
    expect(result.current.entries).toHaveLength(1);

    act(() => result.current.undo());
    expect(onRevert).toHaveBeenLastCalledWith(plant);
    expect(result.current.entries).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
  });

  it('does nothing when undo is called on an empty stack', () => {
    const { result, onRevert } = setup();
    act(() => result.current.undo());
    expect(onRevert).not.toHaveBeenCalled();
    expect(result.current.canUndo).toBe(false);
  });

  it('clears the stack without reverting when saved', () => {
    const { result, onRevert } = setup();
    act(() => result.current.push(plant));
    act(() => result.current.push(moveCrop));
    act(() => result.current.clear());
    expect(result.current.entries).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(onRevert).not.toHaveBeenCalled();
  });

  it('resets the stack without reverting when discarded', () => {
    const { result, onRevert } = setup();
    act(() => result.current.push(removeCrop));
    act(() => result.current.reset());
    expect(result.current.entries).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(onRevert).not.toHaveBeenCalled();
  });
});
