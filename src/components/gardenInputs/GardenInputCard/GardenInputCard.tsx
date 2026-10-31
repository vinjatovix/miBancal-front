import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Badge from '../../../shared/components/Badge/Badge';
import { capitalizeFirstLetter } from '../../../shared/utils/capitalizeFirstLetter';
import type { GardenInputListItem } from '../../../types/GardenInput/GardenInput';
import GardenInputStatusBadge from '../GardenInputStatusBadge/GardenInputStatusBadge';

import './gardenInputCard.css';

export interface GardenInputCardProps {
  readonly gardenInput: GardenInputListItem;
}

export default function GardenInputCard({ gardenInput }: GardenInputCardProps) {
  return (
    <Link
      to={`/garden-inputs/${gardenInput.slug}`}
      className="garden-input-card"
      aria-label={t('gardenInput.open_detail', { name: gardenInput.name })}
    >
      <div className="garden-input-card__header">
        <h2 className="garden-input-card__name">
          {capitalizeFirstLetter(gardenInput.name)}
        </h2>
        <GardenInputStatusBadge status={gardenInput.status} />
      </div>

      <div className="garden-input-card__meta">
        <div className="garden-input-card__meta-row">
          <span className="garden-input-card__meta-label">
            {t('gardenInput.meta.category')}
          </span>
          <Badge variant="family">
            {tValue('gardenInput.categoryValues', gardenInput.category)}
          </Badge>
        </div>

        {gardenInput.actions && gardenInput.actions.length > 0 && (
          <div className="garden-input-card__meta-row">
            <span className="garden-input-card__meta-label">
              {t('gardenInput.meta.action')}
            </span>
            <div className="garden-input-card__meta-badges">
              {gardenInput.actions.map((action) => (
                <Badge key={action} variant="default">
                  {tValue('gardenInput.actionValues', action)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {gardenInput.description && (
        <p className="garden-input-card__description">
          {gardenInput.description}
        </p>
      )}
    </Link>
  );
}
