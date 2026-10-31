import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { findFocusFindings } from './testFocusFindings.ts';

const ROOT = process.cwd();
const TEST_FILE_PATTERN = /\.test\.tsx?$/;

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
  return findFocusFindings(source).map(
    (finding) => `${path}:${finding.line} - ${finding.message}`
  );
}

const testFiles = listFiles(join(ROOT, 'tests'))
  .map(toRepoPath)
  .filter((path) => TEST_FILE_PATTERN.test(path));
const findings = testFiles.flatMap(findingsOf);

if (findings.length > 0) {
  process.stderr.write(
    `${findings.join('\n')}\n${findings.length} uso(s) de .only/.skip sin incidencia\n`
  );
  process.exitCode = 1;
}
