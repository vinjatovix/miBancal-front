import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import GardenInputCard from '../../components/gardenInputs/GardenInputCard/GardenInputCard';
import { t } from '../../i18n/core/t';
import { AuthContext } from '../../shared/auth/authContextDef';
import { ErrorResponse } from '../../shared/components/ErrorResponse/ErrorResponse';
import Icon from '../../shared/components/Icon/Icon';
import { Loader } from '../../shared/components/Loader/Loader';
import PageSizeSelector from '../../shared/components/PageSizeSelector/PageSizeSelector';
import Pagination from '../../shared/components/Pagination/Pagination';
import PlantSortSelect from '../../shared/components/PlantSortSelect/PlantSortSelect';
import { getQueryViewState } from '../../shared/reactQuery/queryViewState';
import { buildPaginationPages } from '../../shared/utils/pagination';
import { useGardenInputs } from './hooks/useGardenInputs';
import {
  buildGardenInputSortOptions,
  splitGardenInputSortValue
} from './utils/buildGardenInputSortOptions';

import './gardenInputList.css';

interface EmptyProps {
  readonly hasActiveFilters: boolean;
  readonly isBeyondFirstPage: boolean;
  readonly onClearFilters: () => void;
  readonly onGoToFirstPage: () => void;
}

function resolveEmptyAction({
  isBeyondFirstPage,
  hasActiveFilters,
  onGoToFirstPage,
  onClearFilters
}: EmptyProps): { label: string; onClick: () => void } | null {
  if (isBeyondFirstPage) {
    return {
      label: t('gardenInput.go_to_first_page'),
      onClick: onGoToFirstPage
    };
  }
  if (hasActiveFilters) {
    return { label: t('errors.actions.clearFilters'), onClick: onClearFilters };
  }
  return null;
}

function GardenInputListEmpty({
  hasActiveFilters,
  isBeyondFirstPage,
  onClearFilters,
  onGoToFirstPage
}: EmptyProps) {
  const action = resolveEmptyAction({
    isBeyondFirstPage,
    hasActiveFilters,
    onGoToFirstPage,
    onClearFilters
  });

  return (
    <div className="garden-input-list__empty">
      <output className="garden-input-list__empty-message">
        {t(
          hasActiveFilters || isBeyondFirstPage
            ? 'gardenInput.empty'
            : 'gardenInput.empty_catalog'
        )}
      </output>
      {action && (
        <button
          type="button"
          className="garden-input-list__empty-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function GardenInputList() {
  const {
    query,
    request,
    hasActiveFilters,
    setPage,
    goToFirstPage,
    setLimit,
    setSort,
    clearFilters
  } = useGardenInputs();
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const sortOptions = useMemo(() => buildGardenInputSortOptions(), []);
  const viewState = getQueryViewState(query);

  if (viewState === 'loading') return <Loader />;

  if (viewState === 'error') {
    return (
      <ErrorResponse
        error={query.error}
        onRetry={() => void query.refetch()}
        onClearFilters={hasActiveFilters ? clearFilters : undefined}
      />
    );
  }

  const page = request.pagination.page;
  const inputs = query.data?.data ?? [];
  const totalPages = query.data?.pagination.totalPages ?? 0;
  const pages = totalPages > 0 ? buildPaginationPages(page, totalPages) : [];

  return (
    <div className="garden-input-list">
      <div className="garden-input-list__header">
        <h1>{t('gardenInput.title')}</h1>
        {isEditor && (
          <Link
            to="/garden-inputs/new"
            className="garden-input-list__create-btn"
            aria-label={t('gardenInput.catalog.new_garden_input')}
          >
            <Icon name="local_pharmacy" decorative />
            <span>{t('gardenInput.catalog.new_garden_input')}</span>
          </Link>
        )}
      </div>

      <div className="garden-input-list__controls">
        <PlantSortSelect
          label={t('gardenInput.sort.label')}
          value={`${request.sort.field}:${request.sort.direction}`}
          options={sortOptions}
          onChange={(value) => {
            const { field, direction } = splitGardenInputSortValue(value);
            setSort(field, direction);
          }}
        />
        <PageSizeSelector
          label={t('gardenInput.page_size')}
          value={request.pagination.limit}
          onChange={setLimit}
        />
      </div>

      <Pagination pages={pages} currentPage={page} onPageChange={setPage} />

      {inputs.length === 0 ? (
        <GardenInputListEmpty
          hasActiveFilters={hasActiveFilters}
          isBeyondFirstPage={page > 1}
          onClearFilters={clearFilters}
          onGoToFirstPage={goToFirstPage}
        />
      ) : (
        <div className="garden-input-grid" data-testid="garden-inputs-grid">
          {inputs.map((input) => (
            <GardenInputCard key={input.id} gardenInput={input} />
          ))}
        </div>
      )}

      <Pagination pages={pages} currentPage={page} onPageChange={setPage} />
    </div>
  );
}
