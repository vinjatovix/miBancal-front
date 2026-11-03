import type { PaginatedResponse } from '../types/api';
import type {
  CreateLocationRequest,
  Location,
  UpdateLocationRequest
} from '../types/Location/Location';
import { apiFetch, apiFetchWithMeta } from './api';
import {
  buildLocationListQuery,
  type LocationListRequest
} from './locationListQuery';

const LOCATIONS_PATH = '/api/v1/locations';

export interface LocationWithMeta {
  readonly location: Location;
  readonly etag: string;
}

function buildCreateBody(input: CreateLocationRequest): CreateLocationRequest {
  return {
    id: input.id || crypto.randomUUID(),
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude
  };
}

export async function getLocationList(
  request: LocationListRequest
): Promise<PaginatedResponse<Location>> {
  const query = buildLocationListQuery(request);
  return apiFetch(`${LOCATIONS_PATH}?${query}`);
}

export async function getLocationForEdit(
  id: string
): Promise<LocationWithMeta> {
  const { data, etag } = await apiFetchWithMeta<Location>(
    `${LOCATIONS_PATH}/${id}`
  );
  return { location: data, etag: etag ?? '' };
}

export async function createLocation(
  input: CreateLocationRequest
): Promise<LocationWithMeta> {
  const { data, etag } = await apiFetchWithMeta<Location>(LOCATIONS_PATH, {
    method: 'POST',
    body: JSON.stringify(buildCreateBody(input))
  });
  return { location: data, etag: etag ?? '' };
}

export async function updateLocation(
  id: string,
  patch: UpdateLocationRequest,
  etag: string
): Promise<LocationWithMeta> {
  const { data, etag: nextEtag } = await apiFetchWithMeta<Location>(
    `${LOCATIONS_PATH}/${id}`,
    {
      method: 'PATCH',
      headers: { 'If-Match': etag },
      body: JSON.stringify(patch)
    }
  );
  return { location: data, etag: nextEtag ?? '' };
}

export async function deleteLocation(id: string, etag: string): Promise<void> {
  await apiFetchWithMeta<void>(`${LOCATIONS_PATH}/${id}`, {
    method: 'DELETE',
    headers: { 'If-Match': etag }
  });
}
