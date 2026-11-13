import { formatPdfFilename } from '../../../src/services/pdf/bedPdfFilename';

describe('formatPdfFilename', () => {
  it('builds the filename with a location slug and the date', () => {
    const date = new Date(2026, 10, 9);

    const filename = formatPdfFilename('Huerto Norte', date);

    expect(filename).toBe('huerto-norte-2026-11-09.pdf');
  });

  it('strips diacritics and lowercases the location slug', () => {
    const date = new Date(2026, 0, 5);

    const filename = formatPdfFilename('Jardín Málaga Ñ', date);

    expect(filename).toBe('jardin-malaga-n-2026-01-05.pdf');
  });

  it('collapses non-alphanumeric runs into single hyphens', () => {
    const date = new Date(2026, 11, 31);

    const filename = formatPdfFilename('  Bancal   #3 / Sur  ', date);

    expect(filename).toBe('bancal-3-sur-2026-12-31.pdf');
  });

  it('falls back to a default slug when the name has no usable characters', () => {
    const date = new Date(2026, 2, 1);

    const filename = formatPdfFilename('   ***   ', date);

    expect(filename).toBe('ubicacion-2026-03-01.pdf');
  });

  it('handles limit input with a massive number of edge hyphens efficiently', () => {
    const date = new Date(2026, 0, 1);
    const input = '-'.repeat(10000) + 'test' + '-'.repeat(10000);
    const start = performance.now();
    const filename = formatPdfFilename(input, date);
    const duration = performance.now() - start;

    expect(filename).toBe('test-2026-01-01.pdf');
    expect(duration).toBeLessThan(100);
  });
});
