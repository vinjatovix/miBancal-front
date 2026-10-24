import { MONTH_KEYS } from '../../shared/constants/months';
import { t } from './t';

export interface MonthName {
  readonly displayMonth: number;
  readonly short: string;
  readonly long: string;
}

export function monthNames(): readonly MonthName[] {
  return MONTH_KEYS.map((key, index) => ({
    displayMonth: index + 1,
    short: t(`common.months.short.${key}`),
    long: t(`common.months.long.${key}`)
  }));
}
