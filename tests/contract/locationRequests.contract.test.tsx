import { describe, expect, it } from 'vitest';

import {
  buildCreateLocationRequest,
  buildLocation
} from '../fixtures/locations/buildLocation';
import { listLocationsResponse } from '../fixtures/locations/listLocations';
import { assertContractRequest, validateSchema } from './openApiContract';

describe('listed locations conform to Location schema', () => {
  it.each(listLocationsResponse.data)('location $name', (location) => {
    expect(validateSchema('Location', location)).toEqual([]);
  });

  it('buildLocation factory conforms to Location', () => {
    expect(validateSchema('Location', buildLocation())).toEqual([]);
  });

  it('rejects a location without name (required field)', () => {
    const withoutName: Record<string, unknown> = { ...buildLocation() };
    delete withoutName.name;

    expect(validateSchema('Location', withoutName)).not.toEqual([]);
  });

  it('accepts a location without latitude or longitude (optional fields)', () => {
    const withoutCoords: Record<string, unknown> = { ...buildLocation() };
    delete withoutCoords.latitude;
    delete withoutCoords.longitude;

    expect(validateSchema('Location', withoutCoords)).toEqual([]);
  });
});

describe('creation requests conform to CreateLocation', () => {
  it('accepts complete factory payload', async () => {
    const payload = buildCreateLocationRequest();

    const assertion = assertContractRequest({
      path: '/api/v1/locations',
      method: 'POST',
      body: payload
    });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('accepts creation without coordinates', async () => {
    const payload = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Huerto'
    };

    const assertion = assertContractRequest({
      path: '/api/v1/locations',
      method: 'POST',
      body: payload
    });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('rejects latitude out of range (-90 to 90)', async () => {
    const payload = buildCreateLocationRequest({ latitude: 95.0 });

    const assertion = assertContractRequest({
      path: '/api/v1/locations',
      method: 'POST',
      body: payload
    });

    await expect(assertion).rejects.toThrow();
  });

  it('rejects longitude out of range (-180 to 180)', async () => {
    const payload = buildCreateLocationRequest({ longitude: -185.0 });

    const assertion = assertContractRequest({
      path: '/api/v1/locations',
      method: 'POST',
      body: payload
    });

    await expect(assertion).rejects.toThrow();
  });

  it('rejects obsolete legacy fields', async () => {
    const withLegacy = {
      ...buildCreateLocationRequest(),
      postalCode: '28013'
    };

    const assertion = assertContractRequest({
      path: '/api/v1/locations',
      method: 'POST',
      body: withLegacy
    });

    await expect(assertion).rejects.toThrow();
  });
});

describe('update requests conform to UpdateLocation', () => {
  it('accepts empty body no-op', async () => {
    const assertion = assertContractRequest({
      path: '/api/v1/locations/11111111-1111-4111-8111-111111111111',
      method: 'PATCH',
      headers: { 'If-Match': '"1"' },
      body: {}
    });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('accepts updating name and coordinates', async () => {
    const payload = {
      name: 'Huerto nuevo',
      latitude: 37.3891,
      longitude: -5.9845
    };

    const assertion = assertContractRequest({
      path: '/api/v1/locations/11111111-1111-4111-8111-111111111111',
      method: 'PATCH',
      headers: { 'If-Match': '"1"' },
      body: payload
    });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('rejects null name', async () => {
    const payload = { name: null };

    const assertion = assertContractRequest({
      path: '/api/v1/locations/11111111-1111-4111-8111-111111111111',
      method: 'PATCH',
      headers: { 'If-Match': '"1"' },
      body: payload
    });

    await expect(assertion).rejects.toThrow();
  });

  it('rejects obsolete legacy fields', async () => {
    const payload = { country: 'España' };

    const assertion = assertContractRequest({
      path: '/api/v1/locations/11111111-1111-4111-8111-111111111111',
      method: 'PATCH',
      headers: { 'If-Match': '"1"' },
      body: payload
    });

    await expect(assertion).rejects.toThrow();
  });
});
