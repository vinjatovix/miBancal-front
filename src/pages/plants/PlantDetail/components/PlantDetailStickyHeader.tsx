import { useContext } from 'react';

import { t } from '../../../../i18n/core/t';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import Badge from '../../../../shared/components/Badge/Badge';
import Icon from '../../../../shared/components/Icon/Icon';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { Plant } from '../../../../types/Plants/Plant';
import PlantSafetyIndicators from '../../components/PlantSafetyIndicators/PlantSafetyIndicators';
import { readPlantSafety } from '../../utils/plantSafety';

import './plantDetailStickyHeader.css';

interface Props {
  readonly plant: Plant;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly isEditing?: boolean;
  readonly isDeleting?: boolean;
}

export const PlantDetailStickyHeader = ({
  plant,
  onEdit,
  onDelete,
  isEditing,
  isDeleting
}: Props) => {
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;

  return (
    <div className="plant-detail__sticky-header">
      <div className="plant-detail__sticky-heading">
        <h1 className="plant-detail__sticky-title">
          {capitalizeFirstLetter(plant.identity.name.primary)}
        </h1>
        <PlantSafetyIndicators safety={readPlantSafety(plant)} />
        {isEditor && !isEditing && (
          <div className="plant-detail__sticky-actions">
            {onEdit && (
              <button
                type="button"
                className="plant-detail__sticky-edit-btn"
                onClick={onEdit}
                aria-label={t('plant.detail.edit_plant')}
              >
                <Icon name="edit_note" decorative />
                <span>{t('plant.detail.edit_plant')}</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="plant-detail__sticky-delete-btn"
                onClick={onDelete}
                disabled={isDeleting}
                aria-label={t('plant.detail.delete_plant')}
              >
                <Icon name="delete" decorative />
                <span>
                  {isDeleting
                    ? t('common.deleting')
                    : t('plant.detail.delete_plant')}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {plant.identity.name.aliases.length > 0 && (
        <div className="plant-detail__sticky-aliases">
          {plant.identity.name.aliases.map((alias) => (
            <Badge key={alias} variant="alias" icon="label">
              {capitalizeFirstLetter(alias)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
