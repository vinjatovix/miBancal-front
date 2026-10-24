import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import type { IconName } from '../../../../shared/components/Icon/iconPaths';
import type { PlantSafety } from '../../utils/plantSafety';

import './plantSafetyIndicators.css';

interface Props {
  readonly safety: PlantSafety;
}

interface IndicatorConfig {
  readonly flag: 'edible' | 'toxic';
  readonly icon: IconName;
  readonly labelKey: 'plant.safety.edible' | 'plant.safety.toxic';
}

const INDICATORS: readonly IndicatorConfig[] = [
  { flag: 'edible', icon: 'restaurant', labelKey: 'plant.safety.edible' },
  { flag: 'toxic', icon: 'dangerous', labelKey: 'plant.safety.toxic' }
] as const;

export default function PlantSafetyIndicators({ safety }: Props) {
  const visible = INDICATORS.filter(({ flag }) => safety[flag] === 'yes');

  if (visible.length === 0) {
    return null;
  }

  return (
    <span className="plant-safety-indicators">
      {visible.map(({ flag, icon, labelKey }) => (
        <span
          key={flag}
          role="img"
          aria-label={t(labelKey)}
          title={t(labelKey)}
          className="plant-safety-indicators__item"
        >
          <Icon name={icon} decorative />
        </span>
      ))}
    </span>
  );
}
