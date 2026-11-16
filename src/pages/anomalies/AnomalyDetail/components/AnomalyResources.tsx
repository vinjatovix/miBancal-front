import { t } from '../../../../i18n/core/t';
import SupportResources from '../../../../shared/components/SupportResources/SupportResources';
import type { SupportResource } from '../../../../types/SupportResource';

interface Props {
  readonly resources?: readonly SupportResource[];
}

export function AnomalyResources({ resources }: Props) {
  return (
    <SupportResources
      resources={resources}
      title={t('anomaly.resources.title')}
      videoTitle={t('anomaly.resources.video_title')}
    />
  );
}
