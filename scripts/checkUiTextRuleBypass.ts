import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { findUiTextRuleBypasses } from './uiTextRuleBypass.ts';

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
  return findUiTextRuleBypasses(source).map(
    ({ line, match }) => `${path}:${line}  ${match}`
  );
}

const findings = listFiles(join(ROOT, 'src'))
  .map(toRepoPath)
  .flatMap(findingsOf);

if (findings.length > 0) {
  process.stderr.write(
    `${findings.join('\n')}\n${findings.length} bypass(es) of local/no-hardcoded-ui-text in src/\n`
  );
  process.exitCode = 1;
}
