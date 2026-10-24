import { useContext } from 'react';

import AnomalyStatusBadge from '../../../../components/anomalies/AnomalyStatusBadge/AnomalyStatusBadge';
import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import Badge from '../../../../shared/components/Badge/Badge';
import Icon from '../../../../shared/components/Icon/Icon';
import ScientificName from '../../../../shared/components/ScientificName/ScientificName';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { Anomaly } from '../../../../types/Anomaly/Anomaly';

import './anomalyHero.css';

interface Props {
  readonly anomaly: Anomaly;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
}

function formatDeletedAt(deletedAt: string): string {
  return new Date(deletedAt).toLocaleDateString('es-ES');
}

export function AnomalyHero({ anomaly, onEdit, onDelete }: Props) {
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const canDelete = isEditor && onDelete && anomaly.status === 'ACTIVE';

  return (
    <header className="anomaly-hero">
      <div className="anomaly-hero__title-row">
        <h1>{capitalizeFirstLetter(anomaly.name)}</h1>
        <div className="anomaly-hero__actions">
          {isEditor && onEdit && (
            <button
              type="button"
              className="anomaly-hero__btn"
              onClick={onEdit}
              aria-label={t('anomaly.detail.edit')}
            >
              <Icon name="edit_note" decorative />
              <span>{t('anomaly.detail.edit')}</span>
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="anomaly-hero__btn anomaly-hero__btn--danger"
              onClick={onDelete}
              aria-label={t('anomaly.detail.delete')}
            >
              <Icon name="delete" decorative />
              <span>{t('anomaly.detail.delete')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="anomaly-hero__badges">
        <Badge variant="family">
          {tValue('anomaly.categoryValues', anomaly.category)}
        </Badge>
        <AnomalyStatusBadge status={anomaly.status} />
      </div>

      {anomaly.scientificName && (
        <p>
          <Icon name="microscope" decorative />{' '}
          <strong>{t('anomaly.detail.scientific_name')}:</strong>{' '}
          <ScientificName>{anomaly.scientificName}</ScientificName>
        </p>
      )}

      <p>
        <Icon name="tag" decorative />{' '}
        <strong>{t('anomaly.detail.slug')}:</strong> {anomaly.slug}
      </p>

      {anomaly.deletedAt && (
        <p>
          {t('anomaly.detail.deleted_at', {
            date: formatDeletedAt(anomaly.deletedAt)
          })}
        </p>
      )}
    </header>
  );
}
