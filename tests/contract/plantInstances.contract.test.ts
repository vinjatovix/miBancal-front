import { describe, expect, it } from 'vitest';
import {
  buildBatchPlacePlantInstancesRequest,
  buildBatchRemovePlantInstancesRequest,
  buildBatchUpdatePlantInstancesRequest,
  buildPlacePlantInstance,
  buildPlantInstance,
  buildUpdatePlantInstance
} from '../fixtures/plantInstances/buildPlantInstance';
import { validateSchema } from './openApiContract';

describe('PlantInstanceResponse schema validation', () => {
  it('validates a complete PlantInstanceResponse fixture against OpenAPI schema', () => {
    const rawFixture = buildPlantInstance();
    const payload = JSON.parse(JSON.stringify(rawFixture));

    const violations = validateSchema('PlantInstanceResponse', payload);

    expect(violations).toEqual([]);
  });

  it('validates PlantInstanceResponse without position', () => {
    const rawFixture = buildPlantInstance();
    const payload = JSON.parse(JSON.stringify(rawFixture));
    delete payload.position;

    const violations = validateSchema('PlantInstanceResponse', payload);

    expect(violations).toEqual([]);
  });

  it('rejects PlantInstanceResponse with negative coordinates', () => {
    const rawFixture = buildPlantInstance({ position: { x: -5, y: 10 } });
    const payload = JSON.parse(JSON.stringify(rawFixture));

    const violations = validateSchema('PlantInstanceResponse', payload);

    expect(violations).not.toEqual([]);
  });

  it('rejects PlantInstanceResponse when missing required bedId', () => {
    const rawFixture = buildPlantInstance();
    const payload = JSON.parse(JSON.stringify(rawFixture));
    delete payload.bedId;

    const violations = validateSchema('PlantInstanceResponse', payload);

    expect(violations).not.toEqual([]);
  });

  it('rejects PlantInstanceResponse with invalid UUID format in id', () => {
    const rawFixture = buildPlantInstance({ id: 'invalid-uuid' });
    const payload = JSON.parse(JSON.stringify(rawFixture));

    const violations = validateSchema('PlantInstanceResponse', payload);

    expect(violations).not.toEqual([]);
  });
});

describe('PlacePlantInstance schema validation', () => {
  it('validates a complete PlacePlantInstance fixture', () => {
    const payload = buildPlacePlantInstance();

    const violations = validateSchema('PlacePlantInstance', payload);

    expect(violations).toEqual([]);
  });

  it('validates PlacePlantInstance without optional position', () => {
    const payload = buildPlacePlantInstance();
    delete (payload as { position?: unknown }).position;

    const violations = validateSchema('PlacePlantInstance', payload);

    expect(violations).toEqual([]);
  });

  it('rejects PlacePlantInstance without required plantId', () => {
    const payload = buildPlacePlantInstance();
    delete (payload as { plantId?: unknown }).plantId;

    const violations = validateSchema('PlacePlantInstance', payload);

    expect(violations).not.toEqual([]);
  });
});

describe('UpdatePlantInstance schema validation', () => {
  it('validates an UpdatePlantInstance fixture', () => {
    const payload = buildUpdatePlantInstance();

    const violations = validateSchema('UpdatePlantInstance', payload);

    expect(violations).toEqual([]);
  });

  it('validates UpdatePlantInstance with null variety and notes', () => {
    const payload = buildUpdatePlantInstance({
      variety: null,
      notes: null
    });

    const violations = validateSchema('UpdatePlantInstance', payload);

    expect(violations).toEqual([]);
  });

  it('rejects UpdatePlantInstance with negative position', () => {
    const payload = buildUpdatePlantInstance({
      position: { x: 10, y: -20 }
    });

    const violations = validateSchema('UpdatePlantInstance', payload);

    expect(violations).not.toEqual([]);
  });
});

describe('PaginatedPlantInstances schema validation', () => {
  it('validates PaginatedPlantInstances containing multiple items', () => {
    const instance = JSON.parse(JSON.stringify(buildPlantInstance()));
    const payload = {
      data: [instance],
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        totalItems: 1
      }
    };

    const violations = validateSchema('PaginatedPlantInstances', payload);

    expect(violations).toEqual([]);
  });
});

describe('BatchPlacePlantInstancesRequest schema validation', () => {
  it('validates a complete BatchPlacePlantInstancesRequest fixture', () => {
    const payload = buildBatchPlacePlantInstancesRequest();

    const violations = validateSchema(
      'BatchPlacePlantInstancesRequest',
      payload
    );

    expect(violations).toEqual([]);
  });

  it('rejects BatchPlacePlantInstancesRequest when missing required bedId', () => {
    const payload = buildBatchPlacePlantInstancesRequest();
    delete (payload as { bedId?: unknown }).bedId;

    const violations = validateSchema(
      'BatchPlacePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });

  it('rejects BatchPlacePlantInstancesRequest with empty items array', () => {
    const payload = buildBatchPlacePlantInstancesRequest({ items: [] });

    const violations = validateSchema(
      'BatchPlacePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });

  it('rejects BatchPlacePlantInstancesRequest when an item has invalid UUID', () => {
    const payload = buildBatchPlacePlantInstancesRequest({
      items: [
        {
          id: 'invalid-id',
          plantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          position: { x: 10, y: 10 }
        }
      ]
    });

    const violations = validateSchema(
      'BatchPlacePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });
});

describe('BatchUpdatePlantInstancesRequest schema validation', () => {
  it('validates a complete BatchUpdatePlantInstancesRequest fixture', () => {
    const payload = buildBatchUpdatePlantInstancesRequest();

    const violations = validateSchema(
      'BatchUpdatePlantInstancesRequest',
      payload
    );

    expect(violations).toEqual([]);
  });

  it('rejects BatchUpdatePlantInstancesRequest when item is missing version', () => {
    const payload = {
      items: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          position: { x: 10, y: 10 }
        }
      ]
    };

    const violations = validateSchema(
      'BatchUpdatePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });

  it('rejects BatchUpdatePlantInstancesRequest with negative version', () => {
    const payload = buildBatchUpdatePlantInstancesRequest({
      items: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          version: -1,
          position: { x: 10, y: 10 }
        }
      ]
    });

    const violations = validateSchema(
      'BatchUpdatePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });

  it('rejects BatchUpdatePlantInstancesRequest with empty items array', () => {
    const payload = buildBatchUpdatePlantInstancesRequest({ items: [] });

    const violations = validateSchema(
      'BatchUpdatePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });
});

describe('BatchRemovePlantInstancesRequest schema validation', () => {
  it('validates a complete BatchRemovePlantInstancesRequest fixture', () => {
    const payload = buildBatchRemovePlantInstancesRequest();

    const violations = validateSchema(
      'BatchRemovePlantInstancesRequest',
      payload
    );

    expect(violations).toEqual([]);
  });

  it('rejects BatchRemovePlantInstancesRequest when item is missing version', () => {
    const payload = {
      items: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
        }
      ]
    };

    const violations = validateSchema(
      'BatchRemovePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });

  it('rejects BatchRemovePlantInstancesRequest with empty items array', () => {
    const payload = buildBatchRemovePlantInstancesRequest({ items: [] });

    const violations = validateSchema(
      'BatchRemovePlantInstancesRequest',
      payload
    );

    expect(violations).not.toEqual([]);
  });
});
