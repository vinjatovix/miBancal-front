import { monthNames } from '../../../../i18n/core/monthNames';
import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import { mapMonth } from '../../../../shared/utils/mapMonth';

interface Props {
  readonly hemisphere: 'north' | 'south';
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export default function MonthSelector({ hemisphere, value, onChange }: Props) {
  return (
    <fieldset className="plant-filters__group">
      <legend className="plant-filters__label">
        <Icon name="calendar_today" decorative />{' '}
        {t('plant.filters.sowingMonths')}
      </legend>

      <div className="plant-filters__buttons">
        {monthNames().map(({ displayMonth, short, long }) => {
          const backendMonth = mapMonth(displayMonth, hemisphere);

          const active = value === String(backendMonth);

          return (
            <button
              data-testid={`month-button-${displayMonth}`}
              key={displayMonth}
              type="button"
              aria-label={long}
              className={
                active
                  ? 'plant-filters__toggle plant-filters__toggle--active'
                  : 'plant-filters__toggle'
              }
              onClick={() => onChange(active ? '' : String(backendMonth))}
            >
              {short}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
