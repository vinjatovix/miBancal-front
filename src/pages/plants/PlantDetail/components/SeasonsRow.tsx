import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import { orderSeasons } from '../../../../shared/utils/orderSeasons';
import InfoRow from './InfoRow';

interface Props {
  readonly seasons?: readonly string[];
}

export default function SeasonsRow({ seasons }: Props) {
  const ordered = orderSeasons(seasons);

  if (ordered.length === 0) {
    return null;
  }

  return (
    <InfoRow
      icon="calendar_today"
      label={t('plant.calendar.season')}
      value={ordered
        .map((season) => tValue('plant.calendar.seasonValues', season))
        .join(', ')}
    />
  );
}
