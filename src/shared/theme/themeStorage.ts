import type { ThemePreference } from './types';

export const THEME_STORAGE_KEY = 'agro_theme';

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark';
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'light';
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : 'light';
  } catch {
    return 'light';
  }
}

export function setStoredThemePreference(preference: ThemePreference): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    return;
  }
}
