import type { TechnicalTerm } from '../src/i18n/glossary/technicalTerms';
import type { Finding } from './findings';
import { findGlossaryGaps } from './glossaryCoverage';
import { inflesz, words } from './inflesz';

const MIN_WORDS_FOR_READABILITY = 10;
const READABILITY_THRESHOLD = 55;

function lowReadabilityFinding(key: string, text: string): Finding[] {
  if (words(text) < MIN_WORDS_FOR_READABILITY) {
    return [];
  }
  const score = inflesz(text);
  if (score >= READABILITY_THRESHOLD) {
    return [];
  }
  return [
    {
      file: key,
      message: `[low-readability] INFLESZ ${Math.round(score)} (< ${READABILITY_THRESHOLD})`
    }
  ];
}

function missingGlossaryFindings(
  key: string,
  text: string,
  terms: readonly TechnicalTerm[],
  glossaryKeys: ReadonlySet<string>
): Finding[] {
  return findGlossaryGaps(text, terms, glossaryKeys).map((gap) => ({
    file: key,
    message: `[missing-glossary] término "${gap.term}" sin entrada de glosario`
  }));
}

export function readabilityFindings(
  key: string,
  text: string,
  terms: readonly TechnicalTerm[],
  glossaryKeys: ReadonlySet<string>
): Finding[] {
  return [
    ...lowReadabilityFinding(key, text),
    ...missingGlossaryFindings(key, text, terms, glossaryKeys)
  ];
}
