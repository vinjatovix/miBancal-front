import { describe, expect, it } from 'vitest';

import { buildLocationPatch } from '../../../../../src/pages/settings/locations/utils/buildLocationPatch';
import type { LocationFormValues } from '../../../../../src/pages/settings/locations/utils/validateLocationForm';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';

describe('buildLocationPatch', () => {
  it('devuelve objeto vacío cuando no hay cambios', () => {
    const original = buildLocation({
      name: 'Huerto original',
      latitude: 40.4168,
      longitude: -3.7038
    });
    const values: LocationFormValues = {
      name: 'Huerto original',
      latitude: '40.4168',
      longitude: '-3.7038'
    };

    const patch = buildLocationPatch(original, values);

    expect(patch).toEqual({});
  });

  it('incluye solo el nombre cuando es el único campo modificado', () => {
    const original = buildLocation({
      name: 'Nombre viejo',
      latitude: 40.4168,
      longitude: -3.7038
    });
    const values: LocationFormValues = {
      name: 'Nombre nuevo',
      latitude: '40.4168',
      longitude: '-3.7038'
    };

    const patch = buildLocationPatch(original, values);

    expect(patch).toEqual({ name: 'Nombre nuevo' });
  });

  it('incluye latitud y longitud juntas cuando cambia la latitud', () => {
    const original = buildLocation({
      name: 'Huerto',
      latitude: 40.4168,
      longitude: -3.7038
    });
    const values: LocationFormValues = {
      name: 'Huerto',
      latitude: '41.3879',
      longitude: '-3.7038'
    };

    const patch = buildLocationPatch(original, values);

    expect(patch).toEqual({
      latitude: 41.3879,
      longitude: -3.7038
    });
  });

  it('incluye latitud y longitud juntas cuando cambia la longitud', () => {
    const original = buildLocation({
      name: 'Huerto',
      latitude: 40.4168,
      longitude: -3.7038
    });
    const values: LocationFormValues = {
      name: 'Huerto',
      latitude: '40.4168',
      longitude: '2.1699'
    };

    const patch = buildLocationPatch(original, values);

    expect(patch).toEqual({
      latitude: 40.4168,
      longitude: 2.1699
    });
  });

  it('incluye nombre y ambas coordenadas cuando cambian todos los campos', () => {
    const original = buildLocation({
      name: 'Huerto',
      latitude: 40.4168,
      longitude: -3.7038
    });
    const values: LocationFormValues = {
      name: 'Huerto nuevo',
      latitude: '37.3891',
      longitude: '-5.9845'
    };

    const patch = buildLocationPatch(original, values);

    expect(patch).toEqual({
      name: 'Huerto nuevo',
      latitude: 37.3891,
      longitude: -5.9845
    });
  });
});
