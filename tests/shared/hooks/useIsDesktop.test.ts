import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsDesktop } from '../../../src/shared/hooks/useIsDesktop';

type Listener = (event: MediaQueryListEvent) => void;

function createMatchMedia(initialMatches: boolean) {
  let listeners: Listener[] = [];

  const mediaQueryList = {
    matches: initialMatches,
    media: '(pointer: fine)',

    addEventListener: (_: string, cb: Listener) => {
      listeners.push(cb);
    },

    removeEventListener: (_: string, cb: Listener) => {
      listeners = listeners.filter((l) => l !== cb);
    },

    __setMatches(value: boolean) {
      mediaQueryList.matches = value;

      const event = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(event, 'matches', {
        value
      });

      listeners.forEach((cb) => cb(event));
    }
  };

  return vi.fn(() => mediaQueryList);
}

describe('useIsDesktop', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when media query matches fine pointer initially', () => {
    const mock = createMatchMedia(true);
    vi.stubGlobal('matchMedia', mock);

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match fine pointer initially', () => {
    const mock = createMatchMedia(false);
    vi.stubGlobal('matchMedia', mock);

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(false);
  });

  it('updates state when pointer capability changes', () => {
    const mock = createMatchMedia(true);
    vi.stubGlobal('matchMedia', mock);
    const { result } = renderHook(() => useIsDesktop());

    act(() => {
      mock().__setMatches(false);
    });

    expect(result.current).toBe(false);
  });
});
