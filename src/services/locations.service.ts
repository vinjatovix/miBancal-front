import type { PaginatedResponse } from '../types/api';
import type {
  CreateLocationRequest,
  Location,
  UpdateLocationRequest
} from '../types/Location/Location';
import type {
  BedLayoutPlacementInput,
  LocationLayoutResponse
} from '../types/Location/LocationLayout';
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

export interface LocationLayoutWithMeta {
  readonly layout: LocationLayoutResponse;
  readonly etag: string;
}

function buildCreateBody(input: CreateLocationRequest): CreateLocationRequest {
  return {
    id: input.id || crypto.randomUUID(),
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude,
    northAngle: input.northAngle
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

export async function getLocationLayout(
  id: string
): Promise<LocationLayoutWithMeta> {
  const { data, etag } = await apiFetchWithMeta<LocationLayoutResponse>(
    `${LOCATIONS_PATH}/${id}/layout`,
    { cache: 'no-store' }
  );
  return { layout: data, etag: etag ?? '' };
}

export async function updateBedsLayout(
  id: string,
  placements: readonly BedLayoutPlacementInput[],
  etag: string
): Promise<{ etag: string }> {
  const { etag: nextEtag } = await apiFetchWithMeta<void>(
    `${LOCATIONS_PATH}/${id}/beds-layout`,
    {
      method: 'PATCH',
      headers: { 'If-Match': etag },
      body: JSON.stringify(placements)
    }
  );
  return { etag: nextEtag ?? '' };
}

export async function deleteLocation(id: string, etag: string): Promise<void> {
  await apiFetchWithMeta<void>(`${LOCATIONS_PATH}/${id}`, {
    method: 'DELETE',
    headers: { 'If-Match': etag }
  });
}
