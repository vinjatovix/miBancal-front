import { dictionary } from './dictionary';
import type { I18nKey } from './types';

export function lookup(path: string): string | undefined {
  let value: unknown = dictionary;

  for (const part of path.split('.')) {
    if (typeof value !== 'object' || value === null || !(part in value)) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[part];
  }

  return typeof value === 'string' ? value : undefined;
}

export function t(
  key: I18nKey,
  params?: Record<string, string | number>
): string {
  const text = lookup(key) ?? key;
  if (!params) {
    return text;
  }
  return Object.entries(params).reduce(
    (result, [paramKey, paramValue]) =>
      result.replaceAll(`{${paramKey}}`, () => String(paramValue)),
    text
  );
}
