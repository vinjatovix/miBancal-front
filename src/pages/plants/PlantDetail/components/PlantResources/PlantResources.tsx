import { t } from '../../../../../i18n/core/t';
import SupportResources from '../../../../../shared/components/SupportResources/SupportResources';
import type { Plant } from '../../../../../types/Plants/Plant';

interface Props {
  readonly plant: Plant;
}

export default function PlantResources({ plant }: Props) {
  return (
    <SupportResources
      resources={plant.knowledge.resources}
      title={t('plant.resources.title')}
      videoTitle={t('plant.resources.video_title')}
    />
  );
}
