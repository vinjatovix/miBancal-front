import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutFullscreen } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutFullscreen';

function setFullscreenElement(value: Element | null): void {
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    value
  });
}

function buildTarget(): { readonly current: HTMLElement } {
  const element = document.createElement('div');
  element.requestFullscreen = vi.fn().mockResolvedValue(undefined);
  return { current: element };
}

describe('useLayoutFullscreen', () => {
  beforeEach(() => {
    document.documentElement.requestFullscreen = vi
      .fn()
      .mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    setFullscreenElement(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setFullscreenElement(null);
  });

  it('starts out of fullscreen and reports native support', () => {
    const { result } = renderHook(() => useLayoutFullscreen(buildTarget()));

    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.supportsNativeFullscreen).toBe(true);
  });

  it('enters fullscreen and requests the native API on the target', () => {
    const target = buildTarget();
    const { result } = renderHook(() => useLayoutFullscreen(target));

    act(() => result.current.toggleFullscreen());

    expect(result.current.isFullscreen).toBe(true);
    expect(target.current.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('exits fullscreen and calls the native exit API', () => {
    const target = buildTarget();
    const { result } = renderHook(() => useLayoutFullscreen(target));

    act(() => result.current.enterFullscreen());
    setFullscreenElement(target.current);
    act(() => result.current.exitFullscreen());

    expect(result.current.isFullscreen).toBe(false);
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it('restores standard navigation when Escape is pressed', () => {
    const { result } = renderHook(() => useLayoutFullscreen(buildTarget()));

    act(() => result.current.enterFullscreen());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it('reports no native support when requestFullscreen is unavailable', () => {
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: undefined
    });

    const { result } = renderHook(() => useLayoutFullscreen(buildTarget()));

    expect(result.current.supportsNativeFullscreen).toBe(false);
  });
});
