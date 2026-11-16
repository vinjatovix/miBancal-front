import { contrastRatio } from './contrastRatio.ts';
import type { ContrastPair, ContrastThreshold } from './contrastPairs.ts';
import type { ResolvedThemes, ThemeName } from './parseTokens.ts';

const THEMES: readonly ThemeName[] = [
  'light',
  'dark',
  'light+contrast',
  'dark+contrast'
];

function getThresholdValue(
  threshold: ContrastThreshold,
  theme: ThemeName
): number {
  if (threshold === 'text' || threshold === 'small-text') {
    return 7;
  }
  if (
    threshold === 'large-text' ||
    threshold === 'disabled-text' ||
    threshold === 'placeholder'
  ) {
    return 4.5;
  }
  if (threshold === 'non-text') {
    return 3;
  }
  if (threshold === 'decor') {
    return theme.includes('contrast') ? 3 : 1.4;
  }
  if (threshold === 'distinct') {
    return 1.5;
  }
  return 3;
}

function normalizeProp(name: string): string {
  return name.startsWith('--') ? name : `--color-${name}`;
}

function checkThemePair(
  pair: ContrastPair,
  theme: ThemeName,
  themeTokens: Record<string, string>
): string | null {
  const fgProp = normalizeProp(pair.fg);
  const bgProp = normalizeProp(pair.bg);
  const colorFg = themeTokens[fgProp];
  const colorBg = themeTokens[bgProp];

  if (!colorFg || !colorBg) {
    const missing = !colorFg ? fgProp : bgProp;
    return `pair ${pair.fg}/${pair.bg} ${theme} missing ${missing}`;
  }

  const overProp = pair.over ? normalizeProp(pair.over) : undefined;
  const colorOver = overProp ? themeTokens[overProp] : undefined;

  const ratio = contrastRatio(colorFg, colorBg, colorOver);
  const thresholdVal = getThresholdValue(pair.threshold, theme);

  if (ratio < thresholdVal) {
    return `pair ${pair.fg}/${pair.bg} ${theme} ${ratio} < ${thresholdVal} (${pair.threshold})`;
  }
  return null;
}

function checkPureColors(darkTokens: Record<string, string>): string[] {
  const findings: string[] = [];
  const fg = darkTokens['--color-fg'];
  if (fg && (fg.toLowerCase() === '#ffffff' || fg.toLowerCase() === '#fff')) {
    findings.push(`pure fg dark ${fg}`);
  }

  for (const [prop, val] of Object.entries(darkTokens)) {
    if (
      prop.startsWith('--color-bg-') &&
      (val.toLowerCase() === '#000000' || val.toLowerCase() === '#000')
    ) {
      const role = prop.replace('--color-', '');
      findings.push(`pure ${role} dark ${val}`);
    }
  }

  return findings;
}

export function checkPairs(
  themes: ResolvedThemes,
  pairs: readonly ContrastPair[]
): string[] {
  const findings: string[] = [];

  for (const theme of THEMES) {
    const themeTokens = themes[theme];
    for (const pair of pairs) {
      const error = checkThemePair(pair, theme, themeTokens);
      if (error) {
        findings.push(error);
      }
    }
  }

  const pureErrors = checkPureColors(themes.dark);
  findings.push(...pureErrors);

  return findings;
}
