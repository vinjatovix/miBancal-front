import type {
  CreateLocationRequest,
  Location
} from '../../../src/types/Location/Location';

export function buildLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Huerto de casa',
    latitude: 40.4168,
    longitude: -3.7038,
    createdAt: '2026-10-01T10:00:00.000Z',
    createdBy: '00000000-0000-4000-8000-000000000001',
    updatedAt: '2026-10-01T10:00:00.000Z',
    updatedBy: '00000000-0000-4000-8000-000000000001',
    version: 1,
    ...overrides
  };
}

export function buildCreateLocationRequest(
  overrides: Partial<CreateLocationRequest> = {}
): CreateLocationRequest {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Huerto de casa',
    latitude: 40.4168,
    longitude: -3.7038,
    ...overrides
  };
}
