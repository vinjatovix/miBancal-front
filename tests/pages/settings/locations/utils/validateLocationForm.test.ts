import { describe, expect, it } from 'vitest';

import {
  type LocationFormValues,
  validateLocationForm
} from '../../../../../src/pages/settings/locations/utils/validateLocationForm';

const BASE_VALID_VALUES: LocationFormValues = {
  name: 'Huerto urbano',
  latitude: '40.4168',
  longitude: '-3.7038'
};

describe('validateLocationForm', () => {
  it('acepta un formulario completo con valores válidos', () => {
    const values = { ...BASE_VALID_VALUES };

    const errors = validateLocationForm(values);

    expect(errors).toEqual({});
  });

  it.each([
    ['', 'name_required'],
    ['   ', 'name_required'],
    ['a'.repeat(201), 'name_too_long']
  ])('valida restricciones de nombre para "%s"', (name, expectedError) => {
    const values: LocationFormValues = {
      ...BASE_VALID_VALUES,
      name
    };

    const errors = validateLocationForm(values);

    expect(errors.name).toBe(expectedError);
  });

  it('acepta nombre en el límite superior de 200 caracteres', () => {
    const values: LocationFormValues = {
      ...BASE_VALID_VALUES,
      name: 'a'.repeat(200)
    };

    const errors = validateLocationForm(values);

    expect(errors.name).toBeUndefined();
  });

  it.each([
    ['', 'latitude_required'],
    ['   ', 'latitude_required'],
    ['abc', 'latitude_invalid'],
    ['90.1', 'latitude_invalid'],
    ['-90.1', 'latitude_invalid']
  ])('valida errores de latitud para "%s"', (latitude, expectedError) => {
    const values: LocationFormValues = {
      ...BASE_VALID_VALUES,
      latitude
    };

    const errors = validateLocationForm(values);

    expect(errors.latitude).toBe(expectedError);
  });

  it.each(['-90', '90', '0', '37.3891'])(
    'acepta latitud válida dentro de rango "%s"',
    (latitude) => {
      const values: LocationFormValues = {
        ...BASE_VALID_VALUES,
        latitude
      };

      const errors = validateLocationForm(values);

      expect(errors.latitude).toBeUndefined();
    }
  );

  it.each([
    ['', 'longitude_required'],
    ['   ', 'longitude_required'],
    ['xyz', 'longitude_invalid'],
    ['180.1', 'longitude_invalid'],
    ['-180.1', 'longitude_invalid']
  ])('valida errores de longitud para "%s"', (longitude, expectedError) => {
    const values: LocationFormValues = {
      ...BASE_VALID_VALUES,
      longitude
    };

    const errors = validateLocationForm(values);

    expect(errors.longitude).toBe(expectedError);
  });

  it.each(['-180', '180', '0', '-5.9845'])(
    'acepta longitud válida dentro de rango "%s"',
    (longitude) => {
      const values: LocationFormValues = {
        ...BASE_VALID_VALUES,
        longitude
      };

      const errors = validateLocationForm(values);

      expect(errors.longitude).toBeUndefined();
    }
  );
});
