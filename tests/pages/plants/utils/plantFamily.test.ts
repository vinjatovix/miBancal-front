import { describe, expect, it } from 'vitest';

import { readPlantFamily } from '../../../../src/pages/plants/utils/plantFamily';
import { buildFamilySummary } from '../../../fixtures/families/buildFamilySummary';

describe('readPlantFamily: linked family summary', () => {
  it('returns linked family view for a valid FamilySummary object', () => {
    const family = buildFamilySummary({
      name: 'Solanáceas',
      slug: 'solanaceae'
    });

    const result = readPlantFamily(family);

    expect(result).toEqual({
      kind: 'linked',
      name: 'Solanáceas',
      slug: 'solanaceae'
    });
  });

  it('preserves exact name and slug without modifying casing or trimming', () => {
    const family = buildFamilySummary({
      name: ' Apiáceas Extra ',
      slug: 'Apiaceas-Extra'
    });

    const result = readPlantFamily(family);

    expect(result).toEqual({
      kind: 'linked',
      name: ' Apiáceas Extra ',
      slug: 'Apiaceas-Extra'
    });
  });

  it('does not expose id in the returned view', () => {
    const family = buildFamilySummary({
      id: '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf',
      name: 'Solanáceas',
      slug: 'solanaceae'
    });

    const result = readPlantFamily(family);

    expect(result).not.toHaveProperty('id');
  });
});

describe('readPlantFamily: unavailable and invalid family', () => {
  it.each([
    '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf',
    'some-arbitrary-string-id',
    '12345'
  ])('returns unavailable view for string identifier %s', (id) => {
    const result = readPlantFamily(id);

    expect(result).toEqual({ kind: 'unavailable' });
  });

  it('does not expose id when returning unavailable kind', () => {
    const familyId = '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf';

    const result = readPlantFamily(familyId);

    expect(result).not.toHaveProperty('id');
  });

  it.each([
    null,
    undefined,
    {},
    { name: '' },
    { slug: '' },
    { name: '   ', slug: 'solanaceae' },
    { name: 'Solanáceas', slug: '   ' },
    { name: '   ', slug: '   ' },
    { name: 'Solanáceas' },
    { slug: 'solanaceae' },
    { name: '', slug: 'solanaceae' },
    { name: 'Solanáceas', slug: '' },
    12345,
    true,
    []
  ])('returns undefined for invalid or malformed input %j', (invalidInput) => {
    const result = readPlantFamily(invalidInput);

    expect(result).toBeUndefined();
  });
});
