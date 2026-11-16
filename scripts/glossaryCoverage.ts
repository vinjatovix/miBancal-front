import type { TechnicalTerm } from '../src/i18n/glossary/technicalTerms';

export interface GlossaryGap {
  readonly term: string;
  readonly glossaryKey: string;
}

const WORD_PATTERN = /[a-záéíóúüñ]+/gi;
const INTERPOLATION_PATTERN = /\{[^}]*\}/g;

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function surfaceForms(term: TechnicalTerm): Set<string> {
  return new Set([term.match, ...(term.variants ?? [])].map(normalize));
}

export function findGlossaryGaps(
  text: string,
  terms: readonly TechnicalTerm[],
  glossaryKeys: ReadonlySet<string>
): GlossaryGap[] {
  const tokens = text.replace(INTERPOLATION_PATTERN, ' ').match(WORD_PATTERN);
  if (!tokens) {
    return [];
  }

  const normalizedTokens = tokens.map((token) => ({
    original: token,
    normalized: normalize(token)
  }));
  const gaps: GlossaryGap[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    if (glossaryKeys.has(term.glossaryKey) || seen.has(term.glossaryKey)) {
      continue;
    }
    const forms = surfaceForms(term);
    const hit = normalizedTokens.find((token) => forms.has(token.normalized));
    if (hit) {
      gaps.push({ term: hit.original, glossaryKey: term.glossaryKey });
      seen.add(term.glossaryKey);
    }
  }

  return gaps;
}
