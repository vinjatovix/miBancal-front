import { describe, expect, it } from 'vitest';

import { t } from '../../src/i18n/core/t';
import { glossaryMessages } from '../../src/i18n/messages/glossary';
import { TECHNICAL_TERMS } from '../../src/i18n/glossary/technicalTerms';

const terms = glossaryMessages.glossary.terms as Record<
  string,
  { term: string; definition: string }
>;

describe('glossary data', () => {
  it('registers help and close labels', () => {
    expect(t('glossary.help_label', { term: 'rizoma' })).toBe(
      'Qué significa rizoma'
    );
    expect(t('glossary.close_label')).toBe('Cerrar la explicación');
  });

  it.each(Object.keys(terms))('exposes term and definition for %s', (key) => {
    expect(terms[key].term.length).toBeGreaterThan(0);
    expect(terms[key].definition.length).toBeGreaterThan(0);
  });

  it.each(TECHNICAL_TERMS.map((term) => term.glossaryKey))(
    'has a glossary entry for curated term %s',
    (glossaryKey) => {
      expect(terms[glossaryKey]).toBeDefined();
      expect(terms[glossaryKey].term.length).toBeGreaterThan(0);
      expect(terms[glossaryKey].definition.length).toBeGreaterThan(0);
    }
  );
});
