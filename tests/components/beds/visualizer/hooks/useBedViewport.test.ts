import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

  it('computes zoomPercent as rounded percentage of zoom', () => {
    const { result } = renderHook(() => useBedViewport());

    expect(result.current.zoomPercent).toBe(100);
  });

  it('compensates width change by shifting panX proportionally', () => {
    const { result } = renderHook(() => useBedViewport());

    act(() => {
      result.current.compensateWidthChange(1200, 880);
    });

    expect(result.current.panX).toBe(-160);
  });

  it('animates smoothly to target coordinates with animateTo', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useBedViewport());

      act(() => {
        result.current.animateTo({ zoom: 2, panX: 100, panY: 50 }, 200);
      });

      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(result.current.zoom).toBe(2);
      expect(result.current.panX).toBe(100);
      expect(result.current.panY).toBe(50);
    } finally {
      vi.useRealTimers();
    }
  });

  function createMockSvg(): SVGSVGElement {
    return {
      setPointerCapture: () => {},
      hasPointerCapture: () => true,
      releasePointerCapture: () => {},
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600
      })
    } as unknown as SVGSVGElement;
  }

  function pointer(
    svg: SVGSVGElement,
    pointerId: number,
    clientX: number,
    clientY: number
  ): React.PointerEvent<SVGSVGElement> {
    return {
      pointerId,
      pointerType: 'touch',
      clientX,
      clientY,
      currentTarget: svg
    } as unknown as React.PointerEvent<SVGSVGElement>;
  }

  it('centers pinch zoom on the midpoint of the two pointers', () => {
    const { result } = renderHook(() => useBedViewport());
    const svg = createMockSvg();

    act(() => {
      result.current.onPointerDown(pointer(svg, 1, 500, 300));
      result.current.onPointerDown(pointer(svg, 2, 700, 300));
    });
    act(() => {
      result.current.onPointerMove(pointer(svg, 1, 480, 300));
    });
    act(() => {
      result.current.onPointerMove(pointer(svg, 2, 720, 300));
    });

    expect(result.current.zoom).toBeCloseTo(1.2, 1);
    expect(result.current.panX).toBeLessThan(-10);
  });

  it('pans the plan when two fingers drag without changing the distance', () => {
    const { result } = renderHook(() => useBedViewport());
    const svg = createMockSvg();

    act(() => {
      result.current.onPointerDown(pointer(svg, 1, 300, 300));
      result.current.onPointerDown(pointer(svg, 2, 500, 300));
    });
    act(() => {
      result.current.onPointerMove(pointer(svg, 1, 350, 300));
    });
    act(() => {
      result.current.onPointerMove(pointer(svg, 2, 550, 300));
    });

    expect(result.current.zoom).toBeCloseTo(1, 1);
    expect(result.current.panX).toBeCloseTo(50, 0);
  });

  it('zooms towards cursor position on wheel event', () => {
    const { result } = renderHook(() => useBedViewport());
    const mockSvg = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600
      })
    } as unknown as SVGSVGElement;

    act(() => {
      result.current.onWheel({
        preventDefault: () => {},
        deltaY: -100,
        clientX: 600,
        clientY: 300,
        currentTarget: mockSvg
      } as unknown as React.WheelEvent<SVGSVGElement>);
    });

    expect(result.current.zoom).toBeCloseTo(1.1, 4);
    expect(result.current.panX).toBeCloseTo(-20, 1);
  });
});
