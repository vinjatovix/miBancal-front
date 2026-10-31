import { t } from '../../../../i18n/core/t';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import type { Plant } from '../../../../types/Plants/Plant';

import CalendarRow from './CalendarRow';
import HemisphereToggle from './HemisphereToggle';
import InfoRow from './InfoRow';
import MonthChips from './MonthChips';

import './plantCalendar.css';

interface Props {
  readonly plant: Plant;
  readonly hemisphere: 'north' | 'south';
  readonly onHemisphereChange?: (value: 'north' | 'south') => void;
}

export default function PlantCalendar({
  plant,
  hemisphere,
  onHemisphereChange
}: Props) {
  return (
    <BodySection title={t('plant.calendar.title')} icon="calendar_today">
      <div className="plant-calendar__controls">
        {onHemisphereChange && (
          <HemisphereToggle value={hemisphere} onChange={onHemisphereChange} />
        )}
      </div>
      <div className="plant-calendar__grid">
        <InfoRow
          icon="grain"
          label={t('plant.calendar.seeds_per_hole')}
          value={`${plant.phenology.sowing.seedsPerHole.min}-${plant.phenology.sowing.seedsPerHole.max}`}
        />

        <InfoRow
          icon="hourglass_top"
          label={t('plant.calendar.germination')}
          value={`${plant.phenology.sowing.germinationDays.min}-${plant.phenology.sowing.germinationDays.max} ${t('plant.calendar.days')}`}
        />
      </div>
      <CalendarRow icon="potted_plant" label={t('plant.calendar.sowing')}>
        <MonthChips
          months={plant.phenology.sowing.months}
          hemisphere={hemisphere}
        />
      </CalendarRow>

      <CalendarRow icon="local_florist" label={t('plant.calendar.flowering')}>
        <MonthChips
          months={plant.phenology.flowering.months}
          hemisphere={hemisphere}
        />
      </CalendarRow>

      <CalendarRow icon="yard" label={t('plant.calendar.harvest')}>
        <MonthChips
          months={plant.phenology.harvest.months}
          hemisphere={hemisphere}
        />
      </CalendarRow>
    </BodySection>
  );
}
