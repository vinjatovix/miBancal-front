export interface BedFormData {
  readonly name: string;
  readonly width: string;
  readonly height: string;
  readonly depth: string;
  readonly locationId: string;
}

export type BedFormField = keyof BedFormData;

export type BedFormErrors = Partial<Record<BedFormField, string>>;

export interface BedValidationResult {
  readonly isValid: boolean;
  readonly errors: BedFormErrors;
}

function validateDimension(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'bed.form.errors.dimension_required';
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return 'bed.form.errors.dimension_invalid';
  }
  if (parsed <= 0) {
    return 'bed.form.errors.dimension_min';
  }
  return undefined;
}

export function validateBedForm(data: BedFormData): BedValidationResult {
  const errors: BedFormErrors = {};

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = 'bed.form.errors.name_required';
  } else if (trimmedName.length > 200) {
    errors.name = 'bed.form.errors.name_too_long';
  }

  const widthError = validateDimension(data.width);
  if (widthError) {
    errors.width = widthError;
  }

  const heightError = validateDimension(data.height);
  if (heightError) {
    errors.height = heightError;
  }

  const depthError = validateDimension(data.depth);
  if (depthError) {
    errors.depth = depthError;
  }

  const trimmedLocationId = data.locationId.trim();
  if (!trimmedLocationId) {
    errors.locationId = 'bed.form.errors.location_required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
