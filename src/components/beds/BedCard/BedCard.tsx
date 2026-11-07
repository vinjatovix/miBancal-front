import type React from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import Badge from '../../../shared/components/Badge/Badge';
import Icon from '../../../shared/components/Icon/Icon';
import type { Bed } from '../../../types/Bed/Bed';

import './bedCard.css';

export interface BedCardProps {
  readonly bed: Bed;
}

export default function BedCard({ bed }: BedCardProps): React.JSX.Element {
  const largo = Math.max(bed.width, bed.height);
  const ancho = Math.min(bed.width, bed.height);
  const viewDetailLabel = t('bed.card.view_detail', { name: bed.name });
  const dimensionsText = t('bed.card.dimensions', {
    width: largo,
    height: ancho,
    depth: bed.depth
  });

  return (
    <article className="bed-card" aria-label={bed.name}>
      <header className="bed-card__header">
        <h2 className="bed-card__title">{bed.name}</h2>
        {bed.location?.name ? (
          <Badge variant="default" icon="yard">
            {bed.location.name}
          </Badge>
        ) : (
          <span className="bed-card__no-location">
            {t('bed.card.no_location')}
          </span>
        )}
      </header>

      <div className="bed-card__details">
        <div className="bed-card__detail-item">
          <Icon name="straighten" decorative className="bed-card__icon" />
          <span className="bed-card__dimension-text">{dimensionsText}</span>
        </div>
      </div>

      <footer className="bed-card__footer">
        <span className="bed-card__action-text">{viewDetailLabel}</span>
        <Icon
          name="chevron_right"
          decorative
          className="bed-card__action-icon"
        />
      </footer>

      <Link
        to={`/beds/${bed.id}`}
        className="bed-card__link"
        aria-label={viewDetailLabel}
      />
    </article>
  );
}
