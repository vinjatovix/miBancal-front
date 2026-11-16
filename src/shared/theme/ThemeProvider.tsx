import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { ThemeContext } from './ThemeContext';
import { setDomTheme } from './themeDom';
import {
  getStoredThemePreference,
  setStoredThemePreference,
  THEME_STORAGE_KEY
} from './themeStorage';
import type {
  ResolvedTheme,
  ThemeContextValue,
  ThemePreference
} from './types';

function getNextThemePreference(current: ThemePreference): ThemePreference {
  return current === 'dark' ? 'light' : 'dark';
}

export interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly initialPreference?: ThemePreference;
}

export function ThemeProvider({
  children,
  initialPreference
}: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(
    () => initialPreference ?? getStoredThemePreference()
  );

  const resolvedTheme: ResolvedTheme = preference;

  useEffect(() => {
    setDomTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }
      if (event.newValue === 'light' || event.newValue === 'dark') {
        setPreference(event.newValue);
        return;
      }
      setPreference(getStoredThemePreference());
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
    setStoredThemePreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const next = getNextThemePreference(prev);
      setStoredThemePreference(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedTheme,
      setThemePreference,
      cycleTheme: toggleTheme,
      toggleTheme
    }),
    [preference, resolvedTheme, setThemePreference, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
