import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNavRailState } from '../../../src/components/layout/useNavRailState';

describe('useNavRailState', () => {
  const STORAGE_KEY = 'agro_nav_rail_expanded';

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('initial state resolution without stored preference', () => {
    it.each([
      [1200, true],
      [1440, true],
      [1199, false],
      [768, false]
    ] as const)(
      'resolves isExpanded=%s when window.innerWidth is %s and no preference is stored',
      (width, expectedExpanded) => {
        vi.stubGlobal('innerWidth', width);

        const { result } = renderHook(() => useNavRailState());

        expect(result.current.isExpanded).toBe(expectedExpanded);
      }
    );
  });

  describe('initial state resolution with stored preference', () => {
    it.each([
      ['true', 800, true],
      ['false', 1440, false]
    ] as const)(
      'resolves isExpanded=%s from storage=%s regardless of window width=%s',
      (storedValue, width, expectedExpanded) => {
        window.localStorage.setItem(STORAGE_KEY, storedValue);
        vi.stubGlobal('innerWidth', width);

        const { result } = renderHook(() => useNavRailState());

        expect(result.current.isExpanded).toBe(expectedExpanded);
      }
    );
  });

  describe('toggleRail', () => {
    it('collapses expanded rail and persists false to localStorage', () => {
      vi.stubGlobal('innerWidth', 1200);
      const { result } = renderHook(() => useNavRailState());

      act(() => {
        result.current.toggleRail();
      });

      expect(result.current.isExpanded).toBe(false);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false');
    });

    it('expands collapsed rail and persists true to localStorage', () => {
      window.localStorage.setItem(STORAGE_KEY, 'false');
      vi.stubGlobal('innerWidth', 1200);
      const { result } = renderHook(() => useNavRailState());

      act(() => {
        result.current.toggleRail();
      });

      expect(result.current.isExpanded).toBe(true);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');
    });
  });

  describe('graceful degradation on storage failures', () => {
    it('falls back to window width when localStorage.getItem throws', () => {
      vi.stubGlobal('innerWidth', 1400);
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: localStorage is disabled');
      });

      const { result } = renderHook(() => useNavRailState());

      expect(result.current.isExpanded).toBe(true);
    });

    it('toggles state in memory without throwing when localStorage.setItem throws', () => {
      vi.stubGlobal('innerWidth', 1400);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useNavRailState());

      act(() => {
        result.current.toggleRail();
      });

      expect(result.current.isExpanded).toBe(false);
    });
  });
});
