import { ApiError } from '../../../../shared/errors/ApiError';
import type {
  LocationFormErrors,
  LocationFormValues
} from './validateLocationForm';

const CONFLICT_STATUS = 409;
const VALIDATION_STATUS = 400;
const PRECONDITION_STATUSES = [412, 428];

const FIELD_KEYS: readonly (keyof LocationFormValues)[] = [
  'name',
  'latitude',
  'longitude'
];

export interface MappedLocationError {
  readonly fieldErrors: LocationFormErrors;
  readonly isConflict: boolean;
  readonly isHandled: boolean;
}

export function isPreconditionConflict(error: unknown): boolean {
  return (
    error instanceof ApiError && PRECONDITION_STATUSES.includes(error.status)
  );
}

function pickFieldErrors(errors: Record<string, string>): LocationFormErrors {
  return FIELD_KEYS.reduce<LocationFormErrors>((acc, key) => {
    const message = errors[key];
    return message ? { ...acc, [key]: message } : acc;
  }, {});
}

export function mapLocationError(error: unknown): MappedLocationError {
  if (isPreconditionConflict(error)) {
    return { fieldErrors: {}, isConflict: true, isHandled: true };
  }
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return {
      fieldErrors: { name: 'duplicate' },
      isConflict: false,
      isHandled: true
    };
  }
  if (
    error instanceof ApiError &&
    error.status === VALIDATION_STATUS &&
    error.errors
  ) {
    const fieldErrors = pickFieldErrors(error.errors);
    return {
      fieldErrors,
      isConflict: false,
      isHandled: Object.keys(fieldErrors).length > 0
    };
  }
  return { fieldErrors: {}, isConflict: false, isHandled: false };
}
