import type {
  Location,
  UpdateLocationRequest
} from '../../../../types/Location/Location';
import {
  parseCoordinate,
  type LocationFormValues
} from './validateLocationForm';

export function buildLocationPatch(
  original: Location,
  values: LocationFormValues
): UpdateLocationRequest {
  const patch: Record<string, unknown> = {};

  const nextName = values.name.trim();
  if (nextName !== original.name) {
    patch.name = nextName;
  }

  const nextLat = parseCoordinate(values.latitude);
  const nextLng = parseCoordinate(values.longitude);

  if (
    nextLat !== null &&
    nextLng !== null &&
    (nextLat !== original.latitude || nextLng !== original.longitude)
  ) {
    patch.latitude = nextLat;
    patch.longitude = nextLng;
  }

  return patch as UpdateLocationRequest;
}
