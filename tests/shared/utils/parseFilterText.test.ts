import { parseFilterText } from '../../../src/shared/utils/parseFilterText';

const MAX = 10;

describe('parseFilterText', () => {
  it('devuelve el texto recortado', () => {
    expect(parseFilterText('  tomate  ', MAX)).toBe('tomate');
  });

  it('acepta exactamente la longitud máxima', () => {
    expect(parseFilterText('a'.repeat(MAX), MAX)).toBe('a'.repeat(MAX));
  });

  it.each([null, '', '   ', ` ${'a'.repeat(MAX + 1)} `])(
    '%j no es un texto de filtro válido',
    (value) => {
      expect(parseFilterText(value, MAX)).toBeUndefined();
    }
  );
});
