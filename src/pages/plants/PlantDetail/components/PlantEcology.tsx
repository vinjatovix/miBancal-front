import { t } from '../../../../i18n/core/t';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import Icon from '../../../../shared/components/Icon/Icon';
import type { Plant } from '../../../../types/Plants/Plant';

import './plantEcology.css';

interface Props {
  readonly plant: Plant;
}

export default function PlantEcology({ plant }: Props) {
  const benefits = plant.knowledge.ecology.strategicBenefits;

  if (!benefits.length) {
    return null;
  }

  return (
    <BodySection title={t('plant.ecology.title')} icon="eco">
      <ul className="plant-list plant-list--ecology">
        {benefits.map((benefit) => (
          <li key={benefit}>
            <Icon name="eco" decorative /> {benefit}
          </li>
        ))}
      </ul>
    </BodySection>
  );
}
