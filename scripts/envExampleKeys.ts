const VITE_KEY_PATTERN = /VITE_[A-Z0-9_]+/g;
const DECLARED_KEY_PATTERN = /^(VITE_[A-Z0-9_]+)=/;

function isScannable(path: string): boolean {
  return !path.includes('.test.') && !path.includes('/fixtures/');
}

function sorted(keys: Iterable<string>): string[] {
  return [...new Set(keys)].sort();
}

export function usedViteKeys(sources: ReadonlyMap<string, string>): string[] {
  const keys: string[] = [];
  for (const [path, content] of sources) {
    if (!isScannable(path)) continue;
    keys.push(...(content.match(VITE_KEY_PATTERN) ?? []));
  }
  return sorted(keys);
}

export function declaredViteKeys(envExample: string): string[] {
  const keys = envExample
    .split('\n')
    .map((line) => line.match(DECLARED_KEY_PATTERN)?.[1])
    .filter((key): key is string => key !== undefined);
  return sorted(keys);
}

export function missingViteKeys(used: string[], declared: string[]): string[] {
  const declaredSet = new Set(declared);
  return used.filter((key) => !declaredSet.has(key));
}
