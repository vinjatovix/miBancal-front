import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

import {
  budgetFindings,
  catalogMarkerFindings,
  eagerFiles,
  type Manifest
} from './bundleBudget.ts';
import { formatFinding, type Finding } from './findings.ts';

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

function collectDistFiles(
  directory: string,
  baseDir: string = directory
): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectDistFiles(fullPath, baseDir));
    } else if (/\.(js|html|css)$/.test(entry.name)) {
      results.push({
        path: relative(baseDir, fullPath),
        content: readFileSync(fullPath, 'utf8')
      });
    }
  }
  return results;
}

const files = eagerFiles(readManifest());
const findings: Finding[] = [
  ...budgetFindings({
    js: gzipBytes(files.js),
    css: gzipBytes(files.css)
  }),
  ...catalogMarkerFindings(collectDistFiles(DIST))
];

if (findings.length > 0) {
  process.stderr.write(
    `${findings.map(formatFinding).join('\n')}\n${findings.length} problema(s) en bundle de producción\n`
  );
  process.exitCode = 1;
}
