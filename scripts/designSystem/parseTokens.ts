import postcss, { type AtRule, type Declaration, type Rule } from 'postcss';
import { parseColor, type Rgba } from './contrastRatio.ts';

export type ThemeName = 'light' | 'dark' | 'light+contrast' | 'dark+contrast';

export interface ResolvedThemes {
  light: Record<string, string>;
  dark: Record<string, string>;
  'light+contrast': Record<string, string>;
  'dark+contrast': Record<string, string>;
}

interface RawTokenMaps {
  root: Record<string, string>;
  dark: Record<string, string>;
  rootContrast: Record<string, string>;
  darkContrast: Record<string, string>;
}

function resolveVarChain(
  value: string,
  scope: Record<string, string>,
  stack: readonly string[] = []
): string {
  return value.replace(/var\((--[a-z0-9-]+)\)/gi, (match, varName: string) => {
    if (stack.includes(varName)) {
      throw new Error(`Circular variable reference: ${varName}`);
    }
    const resolvedVar = scope[varName];
    if (resolvedVar === undefined) {
      return match;
    }
    return resolveVarChain(resolvedVar, scope, [...stack, varName]);
  });
}

function parsePercent(pctStr?: string): number {
  if (!pctStr) {
    return 50;
  }
  return parseFloat(pctStr.trim().replace('%', ''));
}

function mixRgba(c1: Rgba, p1: number, c2: Rgba, p2: number): string {
  const totalWeight = p1 + p2;
  const w1 = p1 / totalWeight;
  const w2 = p2 / totalWeight;
  const a = c1.a * w1 + c2.a * w2;
  const roundedA = Math.round(a * 100) / 100;
  if (a === 0) {
    return 'rgba(0, 0, 0, 0)';
  }
  const r = Math.round((c1.r * c1.a * w1 + c2.r * c2.a * w2) / a);
  const g = Math.round((c1.g * c1.a * w1 + c2.g * c2.a * w2) / a);
  const b = Math.round((c1.b * c1.a * w1 + c2.b * c2.a * w2) / a);
  if (roundedA >= 1) {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${roundedA})`;
}

function resolveColorMix(mixExpression: string): string {
  const match = mixExpression.match(
    /color-mix\(\s*in\s+srgb\s*,\s*([^,]+?)(?:\s+([\d.]+%))?\s*,\s*([^)]+?)(?:\s+([\d.]+%))?\s*\)/i
  );
  if (!match) {
    return mixExpression;
  }
  const color1Raw = match[1].trim();
  const pct1 = parsePercent(match[2]);
  const color2Raw = match[3].trim();
  const pct2 = match[4] ? parsePercent(match[4]) : 100 - pct1;

  const toRgba = (col: string): Rgba => {
    if (col.toLowerCase() === 'transparent') {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    return parseColor(col);
  };

  const c1 = toRgba(color1Raw);
  const c2 = toRgba(color2Raw);
  return mixRgba(c1, pct1, c2, pct2);
}

function resolveSingleValue(
  value: string,
  scope: Record<string, string>
): string {
  const resolvedVars = resolveVarChain(value, scope);
  if (resolvedVars.includes('color-mix(')) {
    return resolveColorMix(resolvedVars);
  }
  return resolvedVars;
}

function resolveScope(scope: Record<string, string>): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [prop, val] of Object.entries(scope)) {
    resolved[prop] = resolveSingleValue(val, scope);
  }
  return resolved;
}

function collectDeclarations(rule: Rule, target: Record<string, string>): void {
  rule.walkDecls((decl: Declaration) => {
    if (decl.prop.startsWith('--')) {
      target[decl.prop] = decl.value.trim();
    }
  });
}

function extractRawTokens(cssContent: string): RawTokenMaps {
  const raw: RawTokenMaps = {
    root: {},
    dark: {},
    rootContrast: {},
    darkContrast: {}
  };
  const root = postcss.parse(cssContent);

  root.walkRules((rule: Rule) => {
    const parent = rule.parent;
    const isAtRule = parent && parent.type === 'atrule';
    const isContrastMedia =
      isAtRule &&
      (parent as AtRule).name === 'media' &&
      (parent as AtRule).params.includes('prefers-contrast: more');

    if (isContrastMedia) {
      if (rule.selector.includes('[data-theme')) {
        collectDeclarations(rule, raw.darkContrast);
      } else if (rule.selector.includes(':root')) {
        collectDeclarations(rule, raw.rootContrast);
      }
      return;
    }

    if (!isAtRule) {
      if (rule.selector.includes('[data-theme')) {
        collectDeclarations(rule, raw.dark);
      } else if (rule.selector.includes(':root')) {
        collectDeclarations(rule, raw.root);
      }
    }
  });

  return raw;
}

export function parseTokens(cssContent: string): ResolvedThemes {
  const raw = extractRawTokens(cssContent);

  const lightScope = { ...raw.root };
  const darkScope = { ...raw.root, ...raw.dark };
  const lightContrastScope = { ...lightScope, ...raw.rootContrast };
  const darkContrastScope = { ...darkScope, ...raw.darkContrast };

  return {
    light: resolveScope(lightScope),
    dark: resolveScope(darkScope),
    'light+contrast': resolveScope(lightContrastScope),
    'dark+contrast': resolveScope(darkContrastScope)
  };
}
