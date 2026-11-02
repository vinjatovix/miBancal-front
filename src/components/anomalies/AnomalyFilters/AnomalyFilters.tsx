import { useId } from 'react';

import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Icon from '../../../shared/components/Icon/Icon';
import Select from '../../../shared/components/Select/Select';
import { ANOMALY_CATEGORIES } from '../../../types/Anomaly/Anomaly';

import './anomalyFilters.css';

interface Props {
  readonly category: string;
  readonly onCategoryChange: (category: string) => void;
  readonly onClear: () => void;
}

export default function AnomalyFilters({
  category,
  onCategoryChange,
  onClear
}: Props) {
  const categoryId = useId();

  return (
    <div className="anomaly-filters">
      <div className="anomaly-filters__header">
        <button
          type="button"
          className="anomaly-filters__clear"
          onClick={onClear}
        >
          <Icon name="clear_all" decorative /> {t('anomaly.filters.clear')}
        </button>
      </div>

      <div className="anomaly-filters__group">
        <label htmlFor={categoryId}>
          <Icon name="crisis_alert" decorative />{' '}
          {t('anomaly.filters.category')}
        </label>
        <Select
          id={categoryId}
          className="anomaly-filters__input"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          placeholder={t('anomaly.filters.category_any')}
          options={ANOMALY_CATEGORIES.map((value) => ({
            value,
            label: tValue('anomaly.categoryValues', value)
          }))}
        />
      </div>
    </div>
  );
}
