import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getStoredThemePreference,
  setStoredThemePreference,
  THEME_STORAGE_KEY
} from '../../../src/shared/theme/themeStorage';
import type { ThemePreference } from '../../../src/shared/theme/types';

describe('themeStorage', () => {
  beforeEach(() => {
    window.localStorage?.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage?.clear();
  });

  it('uses constant storage key agro_theme', () => {
    expect(THEME_STORAGE_KEY).toBe('agro_theme');
  });

  it.each([
    ['light' as ThemePreference, 'light'],
    ['dark' as ThemePreference, 'dark']
  ])('reads valid stored preference %s correctly', (preference, expected) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);

    const result = getStoredThemePreference();

    expect(result).toBe(expected);
  });

  it.each([
    [null],
    [''],
    ['invalid'],
    ['system'],
    ['{"theme":"dark"}'],
    ['LIGHT']
  ])('falls back to light when stored value is %s', (invalidValue) => {
    if (invalidValue !== null) {
      window.localStorage.setItem(THEME_STORAGE_KEY, invalidValue);
    }

    const result = getStoredThemePreference();

    expect(result).toBe('light');
  });

  it('falls back to light when localStorage.getItem throws SecurityError', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    const result = getStoredThemePreference();

    expect(result).toBe('light');
  });

  it.each([['light' as ThemePreference], ['dark' as ThemePreference]])(
    'persists preference %s to localStorage',
    (preference) => {
      setStoredThemePreference(preference);

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(preference);
    }
  );

  it('swallows errors when localStorage.setItem throws QuotaExceededError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    expect(() => setStoredThemePreference('dark')).not.toThrow();
  });

  it('returns light when window.localStorage is undefined', () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(
      undefined as unknown as Storage
    );

    const result = getStoredThemePreference();

    expect(result).toBe('light');
  });

  it('safely handles setStoredThemePreference when window.localStorage is undefined', () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(
      undefined as unknown as Storage
    );

    expect(() => setStoredThemePreference('dark')).not.toThrow();
  });
});
