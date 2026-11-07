import { describe, expect, it } from 'vitest';

import { buildBed, buildCreateBedRequest } from '../fixtures/beds/buildBed';
import { assertContractRequest, validateSchema } from './openApiContract';

describe('Bed schema validation', () => {
  it('validates complete Bed fixture against OpenAPI schema', () => {
    const rawBed = buildBed();
    const bed = JSON.parse(JSON.stringify(rawBed));

    const violations = validateSchema('Bed', bed);

    expect(violations).toEqual([]);
  });

  it('validates legacy Bed fixture with null location and locationId', () => {
    const rawBed = buildBed({ locationId: null, location: null });
    const bed = JSON.parse(JSON.stringify(rawBed));

    const violations = validateSchema('Bed', bed);

    expect(violations).toEqual([]);
  });

  it('rejects Bed without name', () => {
    const rawBed = buildBed();
    const bed = JSON.parse(JSON.stringify(rawBed));
    delete bed.name;

    const violations = validateSchema('Bed', bed);

    expect(violations).not.toEqual([]);
  });

  it('rejects Bed with non-positive width dimension', () => {
    const rawBed = buildBed({ width: 0 });
    const bed = JSON.parse(JSON.stringify(rawBed));

    const violations = validateSchema('Bed', bed);

    expect(violations).not.toEqual([]);
  });

  it('rejects Bed with negative depth dimension', () => {
    const rawBed = buildBed({ depth: -15 });
    const bed = JSON.parse(JSON.stringify(rawBed));

    const violations = validateSchema('Bed', bed);

    expect(violations).not.toEqual([]);
  });
});

describe('CreateBed schema and request contract validation', () => {
  it('validates CreateBed fixture against OpenAPI schema', () => {
    const payload = buildCreateBedRequest();

    const violations = validateSchema('CreateBed', payload);

    expect(violations).toEqual([]);
  });

  it('accepts CreateBed request body in POST /api/v1/beds contract', async () => {
    const payload = buildCreateBedRequest();

    const assertion = assertContractRequest({
      path: '/api/v1/beds',
      method: 'POST',
      body: payload
    });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('rejects CreateBed request when locationId is missing', () => {
    const payload: Record<string, unknown> = { ...buildCreateBedRequest() };
    delete payload.locationId;

    const violations = validateSchema('CreateBed', payload);

    expect(violations).not.toEqual([]);
  });

  it('rejects CreateBed request when dimensions are non-positive', () => {
    const payload = buildCreateBedRequest({ height: 0 });

    const violations = validateSchema('CreateBed', payload);

    expect(violations).not.toEqual([]);
  });
});
