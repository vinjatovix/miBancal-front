import { t } from '../../../../i18n/core/t';
import {
  getPlantListEmptyState,
  type PlantListEmptyState
} from '../../utils/getPlantListEmptyState';

const EMPTY_STATE_MESSAGE_KEYS = {
  outOfRange: 'plant.emptyState.outOfRange',
  noMatches: 'plant.emptyState.noMatches',
  emptyCatalog: 'plant.emptyState.emptyCatalog'
} as const;

interface PlantListEmptyProps {
  readonly state: PlantListEmptyState;
  readonly onClearFilters: () => void;
  readonly onGoToFirstPage: () => void;
}

function PlantListEmptyAction({
  state,
  onClearFilters,
  onGoToFirstPage
}: PlantListEmptyProps) {
  if (state === 'emptyCatalog') {
    return null;
  }
  const [label, onClick] =
    state === 'noMatches'
      ? [t('errors.actions.clearFilters'), onClearFilters]
      : [t('plant.emptyState.goToFirstPage'), onGoToFirstPage];

  return (
    <button
      type="button"
      className="plant-list__empty-action"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function PlantListEmpty(props: PlantListEmptyProps) {
  return (
    <div className="plant-list__empty">
      <output className="plant-list__empty-message">
        {t(EMPTY_STATE_MESSAGE_KEYS[props.state])}
      </output>
      <PlantListEmptyAction {...props} />
    </div>
  );
}

export function PlantListFavoritesEmpty({
  onGoToAll
}: {
  readonly onGoToAll: () => void;
}) {
  return (
    <div className="plant-list__empty">
      <output className="plant-list__empty-message">
        {t('plant.emptyState.favorites')}
      </output>
      <button
        type="button"
        className="plant-list__empty-action"
        onClick={onGoToAll}
      >
        {t('plant.emptyState.favorites_action')}
      </button>
    </div>
  );
}

export interface PlantListEmptyViewProps {
  readonly favoritesTabActive: boolean;
  readonly hasActiveFilters: boolean;
  readonly page: number;
  readonly totalItems: number;
  readonly onGoToAll: () => void;
  readonly onClearFilters: () => void;
  readonly onGoToFirstPage: () => void;
}

export function PlantListEmptyView({
  favoritesTabActive,
  hasActiveFilters,
  page,
  totalItems,
  onGoToAll,
  onClearFilters,
  onGoToFirstPage
}: PlantListEmptyViewProps) {
  if (
    favoritesTabActive &&
    !hasActiveFilters &&
    !(page > 1 && totalItems > 0)
  ) {
    return <PlantListFavoritesEmpty onGoToAll={onGoToAll} />;
  }

  const state = getPlantListEmptyState({
    page,
    totalItems,
    hasActiveFilters
  });

  return (
    <PlantListEmpty
      state={state}
      onClearFilters={onClearFilters}
      onGoToFirstPage={onGoToFirstPage}
    />
  );
}
