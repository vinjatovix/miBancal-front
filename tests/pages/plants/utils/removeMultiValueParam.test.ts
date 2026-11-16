import { describe, expect, it } from 'vitest';

import { removeMultiValueParam } from '../../../../src/pages/plants/utils/removeMultiValueParam';

describe('removeMultiValueParam', () => {
  it('quita un único valor conservando los demás', () => {
    const params = new URLSearchParams('sowingMonth=3&sowingMonth=5&limit=25');

    const next = removeMultiValueParam(params, 'sowingMonth', '3');

    expect(next.getAll('sowingMonth')).toEqual(['5']);
    expect(next.get('limit')).toBe('25');
  });

  it('separa valores por coma y conserva el resto', () => {
    const params = new URLSearchParams('sowingMonth=3,5,7');

    const next = removeMultiValueParam(params, 'sowingMonth', '5');

    expect(next.getAll('sowingMonth')).toEqual(['3', '7']);
  });

  it('quitar el último valor elimina el parámetro', () => {
    const params = new URLSearchParams('sowingMonth=3&limit=25');

    const next = removeMultiValueParam(params, 'sowingMonth', '3');

    expect(next.has('sowingMonth')).toBe(false);
    expect(next.get('limit')).toBe('25');
  });

  it('no muta el objeto recibido', () => {
    const params = new URLSearchParams('sowingMonth=3&sowingMonth=5');

    removeMultiValueParam(params, 'sowingMonth', '3');

    expect(params.getAll('sowingMonth')).toEqual(['3', '5']);
  });
});
