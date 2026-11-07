import type React from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import type { Bed } from '../../../types/Bed/Bed';

import './bedTechnicalHeader.css';

export interface BedTechnicalHeaderProps {
  readonly bed: Bed;
}

export default function BedTechnicalHeader({
  bed
}: BedTechnicalHeaderProps): React.JSX.Element {
  const locationName =
    bed.location?.name ?? t('bed.technical_header.no_location');

  const largo = Math.max(bed.width, bed.height);
  const ancho = Math.min(bed.width, bed.height);

  return (
    <header className="bed-technical-header">
      <Link to="/beds" className="bed-technical-header__back-link">
        <Icon name="chevron_left" decorative />
        <span>{t('bed.technical_header.back_link')}</span>
      </Link>
      <div className="bed-technical-header__title-row">
        <h1 className="bed-technical-header__title">{bed.name}</h1>
        <ul className="bed-technical-header__meta-list">
          <li className="bed-technical-header__meta-item bed-technical-header__meta-item--highlight">
            <Icon name="straighten" decorative />
            <span>
              {t('bed.technical_header.dimensions_value', {
                width: largo,
                height: ancho
              })}
            </span>
          </li>
          <li className="bed-technical-header__meta-item">
            <Icon name="layers" decorative />
            <span>
              {t('bed.technical_header.depth_value', { depth: bed.depth })}
            </span>
          </li>
          <li className="bed-technical-header__meta-item">
            <Icon name="yard" decorative />
            <span>{locationName}</span>
          </li>
        </ul>
      </div>
      {bed.locationId && (
        <Link
          to={`/locations/${bed.locationId}/layout`}
          className="bed-technical-header__layout-link"
        >
          <Icon name="explore" decorative />
          <span>{t('bed.technical_header.view_layout')}</span>
        </Link>
      )}
    </header>
  );
}
