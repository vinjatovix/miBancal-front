import { useContext } from 'react';

import GardenInputStatusBadge from '../../../../components/gardenInputs/GardenInputStatusBadge/GardenInputStatusBadge';
import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import {
  DeleteButton,
  EditButton
} from '../../../../shared/components/ActionButtons';
import Badge from '../../../../shared/components/Badge/Badge';
import Icon from '../../../../shared/components/Icon/Icon';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { GardenInput } from '../../../../types/GardenInput/GardenInput';

import './gardenInputHero.css';

export interface GardenInputHeroProps {
  readonly gardenInput: GardenInput;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly isEditing?: boolean;
}

export default function GardenInputHero({
  gardenInput,
  onEdit,
  onDelete,
  isEditing
}: GardenInputHeroProps) {
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const isDeleted = gardenInput.status === 'deleted';

  return (
    <header className="garden-input-hero">
      <div className="garden-input-hero__header">
        <h1 className="garden-input-hero__title">
          {capitalizeFirstLetter(gardenInput.name)}
        </h1>

        {isEditor && !isEditing && (
          <div className="garden-input-hero__actions">
            {onEdit && (
              <EditButton
                onClick={onEdit}
                ariaLabel={t('gardenInput.detail.edit')}
                label={t('gardenInput.detail.edit')}
              />
            )}
            {onDelete && !isDeleted && (
              <DeleteButton
                onClick={onDelete}
                ariaLabel={t('gardenInput.detail.delete')}
                label={t('gardenInput.detail.delete')}
              />
            )}
          </div>
        )}
      </div>

      <div className="garden-input-hero__badges">
        <div className="garden-input-hero__badge-row">
          <span className="garden-input-hero__badge-label">
            {t('gardenInput.meta.category')}
          </span>
          <Badge variant="family">
            {tValue('gardenInput.categoryValues', gardenInput.category)}
          </Badge>
          <GardenInputStatusBadge status={gardenInput.status} />
        </div>

        {gardenInput.actions && gardenInput.actions.length > 0 && (
          <div className="garden-input-hero__badge-row">
            <span className="garden-input-hero__badge-label">
              {t('gardenInput.meta.action')}
            </span>
            <div className="garden-input-hero__badge-group">
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
        <p className="garden-input-hero__description">
          {gardenInput.description}
        </p>
      )}

      {gardenInput.activeIngredients &&
        gardenInput.activeIngredients.length > 0 && (
          <div className="garden-input-hero__info-group">
            <span className="garden-input-hero__info-label">
              <Icon name="biotech" decorative />
              <strong>{t('gardenInput.detail.active_ingredients')}:</strong>
            </span>
            <span className="garden-input-hero__info-value">
              {gardenInput.activeIngredients.join(', ')}
            </span>
          </div>
        )}

      {gardenInput.nutrients && gardenInput.nutrients.length > 0 && (
        <div className="garden-input-hero__info-group">
          <span className="garden-input-hero__info-label">
            <Icon name="eco" decorative />
            <strong>{t('gardenInput.detail.nutrients')}:</strong>
          </span>
          <span className="garden-input-hero__info-value">
            {gardenInput.nutrients.join(', ')}
          </span>
        </div>
      )}

      {gardenInput.targets && gardenInput.targets.length > 0 && (
        <div className="garden-input-hero__info-group">
          <span className="garden-input-hero__info-label">
            <Icon name="check_circle" decorative />
            <strong>{t('gardenInput.detail.targets')}:</strong>
          </span>
          <span className="garden-input-hero__info-value">
            {gardenInput.targets.join(', ')}
          </span>
        </div>
      )}
    </header>
  );
}
