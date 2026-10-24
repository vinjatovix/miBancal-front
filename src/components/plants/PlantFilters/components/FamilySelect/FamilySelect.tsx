import { useId, useMemo } from 'react';

import { t } from '../../../../../i18n/core/t';
import Icon from '../../../../../shared/components/Icon/Icon';
import { toUiError } from '../../../../../shared/errors/toUiError';
import { useFamilies } from '../../../../../shared/hooks/useFamilies';
import { getQueryViewState } from '../../../../../shared/reactQuery/queryViewState';
import { capitalizeFirstLetter } from '../../../../../shared/utils/capitalizeFirstLetter';
import type { FamilyListItem } from '../../../../../types/Family';

interface Props {
  readonly value: string;
  readonly onChange: (id: string) => void;
}

const NO_FAMILIES: FamilyListItem[] = [];

function sortByName(families: FamilyListItem[]): FamilyListItem[] {
  return [...families].sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  );
}

interface FamilySelectErrorProps {
  readonly id: string;
  readonly error: unknown;
  readonly onRetry: () => void;
}

function FamilySelectError({ id, error, onRetry }: FamilySelectErrorProps) {
  const canRetry = toUiError(error).kind !== 'forbidden';

  return (
    <div className="plant-filters__error">
      <p id={id} role="alert" className="plant-filters__error-message">
        {t('family.select_error')}
      </p>
      {canRetry && (
        <button
          type="button"
          className="plant-filters__clear"
          onClick={onRetry}
        >
          {t('errors.actions.retry')}
        </button>
      )}
    </div>
  );
}

export default function FamilySelect({ value, onChange }: Props) {
  const query = useFamilies();
  const viewState = getQueryViewState(query);
  const selectId = useId();
  const errorId = useId();
  const families = query.data ?? NO_FAMILIES;

  const sortedFamilies = useMemo(() => sortByName(families), [families]);
  const isLoading = viewState === 'loading';
  const hasError = viewState === 'error';

  return (
    <div className="plant-filters__group">
      <label htmlFor={selectId}>
        <Icon name="biotech" decorative /> {t('plant.filters.family')}
      </label>

      {viewState === 'success' && (
        <span className="plant-filters__families-count">
          {t('plant.filters.families_count', { n: sortedFamilies.length })}
        </span>
      )}

      <select
        id={selectId}
        data-testid="family-select"
        className="plant-filters__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={viewState !== 'success'}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      >
        {isLoading ? (
          <option value="">{t('common.loading')}</option>
        ) : (
          <option value="">{t('plant.filters.allFamilies')}</option>
        )}
        {sortedFamilies.map((f) => (
          <option key={f.id} value={f.id}>
            {capitalizeFirstLetter(f.name)}
          </option>
        ))}
      </select>

      {hasError && (
        <FamilySelectError
          id={errorId}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      )}
    </div>
  );
}
