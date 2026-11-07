import { ApiError } from '../../../shared/errors/ApiError';
import type { BedFormErrors, BedFormField } from './validateBedForm';

const CONFLICT_STATUS = 409;
const VALIDATION_STATUS = 400;
const PRECONDITION_STATUSES = [412, 428];

const FIELD_KEYS: readonly BedFormField[] = [
  'name',
  'width',
  'height',
  'depth',
  'locationId'
];

export interface MappedBedError {
  readonly fieldErrors: BedFormErrors;
  readonly isConflict: boolean;
  readonly isHandled: boolean;
}

export function isPreconditionConflict(error: unknown): boolean {
  return (
    error instanceof ApiError && PRECONDITION_STATUSES.includes(error.status)
  );
}

function pickFieldErrors(errors: Record<string, string>): BedFormErrors {
  return FIELD_KEYS.reduce<BedFormErrors>((acc, key) => {
    const message = errors[key];
    return message ? { ...acc, [key]: message } : acc;
  }, {});
}

export function mapBedError(error: unknown): MappedBedError {
  if (isPreconditionConflict(error)) {
    return { fieldErrors: {}, isConflict: true, isHandled: true };
  }
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return {
      fieldErrors: { name: 'bed.form.errors.name_duplicate' },
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
