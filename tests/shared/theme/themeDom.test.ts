import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setDomTheme } from '../../../src/shared/theme/themeDom';
import type { ResolvedTheme } from '../../../src/shared/theme/types';

describe('setDomTheme', () => {
  let originalMeta: HTMLMetaElement | null = null;

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    originalMeta = document.querySelector('meta[name="theme-color"]');
    if (!originalMeta) {
      originalMeta = document.createElement('meta');
      originalMeta.name = 'theme-color';
      document.head.appendChild(originalMeta);
    }
    originalMeta.removeAttribute('content');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    originalMeta?.remove();
  });

  it.each([
    ['dark' as ResolvedTheme, 'dark'],
    ['light' as ResolvedTheme, 'light']
  ])(
    'sets data-theme attribute on documentElement to %s',
    (theme, expected) => {
      setDomTheme(theme);

      expect(document.documentElement.getAttribute('data-theme')).toBe(
        expected
      );
    }
  );

  it('updates meta theme-color content attribute from computed background color', () => {
    document.documentElement.style.setProperty('--color-background', '#0f1513');

    setDomTheme('dark');

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#0f1513');
  });

  it('handles absent meta theme-color tag gracefully without throwing', () => {
    originalMeta?.remove();

    expect(() => setDomTheme('light')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('does not set content when computed background color is empty', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => ''
    } as unknown as CSSStyleDeclaration);

    setDomTheme('dark');

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.hasAttribute('content')).toBe(false);
  });
});
