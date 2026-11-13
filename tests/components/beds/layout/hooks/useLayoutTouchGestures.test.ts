import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutTouchGestures } from '../../../../../src/components/beds/layout/hooks/useLayoutTouchGestures';
import type {
  LayoutTouchPointer,
  UseLayoutTouchGesturesParams
} from '../../../../../src/components/beds/layout/hooks/useLayoutTouchGestures';

function touchPointer(
  overrides: Partial<LayoutTouchPointer> = {}
): LayoutTouchPointer {
  return {
    pointerId: 1,
    pointerType: 'touch',
    clientX: 0,
    clientY: 0,
    ...overrides
  };
}

const LONG_PRESS_MS = 300;

function setup(params: Partial<UseLayoutTouchGesturesParams> = {}) {
  const callbacks = {
    onTap: vi.fn(),
    onPanStart: vi.fn(),
    onPanMove: vi.fn(),
    onPanEnd: vi.fn(),
    onDragStart: vi.fn(),
    onDragMove: vi.fn(),
    onDragEnd: vi.fn(),
    onDragCancel: vi.fn(),
    onNavigateStart: vi.fn(),
    onNavigateEnd: vi.fn()
  };
  const view = renderHook(() =>
    useLayoutTouchGestures({
      longPressMs: LONG_PRESS_MS,
      getTargetId: () => 'crop-a',
      canDragTarget: () => true,
      ...callbacks,
      ...params
    })
  );
  return { ...callbacks, view };
}

describe('useLayoutTouchGestures', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts idle and moves to pending on a single pointer down', () => {
    const { view } = setup();
    expect(view.result.current.phase).toBe('idle');

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });

    expect(view.result.current.phase).toBe('pending');
  });

  it('selects on a tap below the movement threshold', () => {
    const { view, onTap, onDragStart } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      view.result.current.onPointerUp(
        touchPointer({ clientX: 11, clientY: 11 })
      );
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledWith({ x: 10, y: 10 }, 'crop-a');
    expect(onDragStart).not.toHaveBeenCalled();
    expect(view.result.current.phase).toBe('idle');
  });

  it('pans when a single pointer drags over empty space before long-press', () => {
    const { view, onPanStart, onDragStart } = setup({
      getTargetId: () => null,
      canDragTarget: () => false
    });

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ clientX: 40, clientY: 10 })
      );
    });

    expect(view.result.current.phase).toBe('panning');
    expect(onPanStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('drags only after a long-press on a selected element, then exceeding the threshold', () => {
    const { view, onDragStart, onDragMove } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });

    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(view.result.current.phase).toBe('pressing');

    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ clientX: 40, clientY: 10 })
      );
    });

    expect(view.result.current.phase).toBe('dragging');
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragMove).toHaveBeenCalled();
  });

  it('a short touch over an element never starts a drag', () => {
    const { view, onDragStart, onPanStart } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ clientX: 30, clientY: 10 })
      );
    });

    expect(onDragStart).not.toHaveBeenCalled();
    expect(onPanStart).toHaveBeenCalledTimes(1);
  });

  it('cancels and reverts the drag when a second pointer lands, switching to navigation', () => {
    const { view, onDragCancel, onNavigateStart } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ clientX: 40, clientY: 10 })
      );
    });
    expect(view.result.current.phase).toBe('dragging');

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ pointerId: 2, clientX: 80, clientY: 80 })
      );
    });

    expect(onDragCancel).toHaveBeenCalledTimes(1);
    expect(onNavigateStart).toHaveBeenCalledTimes(1);
    expect(view.result.current.phase).toBe('navigating');
  });

  it('never persists a displacement after a drag is cancelled', () => {
    const { view, onDragMove, onDragEnd, onNavigateEnd } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ clientX: 40, clientY: 10 })
      );
    });
    onDragMove.mockClear();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ pointerId: 2, clientX: 80, clientY: 80 })
      );
    });
    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ pointerId: 2, clientX: 120, clientY: 120 })
      );
    });

    expect(onDragMove).not.toHaveBeenCalled();

    act(() => {
      view.result.current.onPointerUp(
        touchPointer({ pointerId: 2, clientX: 120, clientY: 120 })
      );
    });
    act(() => {
      view.result.current.onPointerUp(touchPointer({ clientX: 40, clientY: 10 }));
    });

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(onNavigateEnd).toHaveBeenCalledTimes(1);
    expect(view.result.current.phase).toBe('idle');
  });

  it('returns to idle only once every pointer is lifted after navigation', () => {
    const { view, onNavigateEnd } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ pointerId: 2, clientX: 80, clientY: 80 })
      );
    });
    expect(view.result.current.phase).toBe('navigating');

    act(() => {
      view.result.current.onPointerUp(
        touchPointer({ pointerId: 2, clientX: 80, clientY: 80 })
      );
    });
    expect(view.result.current.phase).toBe('navigating');

    act(() => {
      view.result.current.onPointerUp(
        touchPointer({ clientX: 10, clientY: 10 })
      );
    });
    expect(view.result.current.phase).toBe('idle');
    expect(onNavigateEnd).toHaveBeenCalledTimes(1);
  });

  it('drags directly with a mouse pointer without requiring a long-press', () => {
    const { view, onDragStart } = setup();

    act(() => {
      view.result.current.onPointerDown(
        touchPointer({ pointerType: 'mouse', clientX: 10, clientY: 10 })
      );
    });
    act(() => {
      view.result.current.onPointerMove(
        touchPointer({ pointerType: 'mouse', clientX: 18, clientY: 10 })
      );
    });

    expect(view.result.current.phase).toBe('dragging');
    expect(onDragStart).toHaveBeenCalledTimes(1);
  });
});
