import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';
import type {
  ResolvedTheme,
  ThemePreference
} from '../../../src/shared/theme/types';
import { useTheme } from '../../../src/shared/theme/useTheme';

function createWrapper(initialPreference?: ThemePreference) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider initialPreference={initialPreference}>
        {children}
      </ThemeProvider>
    );
  };
}

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('throws descriptive error when invoked outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });

  it('provides default preference of light when no initial preference is provided', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper()
    });

    expect(result.current.preference).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it.each([
    ['light' as ThemePreference, 'dark' as ThemePreference],
    ['dark' as ThemePreference, 'light' as ThemePreference]
  ])(
    'toggles preference from %s to %s on cycleTheme',
    (initialPref, expectedNext) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(initialPref)
      });

      act(() => {
        result.current.cycleTheme();
      });

      expect(result.current.preference).toBe(expectedNext);
      expect(result.current.resolvedTheme).toBe(expectedNext);
    }
  );

  it.each([
    ['light' as ThemePreference, 'dark' as ThemePreference],
    ['dark' as ThemePreference, 'light' as ThemePreference]
  ])(
    'toggles preference from %s to %s on toggleTheme',
    (initialPref, expectedNext) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(initialPref)
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.preference).toBe(expectedNext);
      expect(result.current.resolvedTheme).toBe(expectedNext);
    }
  );

  it.each([
    ['light' as ThemePreference, 'light' as ResolvedTheme],
    ['dark' as ThemePreference, 'dark' as ResolvedTheme]
  ])(
    'updates preference and resolved theme to %s on setThemePreference',
    (pref, expectedResolved) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.setThemePreference(pref);
      });

      expect(result.current.preference).toBe(pref);
      expect(result.current.resolvedTheme).toBe(expectedResolved);
    }
  );

  it('initializes preference from localStorage when available', () => {
    window.localStorage.setItem('agro_theme', 'dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper()
    });

    expect(result.current.preference).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('persists preference to localStorage when cycleTheme is called', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('light')
    });

    act(() => {
      result.current.cycleTheme();
    });

    expect(window.localStorage.getItem('agro_theme')).toBe('dark');
  });

  it('synchronizes preference when storage event is dispatched with agro_theme key', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('light')
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'agro_theme',
          newValue: 'dark',
          oldValue: 'light'
        })
      );
    });

    expect(result.current.preference).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('ignores storage event with different key', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('light')
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'other_key',
          newValue: 'dark'
        })
      );
    });

    expect(result.current.preference).toBe('light');
  });
});
