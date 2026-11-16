import { describe, expect, it } from 'vitest';

import { buildFilterSummary } from '../../../../src/pages/plants/utils/buildFilterSummary';

describe('buildFilterSummary', () => {
  it('une las etiquetas con " · " tras el prefijo "Filtrado activo"', () => {
    expect(buildFilterSummary(['Perenne', 'Sol pleno'])).toBe(
      'Filtrado activo: Perenne · Sol pleno'
    );
  });

  it('devuelve cadena vacía sin filtros', () => {
    expect(buildFilterSummary([])).toBe('');
  });
});
