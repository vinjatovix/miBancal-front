import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import type { PlantSafety as Safety } from '../../utils/plantSafety';

import InfoRow from './InfoRow';

import './plantSafety.css';

interface Props {
  readonly safety: Safety;
}

const PFAF_URL = 'https://pfaf.org';

export default function PlantSafety({ safety }: Props) {
  if (!safety.hasData) {
    return null;
  }

  return (
    <BodySection title={t('plant.safety.title')}>
      <InfoRow
        label={t('plant.safety.edible')}
        value={tValue('plant.safety.flagValues', safety.edible)}
      />

      <InfoRow
        label={t('plant.safety.toxic')}
        value={tValue('plant.safety.flagValues', safety.toxic)}
        className={
          safety.toxic === 'yes' ? 'plant-safety__row--warning' : undefined
        }
      />

      {safety.toxicityNotes && (
        <div className="plant-safety__notes-block">
          <h3 className="plant-safety__subtitle">
            {t('plant.safety.toxicity_notes')}
          </h3>
          <p className="plant-safety__notes">{safety.toxicityNotes}</p>
        </div>
      )}

      <p className="plant-safety__source">
        {t('plant.safety.source')}{' '}
        <a href={PFAF_URL} target="_blank" rel="noopener noreferrer">
          {t('plant.safety.source_name')}
        </a>
      </p>
    </BodySection>
  );
}
