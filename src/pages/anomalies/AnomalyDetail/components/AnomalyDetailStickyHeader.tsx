import { useContext } from 'react';

import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import {
  DeleteButton,
  EditButton
} from '../../../../shared/components/ActionButtons';
import Badge from '../../../../shared/components/Badge/Badge';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { Anomaly } from '../../../../types/Anomaly/Anomaly';
import AnomalyStatusBadge from '../../../../components/anomalies/AnomalyStatusBadge/AnomalyStatusBadge';

import './anomalyDetailStickyHeader.css';

interface Props {
  readonly anomaly: Anomaly;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly isEditing?: boolean;
}

export const AnomalyDetailStickyHeader = ({
  anomaly,
  onEdit,
  onDelete,
  isEditing
}: Props) => {
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;

  return (
    <div className="anomaly-detail__sticky-header">
      <div className="anomaly-detail__sticky-heading">
        <h1 className="anomaly-detail__sticky-title">
          {capitalizeFirstLetter(anomaly.name)}
        </h1>
        <div className="anomaly-hero__badges">
          <Badge variant="family">
            {tValue('anomaly.categoryValues', anomaly.category)}
          </Badge>
          <AnomalyStatusBadge status={anomaly.status} />
        </div>
        {isEditor && !isEditing && (
          <div className="anomaly-detail__sticky-actions">
            {onEdit && (
              <EditButton
                onClick={onEdit}
                ariaLabel={t('anomaly.detail.edit')}
                label={t('anomaly.detail.edit')}
              />
            )}
            {onDelete && (
              <DeleteButton
                onClick={onDelete}
                ariaLabel={t('anomaly.detail.delete')}
                label={t('anomaly.detail.delete')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
