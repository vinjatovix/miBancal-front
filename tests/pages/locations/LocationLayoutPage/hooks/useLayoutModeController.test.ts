import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import { useLayoutModeController } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutModeController';

const MOCK_BEDS: readonly ResolvedBed[] = [
  {
    id: 'bed-1',
    name: 'Bancal A',
    width: 200,
    height: 100,
    position: { x: 50, y: 50 },
    rotation: 0
  }
];

const MOCK_VIEWBOX = '0 0 1000 1000';

describe('useLayoutModeController', () => {
  it('initializes in read mode by default', () => {
    const animateTo = vi.fn();
    const { result } = renderHook(() =>
      useLayoutModeController({
        viewport: { animateTo },
        beds: MOCK_BEDS,
        viewBox: MOCK_VIEWBOX
      })
    );

    expect(result.current.mode).toBe('read');
    expect(animateTo).not.toHaveBeenCalled();
  });

  it('updates mode on setMode without triggering viewport animation', () => {
    const animateTo = vi.fn();
    const { result } = renderHook(() =>
      useLayoutModeController({
        viewport: { animateTo },
        beds: MOCK_BEDS,
        viewBox: MOCK_VIEWBOX
      })
    );

    act(() => {
      result.current.setMode('position');
    });

    expect(result.current.mode).toBe('position');
    expect(animateTo).not.toHaveBeenCalled();
  });

  it('transitions to plants mode and animates viewport to target bed when enterPlanting is called', () => {
    const animateTo = vi.fn();
    const { result } = renderHook(() =>
      useLayoutModeController({
        viewport: { animateTo },
        beds: MOCK_BEDS,
        viewBox: MOCK_VIEWBOX
      })
    );

    act(() => {
      result.current.enterPlanting('bed-1');
    });

    expect(result.current.mode).toBe('plants');
    expect(animateTo).toHaveBeenCalledTimes(1);
    expect(animateTo).toHaveBeenCalledWith({
      zoom: 4,
      panX: 1400,
      panY: 1600
    });
  });

  it('transitions to plants mode without animating viewport if bedId is null', () => {
    const animateTo = vi.fn();
    const { result } = renderHook(() =>
      useLayoutModeController({
        viewport: { animateTo },
        beds: MOCK_BEDS,
        viewBox: MOCK_VIEWBOX
      })
    );

    act(() => {
      result.current.enterPlanting(null);
    });

    expect(result.current.mode).toBe('plants');
    expect(animateTo).not.toHaveBeenCalled();
  });
});
