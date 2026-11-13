import type { ResolvedTheme } from './types';

export function setDomTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const computedBackground = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background')
      .trim();

    if (computedBackground) {
      metaThemeColor.setAttribute('content', computedBackground);
    }
  }
}
