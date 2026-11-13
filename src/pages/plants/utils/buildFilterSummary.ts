import { t } from '../../../i18n/core/t';

export function buildFilterSummary(labels: readonly string[]): string {
  if (labels.length === 0) return '';
  return `${t('plant.catalog.summary_prefix')}: ${labels.join(' · ')}`;
}
