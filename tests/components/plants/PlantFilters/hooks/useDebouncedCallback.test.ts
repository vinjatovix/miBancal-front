import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDebouncedCallback } from '../../../../../src/components/plants/PlantFilters/hooks/useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('does not call callback immediately', () => {
    const cb = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => {
      result.current.call('a');
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('calls callback after delay', () => {
    const cb = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => {
      result.current.call('a');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(cb).toHaveBeenCalledWith('a');
  });

  it('only calls callback with last value', () => {
    const cb = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => {
      result.current.call('a');
      result.current.call('b');
      result.current.call('c');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('c');
  });

  it('cancels pending callback on cancel()', () => {
    const cb = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => {
      result.current.call('a');
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('clears timeout on unmount', () => {
    const cb = vi.fn();

    const { result, unmount } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => {
      result.current.call('a');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(cb).not.toHaveBeenCalled();
  });
});
