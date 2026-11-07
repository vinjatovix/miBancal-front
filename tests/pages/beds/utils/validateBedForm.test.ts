import { describe, expect, it } from 'vitest';

import {
  validateBedForm,
  type BedFormData
} from '../../../../src/pages/beds/utils/validateBedForm';

const validFormData: BedFormData = {
  name: 'Bancal Tomates',
  width: '120',
  height: '240',
  depth: '30',
  locationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
};

describe('validateBedForm', () => {
  it('returns valid true and no errors for complete valid form data', () => {
    const result = validateBedForm(validFormData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it.each([
    { name: '', expectedError: 'bed.form.errors.name_required' },
    { name: '   ', expectedError: 'bed.form.errors.name_required' },
    { name: 'a'.repeat(201), expectedError: 'bed.form.errors.name_too_long' }
  ])('validates bed name constraints: "$name"', ({ name, expectedError }) => {
    const result = validateBedForm({ ...validFormData, name });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe(expectedError);
  });

  it.each([
    {
      field: 'width' as const,
      value: '',
      expected: 'bed.form.errors.dimension_required'
    },
    {
      field: 'width' as const,
      value: 'abc',
      expected: 'bed.form.errors.dimension_invalid'
    },
    {
      field: 'width' as const,
      value: '0',
      expected: 'bed.form.errors.dimension_min'
    },
    {
      field: 'width' as const,
      value: '-5',
      expected: 'bed.form.errors.dimension_min'
    },
    {
      field: 'height' as const,
      value: '',
      expected: 'bed.form.errors.dimension_required'
    },
    {
      field: 'height' as const,
      value: '0',
      expected: 'bed.form.errors.dimension_min'
    },
    {
      field: 'depth' as const,
      value: '',
      expected: 'bed.form.errors.dimension_required'
    },
    {
      field: 'depth' as const,
      value: '-1',
      expected: 'bed.form.errors.dimension_min'
    }
  ])(
    'validates dimension $field with value "$value"',
    ({ field, value, expected }) => {
      const result = validateBedForm({ ...validFormData, [field]: value });

      expect(result.isValid).toBe(false);
      expect(result.errors[field]).toBe(expected);
    }
  );

  it.each([
    { locationId: '', expectedError: 'bed.form.errors.location_required' },
    { locationId: '   ', expectedError: 'bed.form.errors.location_required' }
  ])('validates locationId requirement', ({ locationId, expectedError }) => {
    const result = validateBedForm({ ...validFormData, locationId });

    expect(result.isValid).toBe(false);
    expect(result.errors.locationId).toBe(expectedError);
  });
});
