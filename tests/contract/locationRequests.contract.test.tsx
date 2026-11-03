import { describe, expect, it } from 'vitest';

import {
  buildCreateLocationRequest,
  buildLocation
} from '../fixtures/locations/buildLocation';
import { listLocationsResponse } from '../fixtures/locations/listLocations';
import { validateSchema } from './openApiContract';

describe('las ubicaciones del listado cumplen el schema Location', () => {
  it.each(listLocationsResponse.data)('ubicación $name', (location) => {
    expect(validateSchema('Location', location)).toEqual([]);
  });

  it('la factoría buildLocation cumple Location', () => {
    expect(validateSchema('Location', buildLocation())).toEqual([]);
  });

  it('rechaza una ubicación sin nombre (campo requerido)', () => {
    const withoutName: Record<string, unknown> = { ...buildLocation() };
    delete withoutName.name;

    expect(validateSchema('Location', withoutName)).not.toEqual([]);
  });

  it('rechaza una ubicación sin latitud o longitud (campos requeridos)', () => {
    const withoutLat: Record<string, unknown> = { ...buildLocation() };
    delete withoutLat.latitude;

    expect(validateSchema('Location', withoutLat)).not.toEqual([]);
  });
});

describe('las peticiones de creación cumplen CreateLocation', () => {
  it('factoría completa', () => {
    expect(
      validateSchema('CreateLocation', buildCreateLocationRequest())
    ).toEqual([]);
  });

  it('rechaza creación sin coordenadas', () => {
    expect(
      validateSchema('CreateLocation', {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Huerto'
      })
    ).not.toEqual([]);
  });

  it('rechaza latitud fuera de rango (-90 a 90)', () => {
    expect(
      validateSchema(
        'CreateLocation',
        buildCreateLocationRequest({ latitude: 95.0 })
      )
    ).not.toEqual([]);
  });

  it('rechaza longitud fuera de rango (-180 a 180)', () => {
    expect(
      validateSchema(
        'CreateLocation',
        buildCreateLocationRequest({ longitude: -185.0 })
      )
    ).not.toEqual([]);
  });

  it('rechaza campos heredados obsoletos', () => {
    const withLegacy = {
      ...buildCreateLocationRequest(),
      postalCode: '28013'
    };

    expect(validateSchema('CreateLocation', withLegacy)).not.toEqual([]);
  });
});

describe('las peticiones de edición cumplen UpdateLocation', () => {
  it('admite el no-op con cuerpo vacío', () => {
    expect(validateSchema('UpdateLocation', {})).toEqual([]);
  });

  it('admite actualizar nombre y coordenadas', () => {
    expect(
      validateSchema('UpdateLocation', {
        name: 'Huerto nuevo',
        latitude: 37.3891,
        longitude: -5.9845
      })
    ).toEqual([]);
  });

  it('rechaza name null', () => {
    expect(validateSchema('UpdateLocation', { name: null })).not.toEqual([]);
  });

  it('rechaza campos heredados obsoletos', () => {
    expect(
      validateSchema('UpdateLocation', {
        country: 'España'
      })
    ).not.toEqual([]);
  });
});
