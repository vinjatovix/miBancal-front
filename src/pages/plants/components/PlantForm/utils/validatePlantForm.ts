import { t } from '../../../../../i18n/core/t';
import type { PlantFormState } from '../types';

function isValidNumber(
  value: string,
  minLimit = 0,
  inclusive = false
): boolean {
  const num = Number(value);
  if (value.trim() === '' || Number.isNaN(num)) return false;
  return inclusive ? num >= minLimit : num > minLimit;
}

function validateRange(
  minVal: string,
  maxVal: string,
  minLimit = 0,
  inclusive = false
): string | null {
  if (
    !isValidNumber(minVal, minLimit, inclusive) ||
    !isValidNumber(maxVal, minLimit, inclusive)
  ) {
    return t('plant.form.validation.positive_number');
  }
  if (Number(maxVal) < Number(minVal)) {
    return t('plant.form.validation.invalid_range');
  }
  return null;
}

function validateIdentity(
  state: PlantFormState,
  errors: Record<string, string>
) {
  if (!state.primaryName.trim()) {
    errors.primaryName = t('plant.form.validation.required_field');
  }
  if (!state.scientificName.trim()) {
    errors.scientificName = t('plant.form.validation.required_field');
  }
  if (!state.familyId.trim()) {
    errors.familyId = t('plant.form.validation.family_required');
  }
}

function validateTraits(state: PlantFormState, errors: Record<string, string>) {
  const heightErr = validateRange(state.heightMin, state.heightMax, 0, false);
  if (heightErr) errors.height = heightErr;
  const spreadErr = validateRange(state.spreadMin, state.spreadMax, 0, false);
  if (spreadErr) errors.spread = spreadErr;
  const spacingErr = validateRange(
    state.spacingMin,
    state.spacingMax,
    0,
    false
  );
  if (spacingErr) errors.spacing = spacingErr;
}

function validatePhenology(
  state: PlantFormState,
  errors: Record<string, string>
) {
  if (state.sowingMonths.length === 0) {
    errors.sowingMonths = t('plant.form.validation.sowing_months_required');
  }
  const seedsErr = validateRange(
    state.seedsPerHoleMin,
    state.seedsPerHoleMax,
    0,
    false
  );
  if (seedsErr) errors.seedsPerHole = seedsErr;

  const germErr = validateRange(
    state.germinationDaysMin,
    state.germinationDaysMax,
    0,
    false
  );
  if (germErr) errors.germinationDays = germErr;

  const directErr = validateRange(
    state.directDepthMin,
    state.directDepthMax,
    0,
    true
  );
  if (directErr) errors.directDepth = directErr;

  if (state.starterEnabled) {
    const starterErr = validateRange(
      state.starterDepthMin,
      state.starterDepthMax,
      0,
      true
    );
    if (starterErr) errors.starterDepth = starterErr;
  }
}

function validateResources(
  state: PlantFormState,
  errors: Record<string, string>
) {
  const trimmedUrl = state.imageUrl.trim();
  if (!trimmedUrl) {
    errors.imageUrl = t('plant.form.image.required');
  } else if (!/^https?:\/\//i.test(trimmedUrl)) {
    errors.imageUrl = t('plant.form.image.invalid_url');
  }

  state.videoResources.forEach((video, index) => {
    const vUrl = video.url.trim();
    if (vUrl && !/^https?:\/\//i.test(vUrl)) {
      errors[`videoUrl_${index}`] = t('plant.form.resources.invalid_url');
    }
  });

  state.articleResources.forEach((article, index) => {
    const aUrl = article.url.trim();
    if (aUrl && !/^https?:\/\//i.test(aUrl)) {
      errors[`articleUrl_${index}`] = t('plant.form.resources.invalid_url');
    }
  });
}

function validateKnowledge(
  state: PlantFormState,
  errors: Record<string, string>
) {
  const soilPhErr = validateRange(state.soilPhMin, state.soilPhMax, 0, false);
  if (soilPhErr) errors.soilPh = soilPhErr;
  const soilDepthErr = validateRange(
    state.soilDepthMin,
    state.soilDepthMax,
    0,
    false
  );
  if (soilDepthErr) errors.soilDepth = soilDepthErr;
  const rootDepthErr = validateRange(
    state.rootDepthMin,
    state.rootDepthMax,
    0,
    false
  );
  if (rootDepthErr) errors.rootDepth = rootDepthErr;
  const rootSpreadErr = validateRange(
    state.rootSpreadMin,
    state.rootSpreadMax,
    0,
    false
  );
  if (rootSpreadErr) errors.rootSpread = rootSpreadErr;
}

function validateNotes(state: PlantFormState, errors: Record<string, string>) {
  state.notes.forEach((note, index) => {
    if (note.length > 2000) {
      errors[`note_${index}`] = t('plant.form.notes.too_long');
    }
  });
}

export function validatePlantForm(
  state: PlantFormState
): Record<string, string> {
  const errors: Record<string, string> = {};
  validateIdentity(state, errors);
  validateTraits(state, errors);
  validatePhenology(state, errors);
  validateKnowledge(state, errors);
  validateResources(state, errors);
  validateNotes(state, errors);
  return errors;
}
