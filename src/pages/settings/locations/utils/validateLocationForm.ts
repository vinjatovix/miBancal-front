export interface LocationFormValues {
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
}

export const NAME_MAX_LENGTH = 200;
export const LATITUDE_MIN = -90.0;
export const LATITUDE_MAX = 90.0;
export const LONGITUDE_MIN = -180.0;
export const LONGITUDE_MAX = 180.0;

export type LocationFormErrors = Partial<
  Record<keyof LocationFormValues, string>
>;

function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return 'name_required';
  if (trimmed.length > NAME_MAX_LENGTH) return 'name_too_long';
  return undefined;
}

export function parseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function validateLatitude(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return 'latitude_required';
  const num = parseCoordinate(trimmed);
  if (num === null || num < LATITUDE_MIN || num > LATITUDE_MAX) {
    return 'latitude_invalid';
  }
  return undefined;
}

function validateLongitude(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return 'longitude_required';
  const num = parseCoordinate(trimmed);
  if (num === null || num < LONGITUDE_MIN || num > LONGITUDE_MAX) {
    return 'longitude_invalid';
  }
  return undefined;
}

export function validateLocationForm(
  values: LocationFormValues
): LocationFormErrors {
  const errors: LocationFormErrors = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  const latError = validateLatitude(values.latitude);
  if (latError) errors.latitude = latError;

  const lngError = validateLongitude(values.longitude);
  if (lngError) errors.longitude = lngError;

  return errors;
}
