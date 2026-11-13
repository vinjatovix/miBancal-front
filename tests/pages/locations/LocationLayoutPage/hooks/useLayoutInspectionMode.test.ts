import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useLayoutInspectionMode } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutInspectionMode';

function mockPointer(fine: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(pointer: fine)' ? fine : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}

describe('useLayoutInspectionMode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('on mobile (coarse pointer)', () => {
    it('opens in inspection with editing disabled', () => {
      mockPointer(false);
      const { result } = renderHook(() => useLayoutInspectionMode());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.editingEnabled).toBe(false);
    });

    it('blocks editing actions until editing is explicitly enabled', () => {
      mockPointer(false);
      const { result } = renderHook(() => useLayoutInspectionMode());
      const action = vi.fn();

      expect(result.current.guardEditAction(action)).toBeUndefined();

      act(() => {
        result.current.enableEditing();
      });

      const guarded = result.current.guardEditAction(action);
      expect(guarded).toBeDefined();
      guarded?.();
      expect(action).toHaveBeenCalledTimes(1);
      expect(result.current.editingEnabled).toBe(true);
    });

    it('returns to inspection when editing is disabled again', () => {
      mockPointer(false);
      const { result } = renderHook(() => useLayoutInspectionMode());

      act(() => {
        result.current.enableEditing();
      });
      act(() => {
        result.current.disableEditing();
      });

      expect(result.current.editingEnabled).toBe(false);
      expect(result.current.guardEditAction(vi.fn())).toBeUndefined();
    });
  });

  describe('on desktop (fine pointer)', () => {
    it('keeps editing enabled with no regression', () => {
      mockPointer(true);
      const { result } = renderHook(() => useLayoutInspectionMode());
      const action = vi.fn();

      expect(result.current.isMobile).toBe(false);
      expect(result.current.editingEnabled).toBe(true);
      expect(result.current.guardEditAction(action)).toBe(action);
    });
  });
});
