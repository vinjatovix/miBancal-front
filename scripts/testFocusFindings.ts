import type { Finding } from './findings.ts';

const ONLY_PATTERN = /^\s*[\w.]*\.only\s*\(/;
const SKIP_PATTERN = /^\s*[\w.]*\.skip\s*\(/;
const ISSUE_PATTERN = /https?:\/\/\S+|#\d+/;

function hasIssueReference(lines: string[], index: number): boolean {
  const current = lines[index];
  const previous = index > 0 ? lines[index - 1] : '';
  return ISSUE_PATTERN.test(current) || ISSUE_PATTERN.test(previous);
}

export function findFocusFindings(source: string): Finding[] {
  const lines = source.split('\n');
  const findings: Finding[] = [];
  lines.forEach((line, index) => {
    if (ONLY_PATTERN.test(line)) {
      findings.push({ line: index + 1, message: 'Uso prohibido de .only' });
    } else if (SKIP_PATTERN.test(line) && !hasIssueReference(lines, index)) {
      findings.push({
        line: index + 1,
        message: '.skip sin referencia a incidencia (URL o #<número>)'
      });
    }
  });
  return findings;
}
