import { monthNames } from '../../../../i18n/core/monthNames';
import { mapMonth } from '../../../../shared/utils/mapMonth';

import './monthChips.css';

interface Props {
  readonly months: number[];
  readonly hemisphere: 'north' | 'south';
}

export default function MonthChips({ months, hemisphere }: Props) {
  return (
    <div className="month-chips">
      {monthNames().map(({ displayMonth, short, long }) => {
        const backendMonth = mapMonth(displayMonth, hemisphere);

        const active = months.includes(backendMonth);

        return (
          <span
            key={displayMonth}
            className={active ? 'month-chip month-chip--active' : 'month-chip'}
          >
            <span aria-hidden="true">{short}</span>
            <span className="sr-only">{long}</span>
          </span>
        );
      })}
    </div>
  );
}
