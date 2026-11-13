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
    expect(result.current.entries).toHaveLength(3);
    expect(result.current.canUndo).toBe(true);
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
