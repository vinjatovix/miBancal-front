import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  highSeverityAdvisories,
  unallowedAdvisories,
  type AllowlistEntry
} from './auditAllowlist.ts';

const ROOT = process.cwd();
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runAudit(): unknown {
  try {
    const output = execFileSync(NPM, ['audit', '--omit=dev', '--json'], {
      encoding: 'utf8'
    });
    return JSON.parse(output);
  } catch (error) {
    const output = (error as { stdout?: string }).stdout;
    if (typeof output !== 'string' || output.length === 0) throw error;
    return JSON.parse(output);
  }
}

function readAllowlist(): AllowlistEntry[] {
  const content = readFileSync(
    join(ROOT, 'security/audit-allowlist.json'),
    'utf8'
  );
  const parsed: unknown = JSON.parse(content);
  return Array.isArray(parsed) ? (parsed as AllowlistEntry[]) : [];
}

const advisories = highSeverityAdvisories(runAudit());
const unallowed = unallowedAdvisories(advisories, readAllowlist());

if (unallowed.length > 0) {
  const lines = unallowed.map(
    (advisory) => `${advisory.name} [${advisory.severity}] ${advisory.url}`
  );
  process.stderr.write(
    `${lines.join('\n')}\n${unallowed.length} aviso(s) high/critical no permitido(s)\n`
  );
  process.exitCode = 1;
}
