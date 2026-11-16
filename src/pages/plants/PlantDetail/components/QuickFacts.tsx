import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import type { Plant } from '../../../../types/Plants/Plant';
import InfoRow from './InfoRow';

interface Props {
  readonly plant: Plant;
}

export default function QuickFacts({ plant }: Props) {
  return (
    <BodySection title={t('plant.quick_facts.title')} icon="bolt">
      <InfoRow
        icon="recycling"
        label={t('plant.quick_facts.lifecycle')}
        value={tValue('plant.filters.lifeCycleValues', plant.traits.lifecycle)}
      />

      <InfoRow
        icon="sunny"
        label={t('plant.quick_facts.light')}
        value={tValue(
          'plant.filters.lightTypeValues',
          plant.knowledge.light.type
        )}
      />

      <InfoRow
        icon="schedule"
        label={t('plant.quick_facts.light_hours')}
        value={t('plant.quick_facts.light_hours_value', {
          hours: plant.knowledge.light.hoursMin
        })}
      />

      <InfoRow
        icon="water_drop"
        label={t('plant.quick_facts.watering')}
        value={plant.knowledge.watering?.frequency}
      />

      <InfoRow
        icon="thermostat"
        label={t('plant.quick_facts.watering_conditions')}
        value={plant.knowledge.watering?.conditions?.join(', ')}
      />

      <InfoRow
        icon="arrow_upward"
        label={t('plant.quick_facts.height')}
        value={`${plant.traits.size.height.min}-${plant.traits.size.height.max} cm`}
      />

      <InfoRow
        icon="sync_alt"
        label={t('plant.quick_facts.spread')}
        value={`${plant.traits.size.spread.min}-${plant.traits.size.spread.max} cm`}
      />

      <InfoRow
        icon="straighten"
        label={t('plant.quick_facts.spacing')}
        value={`${plant.traits.spacingCm.min}-${plant.traits.spacingCm.max} cm`}
      />
    </BodySection>
  );
}
