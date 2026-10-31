import { describe, expect, it } from 'vitest';

import type { AnomalyFormState } from '../../../../../src/pages/anomalies/components/AnomalyForm/types';
import { initialAnomalyFormState } from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/anomalyFormMappers';
import { validateAnomalyForm } from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/validateAnomalyForm';

function validState(
  overrides: Partial<AnomalyFormState> = {}
): AnomalyFormState {
  return {
    ...initialAnomalyFormState(),
    slug: 'pulgon-verde',
    name: 'Pulgón verde',
    category: 'pest',
    ...overrides
  };
}

describe('validateAnomalyForm', () => {
  it('accepts valid state with only required fields in create mode', () => {
    const errors = validateAnomalyForm(validState(), 'create');

    expect(errors).toEqual({});
  });

  it('requires slug, name, and category on create', () => {
    const errors = validateAnomalyForm(initialAnomalyFormState(), 'create');

    expect(Object.keys(errors).sort()).toEqual(['category', 'name', 'slug']);
  });

  it.each(['Pulgón', 'a--b', '-a', 'a-', 'a b', 'a'.repeat(121)])(
    'rejects invalid slug format or length: %s',
    (slug) => {
      const errors = validateAnomalyForm(validState({ slug }), 'create');

      expect(errors.slug).toBe(
        'El slug solo puede contener letras minúsculas, números y guiones sencillos (máximo 120).'
      );
    }
  );

  it('accepts a valid slug of 120 characters', () => {
    const errors = validateAnomalyForm(
      validState({ slug: 'a'.repeat(120) }),
      'create'
    );

    expect(errors.slug).toBeUndefined();
  });

  it('does not validate slug in edit mode because it is immutable', () => {
    const errors = validateAnomalyForm(
      validState({ slug: 'Invalid Slug!' }),
      'edit'
    );

    expect(errors.slug).toBeUndefined();
  });

  it('rejects blank name or name longer than 200 characters', () => {
    const blankErrors = validateAnomalyForm(
      validState({ name: '   ' }),
      'edit'
    );
    const longErrors = validateAnomalyForm(
      validState({ name: 'x'.repeat(201) }),
      'edit'
    );

    expect(blankErrors.name).toBe('Este campo es obligatorio.');
    expect(longErrors.name).toBe('Máximo 200 caracteres.');
  });

  it('rejects an invalid category value', () => {
    const errors = validateAnomalyForm(
      validState({ category: 'unknown' as never }),
      'edit'
    );

    expect(errors.category).toBe('Selecciona una categoría válida.');
  });

  it('rejects weed as a category value', () => {
    const errors = validateAnomalyForm(
      validState({ category: 'weed' as never }),
      'edit'
    );

    expect(errors.category).toBe('Selecciona una categoría válida.');
  });

  it('validates scientificName max 200 and description max 2000', () => {
    const errors = validateAnomalyForm(
      validState({
        scientificName: 'x'.repeat(201),
        description: 'x'.repeat(2001)
      }),
      'edit'
    );

    expect(errors.scientificName).toBe('Máximo 200 caracteres.');
    expect(errors.description).toBe('Máximo 2000 caracteres.');
  });

  it('validates that each text list line is under 2000 characters', () => {
    const errors = validateAnomalyForm(
      validState({
        symptoms: `ok\n${'x'.repeat(2001)}`
      }),
      'edit'
    );

    expect(errors.symptoms).toBe(
      'Cada línea admite como máximo 2000 caracteres.'
    );
  });

  it('rejects invalid resource URL format', () => {
    const state = validState({
      images: [
        {
          id: '1',
          url: 'ftp://invalid-scheme.com/foto.jpg',
          title: '',
          source: ''
        }
      ]
    });

    const errors = validateAnomalyForm(state, 'edit');

    expect(errors.resources).toBe(
      'La URL del recurso debe comenzar por http:// o https:// y tener como máximo 2048 caracteres.'
    );
  });

  it('rejects resource URL longer than 2048 characters', () => {
    const state = validState({
      videoResources: [
        {
          id: '1',
          url: `https://example.com/${'a'.repeat(2040)}`,
          title: ''
        }
      ]
    });

    const errors = validateAnomalyForm(state, 'edit');

    expect(errors.resources).toBe(
      'La URL del recurso debe comenzar por http:// o https:// y tener como máximo 2048 caracteres.'
    );
  });

  it('rejects when total resources exceeds 200 items', () => {
    const images = Array.from({ length: 201 }, (_, i) => ({
      id: `${i}`,
      url: `https://example.com/${i}.jpg`,
      title: '',
      source: ''
    }));
    const state = validState({ images });

    const errors = validateAnomalyForm(state, 'edit');

    expect(errors.resources).toBe(
      'No se pueden añadir más de 200 recursos en total.'
    );
  });

  it('rejects confusedWith containing invalid slug syntax', () => {
    const state = validState({
      confusedWithInput: 'pulgon-negro\nInvalid Slug!'
    });

    const errors = validateAnomalyForm(state, 'edit');

    expect(errors.confusedWith).toBe(
      'Cada identificador debe ser un slug válido (minúsculas, números y guiones, máx. 120 caracteres).'
    );
  });

  it('rejects confusedWith referencing current anomaly slug', () => {
    const state = validState({
      slug: 'pulgon-verde',
      confusedWithInput: 'pulgon-verde\nmosca-blanca'
    });

    const errors = validateAnomalyForm(state, 'create');

    expect(errors.confusedWith).toBe(
      'La anomalía no puede confundirse consigo misma.'
    );
  });

  it('rejects when confusedWith has more than 200 unique slugs', () => {
    const slugs = Array.from({ length: 201 }, (_, i) => `slug-${i}`).join('\n');
    const state = validState({ confusedWithInput: slugs });

    const errors = validateAnomalyForm(state, 'edit');

    expect(errors.confusedWith).toBe(
      'No se pueden añadir más de 200 identificadores.'
    );
  });
});
