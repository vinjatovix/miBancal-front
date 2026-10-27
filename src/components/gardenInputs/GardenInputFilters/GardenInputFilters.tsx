import { useId } from 'react';

import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Icon from '../../../shared/components/Icon/Icon';
import {
  GARDEN_INPUT_ACTIONS,
  GARDEN_INPUT_CATEGORIES,
  type GardenInputAction,
  type GardenInputCategory,
  type GardenInputStatus
} from '../../../types/GardenInput/GardenInput';

import './gardenInputFilters.css';

export interface GardenInputFiltersProps {
  readonly selectedCategories?: readonly GardenInputCategory[];
  readonly selectedActions?: readonly GardenInputAction[];
  readonly selectedStatus?: GardenInputStatus;
  readonly isEditor?: boolean;
  readonly onToggleCategory: (category: GardenInputCategory) => void;
  readonly onToggleAction: (action: GardenInputAction) => void;
  readonly onStatusChange?: (status?: GardenInputStatus) => void;
  readonly onClear: () => void;
  readonly hasActiveFilters: boolean;
}

export default function GardenInputFilters({
  selectedCategories = [],
  selectedActions = [],
  selectedStatus,
  isEditor = false,
  onToggleCategory,
  onToggleAction,
  onStatusChange,
  onClear,
  hasActiveFilters
}: GardenInputFiltersProps) {
  const statusId = useId();

  return (
    <div className="garden-input-filters">
      <div className="garden-input-filters__header">
        <button
          type="button"
          className="garden-input-filters__clear"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          <Icon name="clear_all" decorative />
          <span>{t('gardenInput.filters.clear')}</span>
        </button>
      </div>

      <fieldset className="garden-input-filters__section">
        <legend className="garden-input-filters__label">
          <Icon name="layers" decorative />
          {t('gardenInput.filters.category')}
        </legend>
        <span className="garden-input-filters__hint">
          {t('gardenInput.filters.multi_hint')}
        </span>
        <div className="garden-input-filters__chips">
          {GARDEN_INPUT_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                className={`garden-input-filter-chip ${
                  isSelected ? 'garden-input-filter-chip--active' : ''
                }`}
                aria-pressed={isSelected}
                onClick={() => onToggleCategory(category)}
              >
                {isSelected && (
                  <Icon
                    name="check"
                    decorative
                    className="garden-input-filter-chip__check"
                  />
                )}
                {tValue('gardenInput.categoryValues', category)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="garden-input-filters__section">
        <legend className="garden-input-filters__label">
          <Icon name="bolt" decorative />
          {t('gardenInput.filters.action')}
        </legend>
        <span className="garden-input-filters__hint">
          {t('gardenInput.filters.multi_hint')}
        </span>
        <div className="garden-input-filters__chips">
          {GARDEN_INPUT_ACTIONS.map((action) => {
            const isSelected = selectedActions.includes(action);
            return (
              <button
                key={action}
                type="button"
                className={`garden-input-filter-chip ${
                  isSelected ? 'garden-input-filter-chip--active' : ''
                }`}
                aria-pressed={isSelected}
                onClick={() => onToggleAction(action)}
              >
                {isSelected && (
                  <Icon
                    name="check"
                    decorative
                    className="garden-input-filter-chip__check"
                  />
                )}
                {tValue('gardenInput.actionValues', action)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {isEditor && (
        <div className="garden-input-filters__section">
          <label htmlFor={statusId} className="garden-input-filters__label">
            <Icon name="admin_panel_settings" decorative />
            {t('gardenInput.filters.status')}
          </label>
          <select
            id={statusId}
            className="garden-input-filters__select"
            value={selectedStatus ?? ''}
            onChange={(e) =>
              onStatusChange?.(
                (e.target.value as GardenInputStatus) || undefined
              )
            }
          >
            <option value="">{t('gardenInput.filters.all_statuses')}</option>
            <option value="active">
              {tValue('gardenInput.statusValues', 'active')}
            </option>
            <option value="deleted">
              {tValue('gardenInput.statusValues', 'deleted')}
            </option>
          </select>
        </div>
      )}
    </div>
  );
}
