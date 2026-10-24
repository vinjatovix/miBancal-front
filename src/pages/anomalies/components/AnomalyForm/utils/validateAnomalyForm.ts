import { t } from '../../../../../i18n/core/t';
import {
  ANOMALY_CATEGORIES,
  ANOMALY_TEXT_LIST_FIELDS
} from '../../../../../types/Anomaly/Anomaly';
import { isAnomalySlug } from '../../../../../shared/utils/isAnomalySlug';
import {
  ANOMALY_NAME_MAX_LENGTH,
  ANOMALY_TEXT_MAX_LENGTH,
  type AnomalyFormMode,
  type AnomalyFormState
} from '../types';
import { splitLines } from './anomalyFormLines';

type Errors = Record<string, string>;

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
  return errors;
}
