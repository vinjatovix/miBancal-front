import { t } from '../../../../i18n/core/t';
import SupportResources from '../../../../shared/components/SupportResources/SupportResources';
import type { SupportResource } from '../../../../types/SupportResource';

interface Props {
  readonly resources?: readonly SupportResource[];
}

export function GardenInputResources({ resources }: Props) {
  return (
    <SupportResources
      resources={resources}
      title={t('gardenInput.resources.title')}
      videoTitle={t('gardenInput.resources.video_title')}
    />
  );
}
