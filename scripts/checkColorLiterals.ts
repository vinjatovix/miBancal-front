import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { findColorLiterals } from './colorLiterals.ts';
import { selectColorCheckFiles, TOKENS_FILE } from './colorCheckFiles.ts';

const ROOT = process.cwd();

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function toRepoPath(path: string): string {
  return relative(ROOT, path).split(sep).join('/');
}

function findingsOf(path: string): string[] {
  const source = readFileSync(join(ROOT, path), 'utf8');
  return findColorLiterals(path, source).map(
    ({ line, column, match }) => `${path}:${line}:${column}  ${match}`
  );
}

const candidates = [...listFiles(join(ROOT, 'src')), join(ROOT, 'index.html')];
const findings = selectColorCheckFiles(candidates.map(toRepoPath)).flatMap(
  findingsOf
);

if (findings.length > 0) {
  process.stderr.write(
    `${findings.join('\n')}\n${findings.length} color literal(s) outside ${TOKENS_FILE}\n`
  );
  process.exitCode = 1;
}
