import type { JSX } from 'react';

import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';

export interface LocationLayoutEmptyStateProps {
  readonly hasUnplacedBeds: boolean;
  readonly onPlaceFirstBed: () => void;
  readonly onCreateNewBed: () => void;
}

export default function LocationLayoutEmptyState({
  hasUnplacedBeds,
  onPlaceFirstBed,
  onCreateNewBed
}: LocationLayoutEmptyStateProps): JSX.Element {
  return (
    <div className="location-layout-page__empty">
      <h2 className="location-layout-page__empty-title">
        {t('bed.layout.empty_no_placed')}
      </h2>
      <p className="location-layout-page__empty-desc">
        {hasUnplacedBeds
          ? t('bed.layout.empty_tray_prompt')
          : t('bed.layout.empty_no_unplaced')}
      </p>
      {hasUnplacedBeds ? (
        <Button variant="primary" onClick={onPlaceFirstBed}>
          {t('bed.layout.empty_cta_place')}
        </Button>
      ) : (
        <Button variant="primary" onClick={onCreateNewBed}>
          {t('bed.layout.empty_cta_create')}
        </Button>
      )}
    </div>
  );
}
