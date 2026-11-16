import { describe, expect, it } from 'vitest';

import { readabilityFindings } from '../../scripts/readabilityFindings';
import type { TechnicalTerm } from '../../src/i18n/glossary/technicalTerms';

const TERMS: readonly TechnicalTerm[] = [
  {
    match: 'edafoclimatico',
    glossaryKey: 'edaphoclimatic',
    variants: ['edafoclimatica']
  }
];

const NO_TERMS: readonly TechnicalTerm[] = [];

describe('readabilityFindings', () => {
  it('ignores short strings of nine words or fewer', () => {
    const findings = readabilityFindings(
      'plant.label',
      'Nombre común de la planta',
      NO_TERMS,
      new Set()
    );

    expect(findings).toHaveLength(0);
  });

  it('flags a complete sentence below the readability threshold', () => {
    const dense =
      'La caracterización edafoclimática condiciona la fenología reproductiva y la polinización entomófila del espécimen cultivado intensivamente.';
    const findings = readabilityFindings(
      'plant.note',
      dense,
      NO_TERMS,
      new Set()
    );

    const lowReadability = findings.find((finding) =>
      finding.message.startsWith('[low-readability]')
    );
    expect(lowReadability).toBeDefined();
    expect(lowReadability?.file).toBe('plant.note');
  });

  it('does not flag a readable complete sentence', () => {
    const plain =
      'Riega la planta cuando la tierra esté seca y deja que el sol le dé unas horas.';
    const findings = readabilityFindings(
      'plant.note',
      plain,
      NO_TERMS,
      new Set()
    );

    expect(
      findings.some((finding) =>
        finding.message.startsWith('[low-readability]')
      )
    ).toBe(false);
  });

  it('flags a string with a technical term lacking a glossary entry', () => {
    const findings = readabilityFindings(
      'plant.cultivation',
      'Ajusta el riego al perfil edafoclimático.',
      TERMS,
      new Set()
    );

    const missing = findings.find((finding) =>
      finding.message.startsWith('[missing-glossary]')
    );
    expect(missing).toBeDefined();
    expect(missing?.file).toBe('plant.cultivation');
  });

  it('does not flag a covered technical term', () => {
    const findings = readabilityFindings(
      'plant.cultivation',
      'Ajusta el riego al perfil edafoclimático.',
      TERMS,
      new Set(['edaphoclimatic'])
    );

    expect(
      findings.some((finding) =>
        finding.message.startsWith('[missing-glossary]')
      )
    ).toBe(false);
  });
});
