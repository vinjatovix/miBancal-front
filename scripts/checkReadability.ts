import { getMessages } from '../src/i18n/core/registry.ts';
import { glossaryMessages } from '../src/i18n/messages/glossary.ts';
import '../src/i18n/messages/features.ts';
import { TECHNICAL_TERMS } from '../src/i18n/glossary/technicalTerms.ts';
import { formatFinding, type Finding } from './findings.ts';
import { readabilityFindings } from './readabilityFindings.ts';

function collectStrings(
  node: unknown,
  path: string,
  into: Map<string, string>
): void {
  if (typeof node === 'string') {
    into.set(path, node);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      collectStrings(value, path ? `${path}.${key}` : key, into);
    }
  }
}

const glossaryKeys = new Set(Object.keys(glossaryMessages.glossary.terms));

const strings = new Map<string, string>();
collectStrings(getMessages(), '', strings);

const findings: Finding[] = [];
for (const [key, text] of strings) {
  findings.push(
    ...readabilityFindings(key, text, TECHNICAL_TERMS, glossaryKeys)
  );
}

if (findings.length > 0) {
  const lines = findings.map(formatFinding).join('\n');
  process.stderr.write(
    `${lines}\n${findings.length} hallazgo(s) de legibilidad/glosario en el diccionario\n`
  );
  process.exitCode = 1;
}
