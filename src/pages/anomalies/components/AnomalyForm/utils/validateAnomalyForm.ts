import { t } from '../../../../../i18n/core/t';
import {
  ANOMALY_CATEGORIES,
  ANOMALY_TEXT_LIST_FIELDS
} from '../../../../../types/Anomaly/Anomaly';
import { isAnomalySlug } from '../../../../../shared/utils/isAnomalySlug';
import {
  ANOMALY_CONFUSED_SLUG_MAX_LENGTH,
  ANOMALY_MAX_CONFUSED_SLUGS,
  ANOMALY_MAX_RESOURCES,
  ANOMALY_NAME_MAX_LENGTH,
  ANOMALY_RESOURCE_URL_MAX_LENGTH,
  ANOMALY_TEXT_MAX_LENGTH,
  type AnomalyFormMode,
  type AnomalyFormState
} from '../types';
import { splitLines } from './anomalyFormLines';

type Errors = Record<string, string>;

const RESOURCE_URL_REGEX = /^https?:\/\//;

function isValidResourceUrl(url: string): boolean {
  return (
    url.length <= ANOMALY_RESOURCE_URL_MAX_LENGTH &&
    RESOURCE_URL_REGEX.test(url)
  );
}

function validateSlug(state: AnomalyFormState, errors: Errors) {
  if (!isAnomalySlug(state.slug.trim())) {
    errors.slug = t('anomaly.form.validation.invalid_slug');
  }
}

function validateName(state: AnomalyFormState, errors: Errors) {
  const name = state.name.trim();
  if (!name) {
    errors.name = t('anomaly.form.validation.required_field');
  } else if (name.length > ANOMALY_NAME_MAX_LENGTH) {
    errors.name = t('anomaly.form.validation.name_too_long');
  }
}

function validateCategory(state: AnomalyFormState, errors: Errors) {
  if (state.category === '') {
    errors.category = t('anomaly.form.validation.required_field');
  } else if (!ANOMALY_CATEGORIES.includes(state.category)) {
    errors.category = t('anomaly.form.validation.invalid_category');
  }
}

function validateOptionalTexts(state: AnomalyFormState, errors: Errors) {
  if (state.scientificName.trim().length > ANOMALY_NAME_MAX_LENGTH) {
    errors.scientificName = t('anomaly.form.validation.name_too_long');
  }
  if (state.description.trim().length > ANOMALY_TEXT_MAX_LENGTH) {
    errors.description = t('anomaly.form.validation.text_too_long');
  }
}

function validateLists(state: AnomalyFormState, errors: Errors) {
  ANOMALY_TEXT_LIST_FIELDS.forEach((field) => {
    if (
      splitLines(state[field]).some((l) => l.length > ANOMALY_TEXT_MAX_LENGTH)
    ) {
      errors[field] = t('anomaly.form.validation.list_line_too_long');
    }
  });
}

function validateResources(state: AnomalyFormState, errors: Errors) {
  const images = state.images.filter((img) => img.url.trim() !== '');
  const videos = state.videoResources.filter((v) => v.url.trim() !== '');
  const articles = state.articleResources.filter((a) => a.url.trim() !== '');

  const totalCount = images.length + videos.length + articles.length;
  if (totalCount > ANOMALY_MAX_RESOURCES) {
    errors.resources = t('anomaly.form.validation.resources_max');
    return;
  }

  const allUrls = [...images, ...videos, ...articles].map((r) => r.url.trim());
  const hasInvalidUrl = allUrls.some((url) => !isValidResourceUrl(url));
  if (hasInvalidUrl) {
    errors.resources = t('anomaly.form.validation.invalid_resource_url');
  }
}

function validateConfusedWith(state: AnomalyFormState, errors: Errors) {
  const rawLines = splitLines(state.confusedWithInput);
  const slugs = rawLines.map((line) => line.trim()).filter(Boolean);

  if (slugs.length === 0) {
    return;
  }

  if (slugs.length > ANOMALY_MAX_CONFUSED_SLUGS) {
    errors.confusedWith = t('anomaly.form.validation.confused_slug_max');
    return;
  }

  const currentSlug = state.slug.trim();
  if (currentSlug !== '' && slugs.includes(currentSlug)) {
    errors.confusedWith = t('anomaly.form.validation.confused_slug_self');
    return;
  }

  const hasInvalidSlug = slugs.some(
    (slug) =>
      !isAnomalySlug(slug) || slug.length > ANOMALY_CONFUSED_SLUG_MAX_LENGTH
  );
  if (hasInvalidSlug) {
    errors.confusedWith = t('anomaly.form.validation.invalid_confused_slug');
  }
}

export function validateAnomalyForm(
  state: AnomalyFormState,
  mode: AnomalyFormMode
): Errors {
  const errors: Errors = {};
  if (mode === 'create') validateSlug(state, errors);
  validateName(state, errors);
  validateCategory(state, errors);
  validateOptionalTexts(state, errors);
  validateLists(state, errors);
  validateResources(state, errors);
  validateConfusedWith(state, errors);
  return errors;
}
