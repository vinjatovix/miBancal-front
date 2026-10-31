import type { I18nKey } from '../../../../../i18n/core/types';
import type { AnomalyTextListField } from '../../../../../types/Anomaly/Anomaly';

export const LIST_PLACEHOLDER_KEYS: Record<AnomalyTextListField, I18nKey> = {
  symptoms: 'anomaly.form.fields.symptoms_placeholder',
  damage: 'anomaly.form.fields.damage_placeholder',
  causes: 'anomaly.form.fields.causes_placeholder',
  affectedCrops: 'anomaly.form.fields.affectedCrops_placeholder',
  prevention: 'anomaly.form.fields.prevention_placeholder',
  treatment: 'anomaly.form.fields.treatment_placeholder',
  naturalEnemies: 'anomaly.form.fields.naturalEnemies_placeholder'
};

export const LIST_LABEL_KEYS: Record<AnomalyTextListField, I18nKey> = {
  symptoms: 'anomaly.sections.symptoms',
  damage: 'anomaly.sections.damage',
  causes: 'anomaly.sections.causes',
  affectedCrops: 'anomaly.sections.affectedCrops',
  prevention: 'anomaly.sections.prevention',
  treatment: 'anomaly.sections.treatment',
  naturalEnemies: 'anomaly.sections.naturalEnemies'
};
