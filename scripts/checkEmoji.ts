import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { selectEmojiCheckFiles } from './emojiCheckFiles.ts';
import { findEmojiCharacters } from './emojiCharacters.ts';

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
  return findEmojiCharacters(path, source).map(
    ({ filePath, line, column, character }) =>
      `${filePath}:${line}:${column} - Forbidden emoji character '${character}'`
  );
}

const allPaths = listFiles(join(ROOT, 'src')).map(toRepoPath);
const filesToCheck = selectEmojiCheckFiles(allPaths);
const findings = filesToCheck.flatMap(findingsOf);

if (findings.length > 0) {
  process.stderr.write(
    `${findings.join('\n')}\n${findings.length} emoji finding(s) in src/\n`
  );
  process.exitCode = 1;
}
