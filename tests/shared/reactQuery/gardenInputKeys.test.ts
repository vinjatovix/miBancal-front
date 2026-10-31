import { describe, expect, it } from 'vitest';
import type { GardenInputListRequest } from '../../../src/services/gardenInputListQuery';
import { gardenInputKeys } from '../../../src/shared/reactQuery/gardenInputKeys';

const request: GardenInputListRequest = {
  filters: { category: 'fertilizer' },
  pagination: { page: 1, limit: 25 },
  sort: { field: 'name', direction: 'asc' }
};

describe('gardenInputKeys', () => {
  it('groups all garden input keys under root', () => {
    const keys = gardenInputKeys.all;

    expect(keys).toEqual(['gardenInputs']);
  });

  it('generates lists base key', () => {
    const keys = gardenInputKeys.lists();

    expect(keys).toEqual(['gardenInputs', 'list']);
  });

  it('generates list key with request when scope is omitted', () => {
    const key = gardenInputKeys.list(request);

    expect(key).toEqual(['gardenInputs', 'list', request]);
  });

  it('generates list key with request and role scope when provided', () => {
    const key = gardenInputKeys.list(request, 'editorial');

    expect(key).toEqual(['gardenInputs', 'list', request, 'editorial']);
  });

  it('generates details base key', () => {
    const keys = gardenInputKeys.details();

    expect(keys).toEqual(['gardenInputs', 'detail']);
  });

  it('generates detail key with slug when scope is omitted', () => {
    const key = gardenInputKeys.detail('purin-ortiga');

    expect(key).toEqual(['gardenInputs', 'detail', 'purin-ortiga']);
  });

  it('generates detail key with slug and role scope when provided', () => {
    const key = gardenInputKeys.detail('purin-ortiga', 'public');

    expect(key).toEqual(['gardenInputs', 'detail', 'purin-ortiga', 'public']);
  });
});
