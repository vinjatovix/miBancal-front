import type { Bed, CreateBedRequest } from '../../../src/types/Bed/Bed';

export function buildBed(overrides: Partial<Bed> = {}): Bed {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    userId: '00000000-0000-4000-8000-000000000001',
    locationId: '7ca85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Bancal Principal',
    width: 120,
    height: 240,
    depth: 30,
    latitude: 40.4168,
    longitude: -3.7038,
    plantInstances: [],
    location: {
      id: '7ca85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Huerto Norte',
      latitude: 40.4168,
      longitude: -3.7038
    },
    metadata: {
      createdAt: new Date('2026-10-01T10:00:00.000Z'),
      createdBy: '00000000-0000-4000-8000-000000000001',
      updatedAt: new Date('2026-10-01T10:00:00.000Z'),
      updatedBy: '00000000-0000-4000-8000-000000000001'
    },
    deleted: false,
    deletedAt: null,
    version: 1,
    ...overrides
  };
}

export function buildCreateBedRequest(
  overrides: Partial<CreateBedRequest> = {}
): CreateBedRequest {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Bancal Principal',
    width: 120,
    height: 240,
    depth: 30,
    locationId: '7ca85f64-5717-4562-b3fc-2c963f66afa6',
    ...overrides
  };
}
