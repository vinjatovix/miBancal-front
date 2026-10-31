import { useContext } from 'react';

import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import Badge from '../../../../shared/components/Badge/Badge';
import Icon from '../../../../shared/components/Icon/Icon';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { GardenInput } from '../../../../types/GardenInput/GardenInput';
import GardenInputStatusBadge from '../../../../components/gardenInputs/GardenInputStatusBadge/GardenInputStatusBadge';

import './gardenInputHero.css';

export interface GardenInputHeroProps {
  readonly gardenInput: GardenInput;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
}

export default function GardenInputHero({
  gardenInput,
  onEdit,
  onDelete
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

        {isEditor && (
          <div className="garden-input-hero__actions">
            {onEdit && (
              <button
                type="button"
                className="garden-input-hero__btn"
                onClick={onEdit}
                aria-label={t('gardenInput.detail.edit')}
              >
                <Icon name="edit_note" decorative />
                <span>{t('gardenInput.detail.edit')}</span>
              </button>
            )}
            {onDelete && !isDeleted && (
              <button
                type="button"
                className="garden-input-hero__btn garden-input-hero__btn--danger"
                onClick={onDelete}
                aria-label={t('gardenInput.detail.delete')}
              >
                <Icon name="delete" decorative />
                <span>{t('gardenInput.detail.delete')}</span>
              </button>
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
