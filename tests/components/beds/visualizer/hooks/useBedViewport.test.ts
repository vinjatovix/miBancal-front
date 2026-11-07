import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useBedViewport } from '../../../../../src/components/beds/visualizer/hooks/useBedViewport';

describe('useBedViewport', () => {
  it('initializes with default scale of 1 and zero pan offset', () => {
    const { result } = renderHook(() => useBedViewport());

    expect(result.current.zoom).toBe(1);
    expect(result.current.panX).toBe(0);
    expect(result.current.panY).toBe(0);
  });

  it('increases zoom level on zoomIn', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoom).toBeGreaterThan(1);
  });

  it('decreases zoom level on zoomOut', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.zoom).toBeLessThan(1);
  });

  it('clamps zoom level to maximum bound of 5.0', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.zoomIn();
      }
    });

    expect(result.current.zoom).toBe(5);
  });

  it('clamps zoom level to minimum bound of 0.25', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.zoomOut();
      }
    });

    expect(result.current.zoom).toBe(0.25);
  });

  it('resets zoom and pan offset on resetZoom', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      result.current.zoomIn();
      result.current.panBy(50, -30);
      result.current.resetZoom();
    });

    expect(result.current.zoom).toBe(1);
    expect(result.current.panX).toBe(0);
    expect(result.current.panY).toBe(0);
  });

  it('updates pan offset when panBy is called', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      result.current.panBy(40, 25);
    });

    expect(result.current.panX).toBe(40);
    expect(result.current.panY).toBe(25);
  });
});
