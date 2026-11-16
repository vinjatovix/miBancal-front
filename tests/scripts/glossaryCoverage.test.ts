import { describe, expect, it } from 'vitest';

import { findGlossaryGaps } from '../../scripts/glossaryCoverage';
import type { TechnicalTerm } from '../../src/i18n/glossary/technicalTerms';

const TERMS: readonly TechnicalTerm[] = [
  {
    match: 'edafoclimatico',
    glossaryKey: 'edaphoclimatic',
    variants: ['edafoclimatica']
  },
  { match: 'rizoma', glossaryKey: 'rhizome', variants: ['rizomas'] }
];

describe('findGlossaryGaps', () => {
  it('reports a technical term whose glossaryKey has no entry', () => {
    const gaps = findGlossaryGaps(
      'El equilibrio edafoclimático del bancal.',
      TERMS,
      new Set(['rhizome'])
    );

    expect(gaps).toHaveLength(1);
    expect(gaps[0].glossaryKey).toBe('edaphoclimatic');
  });

  it('is case and accent insensitive and matches variants', () => {
    const gaps = findGlossaryGaps(
      'Condiciones EDAFOCLIMÁTICA del suelo.',
      TERMS,
      new Set()
    );

    expect(gaps).toHaveLength(1);
    expect(gaps[0].glossaryKey).toBe('edaphoclimatic');
  });

  it('returns nothing when every term is covered', () => {
    const gaps = findGlossaryGaps(
      'El rizoma crece bajo tierra.',
      TERMS,
      new Set(['rhizome'])
    );

    expect(gaps).toHaveLength(0);
  });

  it('matches by whole word only', () => {
    const gaps = findGlossaryGaps('rizomatoso', TERMS, new Set());

    expect(gaps).toHaveLength(0);
  });

  it('normalizes interpolation placeholders before scanning', () => {
    const gaps = findGlossaryGaps(
      '{username} revisa el rizoma del cultivo.',
      TERMS,
      new Set()
    );

    expect(gaps).toHaveLength(1);
    expect(gaps[0].glossaryKey).toBe('rhizome');
  });
});
