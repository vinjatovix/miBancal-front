import { t } from '../../../../../i18n/core/t';
import type { FamilyFormState } from '../types';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateBasicFields(
  state: FamilyFormState,
  errors: Record<string, string>
) {
  if (!state.name.trim()) {
    errors.name = t('family.form.validation.required_field');
  }
  if (!state.scientificName.trim()) {
    errors.scientificName = t('family.form.validation.required_field');
  }
  if (!state.shortDescription.trim()) {
    errors.shortDescription = t('family.form.validation.required_field');
  }
}

function validateSlug(slug: string, initialSlug?: string): string | null {
  const trimmed = slug.trim();
  if (!trimmed) {
    return t('family.form.validation.invalid_slug');
  }
  if (initialSlug && trimmed === initialSlug.trim()) {
    return null;
  }
  if (!SLUG_REGEX.test(trimmed)) {
    return t('family.form.validation.invalid_slug');
  }
  return null;
}

function validateSpeciesCount(speciesCount: string): string | null {
  const trimmed = speciesCount.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isInteger(num) || num < 1) {
    return t('family.form.validation.positive_integer');
  }
  return null;
}

export function validateFamilyForm(
  state: FamilyFormState,
  initialSlug?: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  validateBasicFields(state, errors);

  const slugErr = validateSlug(state.slug, initialSlug);
  if (slugErr) errors.slug = slugErr;

  if (state.highlights.length === 0) {
    errors.highlights = t('family.form.validation.highlights_required');
  }

  const speciesErr = validateSpeciesCount(state.speciesCount);
  if (speciesErr) errors.speciesCount = speciesErr;

  return errors;
}
