import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { budgetFindings, eagerFiles, type Manifest } from './bundleBudget.ts';
import { formatFinding } from './findings.ts';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

function readManifest(): Manifest {
  const content = readFileSync(join(DIST, '.vite/manifest.json'), 'utf8');
  return JSON.parse(content) as Manifest;
}

function gzipBytes(files: string[]): number {
  return files.reduce((total, file) => {
    const buffer = readFileSync(join(DIST, file));
    return total + gzipSync(buffer, { level: 9 }).length;
  }, 0);
}

const files = eagerFiles(readManifest());
const findings = budgetFindings({
  js: gzipBytes(files.js),
  css: gzipBytes(files.css)
});

if (findings.length > 0) {
  process.stderr.write(
    `${findings.map(formatFinding).join('\n')}\n${findings.length} budget(s) de bundle excedido(s)\n`
  );
  process.exitCode = 1;
}
