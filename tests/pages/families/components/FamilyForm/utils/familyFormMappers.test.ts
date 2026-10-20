import { describe, expect, it } from 'vitest';

import {
  canonicalFamilyToFormState,
  formStateToCreateFamilyRequest,
  formStateToUpdateFamilyRequest,
  initialFamilyFormState,
  normalizeFamilyApiErrors
} from '../../../../../../src/pages/families/components/FamilyForm/utils/familyFormMappers';
import { buildFamily } from '../../../../../fixtures/families/buildFamily';

describe('familyFormMappers', () => {
  it('maps canonical family to form state correctly', () => {
    const family = buildFamily({
      name: 'Solanáceas',
      scientificName: 'Solanaceae',
      slug: 'solanaceae',
      shortDescription: 'Familia agronómica',
      highlights: ['Alcaloides'],
      aliases: ['Solanaceas'],
      extra: {
        order: 'Solanales',
        distribution: 'Cosmopolita',
        speciesCount: 2700
      }
    });

    const formState = canonicalFamilyToFormState(family);

    expect(formState.name).toBe('Solanáceas');
    expect(formState.scientificName).toBe('Solanaceae');
    expect(formState.slug).toBe('solanaceae');
    expect(formState.highlights).toEqual(['Alcaloides']);
    expect(formState.order).toBe('Solanales');
    expect(formState.speciesCount).toBe('2700');
  });

  it('generates blank initial family form state', () => {
    const state = initialFamilyFormState();

    expect(state.name).toBe('');
    expect(state.slug).toBe('');
    expect(state.highlights).toEqual([]);
    expect(state.speciesCount).toBe('');
  });

  it('converts form state to CreateFamilyRequest', () => {
    const family = buildFamily();
    const formState = canonicalFamilyToFormState(family);

    const request = formStateToCreateFamilyRequest(
      formState,
      'generated-fam-id'
    );

    expect(request.id).toBe('generated-fam-id');
    expect(request.name).toBe(formState.name);
    expect(request.slug).toBe(formState.slug);
    expect(request.highlights).toEqual(formState.highlights);
  });

  it('converts form state to UpdateFamilyRequest', () => {
    const family = buildFamily();
    const formState = {
      ...canonicalFamilyToFormState(family),
      name: 'Solanáceas Editadas'
    };

    const updateRequest = formStateToUpdateFamilyRequest(formState);

    expect(updateRequest.name).toBe('Solanáceas Editadas');
  });

  it('sends explicit null for cleared extra fields in UpdateFamilyRequest', () => {
    const family = buildFamily({
      extra: {
        order: 'Solanales',
        distribution: 'Cosmopolita',
        speciesCount: 2700
      }
    });
    const formState = {
      ...canonicalFamilyToFormState(family),
      order: '',
      distribution: '',
      speciesCount: ''
    };

    const updateRequest = formStateToUpdateFamilyRequest(formState);

    expect(updateRequest.extra).toEqual({
      order: null,
      distribution: null,
      speciesCount: null
    });
  });

  it('preserves populated extra fields in UpdateFamilyRequest', () => {
    const family = buildFamily();
    const formState = {
      ...canonicalFamilyToFormState(family),
      order: 'Solanales',
      distribution: '',
      speciesCount: '2700'
    };

    const updateRequest = formStateToUpdateFamilyRequest(formState);

    expect(updateRequest.extra).toEqual({
      order: 'Solanales',
      distribution: null,
      speciesCount: 2700
    });
  });
});

describe('normalizeFamilyApiErrors', () => {
  it('strips extra. prefix from nested extra field error paths', () => {
    const rawErrors = {
      'extra.speciesCount': 'Debe ser mayor a 0',
      'extra.order': 'Orden inválido',
      name: 'Nombre requerido'
    };

    const normalized = normalizeFamilyApiErrors(rawErrors);

    expect(normalized.fieldErrors).toEqual({
      speciesCount: 'Debe ser mayor a 0',
      order: 'Orden inválido',
      name: 'Nombre requerido'
    });
    expect(normalized.unmappedErrors).toEqual([]);
  });

  it('keeps standard top-level error paths unchanged', () => {
    const rawErrors = {
      scientificName: 'Nombre científico requerido',
      shortDescription: 'Descripción muy corta'
    };

    const normalized = normalizeFamilyApiErrors(rawErrors);

    expect(normalized.fieldErrors).toEqual(rawErrors);
    expect(normalized.unmappedErrors).toEqual([]);
  });

  it('collects unmapped or unrecognized error keys into unmappedErrors', () => {
    const rawErrors = {
      'extra.subfamilies': 'Subfamilias no válidas',
      unknownField: 'Campo no reconocido'
    };

    const normalized = normalizeFamilyApiErrors(rawErrors);

    expect(normalized.fieldErrors).toEqual({});
    expect(normalized.unmappedErrors).toEqual([
      'Subfamilias no válidas',
      'Campo no reconocido'
    ]);
  });
});
