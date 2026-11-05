import { describe, expect, it } from 'vitest';

import { slugify } from '../../../../../../src/pages/families/components/FamilyForm/utils/slugify';

describe('slugify', () => {
  it.each([
    ['Solanáceas', 'solanaceas'],
    ['Brassicaceae (Crucíferas)', 'brassicaceae-cruciferas'],
    ['  Fabaceae - Leguminosas  ', 'fabaceae-leguminosas'],
    ['Cucurbitaceae', 'cucurbitaceae'],
    ['---test---', 'test'],
    ['', ''],
    ['Liliáceas & Amarilidáceas!', 'liliaceas-amarilidaceas']
  ])('converts %j to %j', (input, expected) => {
    const result = slugify(input);

    expect(result).toBe(expected);
  });

  it('generates a slug matching the OpenAPI slug pattern when input has alphanumeric characters', () => {
    const input = 'Solanáceas del Huerto';

    const result = slugify(input);

    expect(result).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
});
