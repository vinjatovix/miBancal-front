import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import InfoRow from './InfoRow';
import SeasonsRow from './SeasonsRow';

interface Props {
  readonly method: string;
  readonly seasons?: readonly string[];
  readonly bestPractices?: string[];
}

export default function PropagationMethodCard({
  method,
  seasons,
  bestPractices
}: Props) {
  return (
    <div className="propagation-card" data-testid={`propagation-${method}`}>
      <InfoRow
        icon="science"
        label={t('plant.cultivation.propagation.method')}
        value={tValue('plant.cultivation.propagation.methodValues', method)}
      />

      <SeasonsRow seasons={seasons} />

      {bestPractices && bestPractices.length > 0 && (
        <InfoRow
          icon="push_pin"
          label={t('plant.cultivation.propagation.best_practices')}
          value={
            <ul className="propagation-card__list">
              {bestPractices.map((bp) => (
                <li key={bp}>{bp}</li>
              ))}
            </ul>
          }
        />
      )}
    </div>
  );
}
