import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useMediaQuery from '../../../src/shared/hooks/useMediaQuery';

type Listener = (event: MediaQueryListEvent) => void;

function createMatchMedia(initialMatches: boolean) {
  let listeners: Listener[] = [];

  const mediaQueryList = {
    matches: initialMatches,
    media: '',

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

describe('useMediaQuery', () => {
  let mock: ReturnType<typeof createMatchMedia>;

  beforeEach(() => {
    mock = createMatchMedia(false);
    vi.stubGlobal('matchMedia', mock);
  });

  it('should return false initially', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should return true if matches initially', () => {
    mock = createMatchMedia(true);
    vi.stubGlobal('matchMedia', mock);

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('should update when media query changes', () => {
    const mediaQueryList = createMatchMedia(false);
    vi.stubGlobal('matchMedia', mediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      mediaQueryList().__setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
