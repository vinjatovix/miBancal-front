import { describe, expect, it } from 'vitest';

import {
  buildSortOptions,
  splitSortValue
} from '../../../../src/pages/plants/utils/buildSortOptions';

describe('buildSortOptions', () => {
  it('genera exactamente las 4 combinaciones admitidas con etiquetas legibles', () => {
    expect(buildSortOptions()).toEqual([
      { value: 'name:asc', label: 'Nombre común (A-Z)' },
      { value: 'name:desc', label: 'Nombre común (Z-A)' },
      { value: 'scientificName:asc', label: 'Nombre científico (A-Z)' },
      { value: 'scientificName:desc', label: 'Nombre científico (Z-A)' }
    ]);
  });

  it('las etiquetas no usan caracteres de flecha', () => {
    const labels = buildSortOptions().map((option) => option.label);

    expect(labels.join(' ')).not.toMatch(/[←-⇿]/);
  });
});

describe('splitSortValue', () => {
  it('descompone el valor combinado en criterio y dirección', () => {
    expect(splitSortValue('scientificName:desc')).toEqual({
      field: 'scientificName',
      direction: 'desc'
    });
  });
});
