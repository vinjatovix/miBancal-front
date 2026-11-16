import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import {
  declaredViteKeys,
  missingViteKeys,
  usedViteKeys
} from './envExampleKeys.ts';

const ROOT = process.cwd();
const SOURCE_EXTENSION_PATTERN = /\.(ts|tsx)$/;

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function toRepoPath(path: string): string {
  return relative(ROOT, path).split(sep).join('/');
}

function readSources(): ReadonlyMap<string, string> {
  const sources = new Map<string, string>();
  for (const path of listFiles(join(ROOT, 'src'))) {
    const repoPath = toRepoPath(path);
    if (!SOURCE_EXTENSION_PATTERN.test(repoPath)) continue;
    sources.set(repoPath, readFileSync(path, 'utf8'));
  }
  return sources;
}

const sources = readSources();
const used = usedViteKeys(sources);
const declared = declaredViteKeys(
  readFileSync(join(ROOT, '.env.example'), 'utf8')
);
const missing = missingViteKeys(used, declared);

if (missing.length > 0) {
  const lines = missing.map(
    (key) => `${key} usada en src/ pero no declarada en .env.example`
  );
  process.stderr.write(
    `${lines.join('\n')}\n${missing.length} variable(s) VITE_ sin declarar\n`
  );
  process.exitCode = 1;
}
