import type { Finding } from './findings.ts';

export const JS_BUDGET_GZIP = 150 * 1024;
export const CSS_BUDGET_GZIP = 20 * 1024;

export interface ManifestChunk {
  readonly file: string;
  readonly isEntry?: boolean;
  readonly isDynamicEntry?: boolean;
  readonly imports?: string[];
  readonly dynamicImports?: string[];
  readonly css?: string[];
}

export type Manifest = Record<string, ManifestChunk>;

export interface EagerFiles {
  readonly js: string[];
  readonly css: string[];
}

function eagerKeys(manifest: Manifest): Set<string> {
  const visited = new Set<string>();
  const queue = Object.keys(manifest).filter(
    (key) => manifest[key].isEntry && !manifest[key].isDynamicEntry
  );
  while (queue.length > 0) {
    const key = queue.shift() as string;
    if (visited.has(key) || !manifest[key]) continue;
    visited.add(key);
    queue.push(...(manifest[key].imports ?? []));
  }
  return visited;
}

function sorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

export function eagerFiles(manifest: Manifest): EagerFiles {
  const keys = [...eagerKeys(manifest)];
  const js = keys.map((key) => manifest[key].file);
  const css = keys.flatMap((key) => manifest[key].css ?? []);
  return { js: sorted(js), css: sorted(css) };
}

function overBudget(type: string, size: number, budget: number): Finding[] {
  if (size <= budget) return [];
  return [
    {
      message: `${type} eager ${size} bytes gzip supera el budget de ${budget} bytes`
    }
  ];
}

export function budgetFindings(sizes: { js: number; css: number }): Finding[] {
  return [
    ...overBudget('JS', sizes.js, JS_BUDGET_GZIP),
    ...overBudget('CSS', sizes.css, CSS_BUDGET_GZIP)
  ];
}
