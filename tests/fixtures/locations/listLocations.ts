import type { PaginatedResponse } from '../../../src/types/api';
import type { Location } from '../../../src/types/Location/Location';
import { buildLocation } from './buildLocation';

export const listLocationsResponse: PaginatedResponse<Location> = {
  data: [
    buildLocation(),
    buildLocation({
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Terraza',
      latitude: 37.3891,
      longitude: -5.9845
    })
  ],
  pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 2 }
};

export const emptyLocationsResponse: PaginatedResponse<Location> = {
  data: [],
  pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
};
