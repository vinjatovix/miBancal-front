import { describe, expect, it } from 'vitest';
import { checkPairs } from '../../../scripts/designSystem/checkPairs';
import type { ContrastPair } from '../../../scripts/designSystem/contrastPairs';
import type { ResolvedThemes } from '../../../scripts/designSystem/parseTokens';

function createMockThemes(overrides?: Partial<ResolvedThemes>): ResolvedThemes {
  const baseLight: Record<string, string> = {
    '--color-fg': '#13201a',
    '--color-bg-page': '#f3f8f4',
    '--color-bg-surface': '#ffffff',
    '--color-border-decor': '#c4d0c7'
  };

  const baseDark: Record<string, string> = {
    '--color-fg': '#e2ebe5',
    '--color-bg-page': '#0f1714',
    '--color-bg-surface': '#16201b',
    '--color-border-decor': '#34443b'
  };

  const baseLightContrast: Record<string, string> = {
    ...baseLight,
    '--color-border-decor': '#77857d'
  };

  const baseDarkContrast: Record<string, string> = {
    ...baseDark,
    '--color-border-decor': '#6b7c72'
  };

  return {
    light: { ...baseLight, ...overrides?.light },
    dark: { ...baseDark, ...overrides?.dark },
    'light+contrast': {
      ...baseLightContrast,
      ...overrides?.['light+contrast']
    },
    'dark+contrast': { ...baseDarkContrast, ...overrides?.['dark+contrast'] }
  };
}

describe('checkPairs', () => {
  it('reports pair failure when contrast ratio is below threshold', () => {
    const themes = createMockThemes({
      light: {
        '--color-fg': '#777777',
        '--color-bg-page': '#ffffff'
      }
    });

    const pairs: ContrastPair[] = [
      { fg: 'fg', bg: 'bg-page', threshold: 'text' }
    ];

    const findings = checkPairs(themes, pairs);

    expect(findings).toContain('pair fg/bg-page light 4.48 < 7 (text)');
  });

  it('uses 3:1 threshold for decor in high contrast modes and 1.4:1 in standard themes', () => {
    const themes = createMockThemes({
      'light+contrast': {
        '--color-border-decor': '#c4d0c7',
        '--color-bg-page': '#f3f8f4'
      }
    });

    const pairs: ContrastPair[] = [
      { fg: 'border-decor', bg: 'bg-page', threshold: 'decor' }
    ];

    const findings = checkPairs(themes, pairs);

    expect(findings).toContain(
      'pair border-decor/bg-page light+contrast 1.48 < 3 (decor)'
    );
  });

  it('fails with pure fg dark error when fg is pure white in dark theme', () => {
    const themes = createMockThemes({
      dark: {
        '--color-fg': '#ffffff'
      }
    });

    const pairs: ContrastPair[] = [];

    const findings = checkPairs(themes, pairs);

    expect(findings).toContain('pure fg dark #ffffff');
  });

  it('fails with pure bg-* dark error when any bg role is pure black in dark theme', () => {
    const themes = createMockThemes({
      dark: {
        '--color-bg-page': '#000000'
      }
    });

    const pairs: ContrastPair[] = [];

    const findings = checkPairs(themes, pairs);

    expect(findings).toContain('pure bg-page dark #000000');
  });

  it('returns empty findings list when all pairs and rules pass', () => {
    const themes = createMockThemes();
    const pairs: ContrastPair[] = [
      { fg: 'fg', bg: 'bg-page', threshold: 'text' }
    ];

    const findings = checkPairs(themes, pairs);

    expect(findings).toEqual([]);
  });
});
