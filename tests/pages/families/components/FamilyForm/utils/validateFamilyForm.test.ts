import { describe, expect, it } from 'vitest';

import type { FamilyFormState } from '../../../../../../src/pages/families/components/FamilyForm/types';
import { validateFamilyForm } from '../../../../../../src/pages/families/components/FamilyForm/utils/validateFamilyForm';

function buildValidFamilyFormState(): FamilyFormState {
  return {
    name: 'Solanáceas',
    scientificName: 'Solanaceae',
    slug: 'solanaceae',
    shortDescription: 'Familia de plantas que incluye tomates y patatas.',
    highlights: ['Gran importancia agrícola', 'Presencia de alcaloides'],
    aliases: ['Solanaceas'],
    order: 'Solanales',
    distribution: 'Cosmopolita',
    speciesCount: '2700'
  };
}

describe('validateFamilyForm', () => {
  it('returns no errors for a valid family form state', () => {
    const state = buildValidFamilyFormState();

    const errors = validateFamilyForm(state);

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it.each([
    ['', 'name'],
    ['   ', 'name']
  ])('returns error when name is invalid: %j', (name, field) => {
    const state = { ...buildValidFamilyFormState(), name };

    const errors = validateFamilyForm(state);

    expect(errors[field]).toBeDefined();
  });

  it.each([
    ['', 'scientificName'],
    ['   ', 'scientificName']
  ])(
    'returns error when scientificName is invalid: %j',
    (scientificName, field) => {
      const state = { ...buildValidFamilyFormState(), scientificName };

      const errors = validateFamilyForm(state);

      expect(errors[field]).toBeDefined();
    }
  );

  it.each([
    ['', 'slug'],
    ['Invalid Slug', 'slug'],
    ['solanaceae-', 'slug'],
    ['-solanaceae', 'slug'],
    ['solanaceae--test', 'slug']
  ])('returns error when slug format is invalid: %j', (slug, field) => {
    const state = { ...buildValidFamilyFormState(), slug };

    const errors = validateFamilyForm(state);

    expect(errors[field]).toBeDefined();
  });

  it('returns error when shortDescription is empty', () => {
    const state = { ...buildValidFamilyFormState(), shortDescription: '' };

    const errors = validateFamilyForm(state);

    expect(errors.shortDescription).toBeDefined();
  });

  it('returns error when highlights has 0 items', () => {
    const state = { ...buildValidFamilyFormState(), highlights: [] };

    const errors = validateFamilyForm(state);

    expect(errors.highlights).toBeDefined();
  });

  it.each([['0'], ['-5'], ['abc'], ['12.5']])(
    'returns error when speciesCount is invalid: %j',
    (speciesCount) => {
      const state = { ...buildValidFamilyFormState(), speciesCount };

      const errors = validateFamilyForm(state);

      expect(errors.speciesCount).toBeDefined();
    }
  );

  it('allows unchanged existing slug through validation when initialSlug matches', () => {
    const state = { ...buildValidFamilyFormState(), slug: 'Amaryllidaceae' };

    const errors = validateFamilyForm(state, 'Amaryllidaceae');

    expect(errors.slug).toBeUndefined();
  });

  it('rejects modified slug when user changes slug to invalid format despite initialSlug', () => {
    const state = { ...buildValidFamilyFormState(), slug: 'Invalid Slug' };

    const errors = validateFamilyForm(state, 'Amaryllidaceae');

    expect(errors.slug).toBeDefined();
  });
});
