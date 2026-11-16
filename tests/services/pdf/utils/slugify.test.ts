import { slugify } from '../../../../src/services/pdf/utils/slugify';

describe('slugify', () => {
  it('lowercases and strips diacritics', () => {
    expect(slugify('Jardín Málaga Ñ', 'fallback')).toBe('jardin-malaga-n');
  });

  it('collapses non-alphanumeric runs into single hyphens', () => {
    expect(slugify('  Bancal   #3 / Sur  ', 'fallback')).toBe('bancal-3-sur');
  });

  it('returns the provided fallback when no usable characters remain', () => {
    expect(slugify('   ***   ', 'planta')).toBe('planta');
  });

  it('trims thousands of leading and trailing hyphens', () => {
    const input = '-'.repeat(10000) + 'test' + '-'.repeat(10000);

    expect(slugify(input, 'fallback')).toBe('test');
  });
});
