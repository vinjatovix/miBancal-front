import { t } from '../../../../../i18n/core/t';
import Icon from '../../../../../shared/components/Icon/Icon';
import type { Location } from '../../../../../types/Location/Location';

import './locationCard.css';

export interface LocationCardProps {
  readonly location: Location;
  readonly onEdit: (location: Location) => void;
  readonly onDelete: (location: Location) => void;
}

export default function LocationCard({
  location,
  onEdit,
  onDelete
}: LocationCardProps) {
  return (
    <article className="location-card" aria-label={location.name}>
      <header className="location-card__header">
        <h2 className="location-card__name">{location.name}</h2>
      </header>

      <div className="location-card__details">
        <div className="location-card__detail-item">
          <span>{t('location.card.coordinates')}:</span>
          <strong>
            {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
          </strong>
        </div>
      </div>

      <footer className="location-card__actions">
        <button
          type="button"
          className="location-card__btn location-card__btn--edit"
          aria-label={t('location.open_edit', { name: location.name })}
          onClick={() => onEdit(location)}
        >
          <Icon name="edit_note" decorative />
          <span>{t('location.card.edit')}</span>
        </button>
        <button
          type="button"
          className="location-card__btn location-card__btn--delete"
          aria-label={t('location.open_delete', { name: location.name })}
          onClick={() => onDelete(location)}
        >
          <Icon name="delete" decorative />
          <span>{t('location.card.delete')}</span>
        </button>
      </footer>
    </article>
  );
}
