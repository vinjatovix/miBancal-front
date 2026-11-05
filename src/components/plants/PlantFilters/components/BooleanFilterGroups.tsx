import { useId } from 'react';

import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';

import ToggleGroup from '../../ToggleGroup';
import { BOOLEAN_FILTERS, BOOLEAN_FILTER_ANY } from '../config/filters.config';

type BooleanFilterKey = (typeof BOOLEAN_FILTERS)[number]['key'];

interface Props {
  readonly values: Readonly<Record<BooleanFilterKey, string | undefined>>;
  readonly onChange: (key: BooleanFilterKey, value?: string) => void;
}

export default function BooleanFilterGroups({ values, onChange }: Props) {
  const hintId = useId();

  return (
    <>
      {BOOLEAN_FILTERS.map((filter) => (
        <ToggleGroup
          key={filter.key}
          icon={filter.icon}
          label={t(filter.labelKey)}
          options={filter.options}
          value={values[filter.key] ?? BOOLEAN_FILTER_ANY}
          describedBy={hintId}
          onChange={(value) =>
            onChange(
              filter.key,
              value === BOOLEAN_FILTER_ANY ? undefined : value
            )
          }
          renderLabel={(value) => tValue(filter.valuesGroup, value)}
        />
      ))}

      <p id={hintId} className="plant-filters__hint">
        {t('plant.filters.boolean_no_hint')}
      </p>
    </>
  );
}
