import { getDomainFromUrl } from '../../../src/shared/utils/getDomainFromUrl';

describe('getDomainFromUrl', () => {
  it('quita el prefijo www del dominio', () => {
    expect(getDomainFromUrl('https://www.example.org/x')).toBe('example.org');
  });

  it('conserva los subdominios distintos de www', () => {
    expect(getDomainFromUrl('https://sub.example.org')).toBe('sub.example.org');
  });

  it('devuelve el texto tal cual si no es una URL', () => {
    expect(getDomainFromUrl('no es url')).toBe('no es url');
  });
});
