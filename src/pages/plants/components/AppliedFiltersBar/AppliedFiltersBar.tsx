import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import type { ActiveFilter } from '../../utils/buildActiveFilters';

import './appliedFiltersBar.css';

interface Props {
  readonly filters: readonly ActiveFilter[];
  readonly onRemove: (filter: ActiveFilter) => void;
  readonly onClearAll: () => void;
}

export default function AppliedFiltersBar({
  filters,
  onRemove,
  onClearAll
}: Props) {
  if (filters.length === 0) return null;

  return (
    <section className="applied-filters" aria-label={t('plant.applied.title')}>
      <span className="applied-filters__title">{t('plant.applied.title')}</span>

      <ul className="applied-filters__list">
        {filters.map((filter) => (
          <li key={filter.id} className="applied-filters__chip">
            <span className="applied-filters__label">{filter.label}</span>
            <button
              type="button"
              className="applied-filters__remove"
              aria-label={t('plant.applied.remove', { label: filter.label })}
              onClick={() => onRemove(filter)}
            >
              <Icon name="close" decorative />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="applied-filters__clear-all"
        onClick={onClearAll}
      >
        {t('plant.applied.clear_all')}
      </button>
    </section>
  );
}
