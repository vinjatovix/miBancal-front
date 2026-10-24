import { t } from '../../../../i18n/core/t';
import type { I18nKey } from '../../../../i18n/core/types';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import type { IconName } from '../../../../shared/components/Icon/iconPaths';
import {
  ANOMALY_TEXT_LIST_FIELDS,
  type Anomaly,
  type AnomalyTextListField
} from '../../../../types/Anomaly/Anomaly';

import './anomalySections.css';

interface Props {
  readonly anomaly: Anomaly;
}

const LIST_SECTION_ICONS: Record<AnomalyTextListField, IconName> = {
  symptoms: 'warning',
  damage: 'dangerous',
  causes: 'science',
  affectedCrops: 'potted_plant',
  prevention: 'shield',
  treatment: 'check_circle',
  naturalEnemies: 'spa'
};

function listTitle(field: AnomalyTextListField): string {
  return t(`anomaly.sections.${field}` satisfies I18nKey);
}

export function AnomalySections({ anomaly }: Props) {
  const lists = ANOMALY_TEXT_LIST_FIELDS.filter(
    (field) => (anomaly[field]?.length ?? 0) > 0
  );

  if (!anomaly.description && lists.length === 0) {
    return (
      <p className="anomaly-sections__empty">{t('anomaly.detail.no_data')}</p>
    );
  }

  return (
    <>
      {anomaly.description && (
        <BodySection
          title={t('anomaly.sections.description')}
          icon="description"
        >
          <p>{anomaly.description}</p>
        </BodySection>
      )}

      {lists.map((field) => (
        <BodySection
          key={field}
          title={listTitle(field)}
          icon={LIST_SECTION_ICONS[field]}
        >
          <ul className="anomaly-sections__list">
            {anomaly[field]?.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </BodySection>
      ))}
    </>
  );
}
