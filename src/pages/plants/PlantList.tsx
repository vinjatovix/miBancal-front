import { useContext, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { t } from '../../i18n/core/t';

import type { PaginatedResponse } from '../../types/api';
import type { PlantListItem } from '../../types/Plants/Plant';
import { PLANT_LIST_URL_PARAMS } from '../../shared/constants/plantListUrlParams';
import { AuthContext } from '../../shared/auth/authContextDef';
import { useFamilies } from '../../shared/hooks/useFamilies';
import { buildPaginationPages } from '../../shared/utils/pagination';
import { getQueryViewState } from '../../shared/reactQuery/queryViewState';
import Icon from '../../shared/components/Icon/Icon';
import { Loader } from '../../shared/components/Loader/Loader';
import PageSizeSelector from '../../shared/components/PageSizeSelector/PageSizeSelector';
import Pagination from '../../shared/components/Pagination/Pagination';
import PlantSortSelect from '../../shared/components/PlantSortSelect/PlantSortSelect';
import { ErrorResponse } from '../../shared/components/ErrorResponse/ErrorResponse';

import AppliedFiltersBar from './components/AppliedFiltersBar/AppliedFiltersBar';
import CatalogHeader from './components/CatalogHeader/CatalogHeader';
import CatalogTabs from './components/CatalogTabs/CatalogTabs';
import ViewModeToggle from './components/ViewModeToggle/ViewModeToggle';
import {
  persistMode,
  readStoredMode
} from './components/ViewModeToggle/viewMode';
import PlantCard from './PlantCard/PlantCard';
import { PlantListEmptyView } from './components/PlantListEmpty/PlantListEmpty';
import { useCatalogScrollReset } from './hooks/useCatalogScrollReset';
import { usePlants } from './hooks/usePlants';
import { buildActiveFilters } from './utils/buildActiveFilters';
import { buildFilterSummary } from './utils/buildFilterSummary';
import { buildSortOptions, splitSortValue } from './utils/buildSortOptions';
import { withoutListParam } from './utils/plantListParamWrites';

import './plantList.css';

function readHemisphere(params: URLSearchParams): 'north' | 'south' {
  return params.get(PLANT_LIST_URL_PARAMS.hemisphere) === 'south'
    ? 'south'
    : 'north';
}

function readPlantListPage(
  response: PaginatedResponse<PlantListItem> | undefined,
  page: number
) {
  const totalPages = response?.pagination.totalPages ?? 0;
  return {
    plants: response?.data ?? [],
    totalItems: response?.pagination.totalItems ?? 0,
    pages: totalPages > 0 ? buildPaginationPages(page, totalPages) : []
  };
}

export default function PlantList() {
  const {
    query,
    request,
    hasActiveFilters,
    setPage,
    goToFirstPage,
    clearFilters,
    removeFilter,
    setLimit,
    setSort
  } = usePlants();

  const sortOptions = useMemo(() => buildSortOptions(), []);

  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const [viewMode, setViewMode] = useState(readStoredMode);
  const [searchParams, setSearchParams] = useSearchParams();
  const favoritesTabActive = request.filters.bookmarked === 'true';
  const families = useFamilies();
  const hemisphere = readHemisphere(searchParams);
  const familyName = families.data?.find(
    (family) => family.id === request.filters.family
  )?.name;
  const activeFilters = buildActiveFilters(request, { hemisphere, familyName });

  useCatalogScrollReset(request);

  const viewState = getQueryViewState(query);

  if (viewState === 'loading') {
    return <Loader />;
  }

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
  const { plants, totalItems, pages } = readPlantListPage(query.data, page);

  return (
    <div>
      <div className="plant-list__header">
        <h1>{t('plant.plants')}</h1>
        {isEditor && (
          <Link
            to="/plants/new"
            className="plant-list__create-btn"
            aria-label={t('plant.catalog.new_plant')}
          >
            <Icon name="potted_plant" decorative />
            <span>{t('plant.catalog.new_plant')}</span>
          </Link>
        )}
      </div>

      <CatalogTabs />

      <CatalogHeader
        totalItems={totalItems}
        summary={buildFilterSummary(
          activeFilters.map((filter) => filter.label)
        )}
      />

      <div className="plant-controls">
        <PlantSortSelect
          label={t('plant.orders.sort_label')}
          value={`${request.sort.field}:${request.sort.direction}`}
          options={sortOptions}
          onChange={(value) => {
            const { field, direction } = splitSortValue(value);
            setSort(field, direction);
          }}
        />

        <PageSizeSelector
          label={t('plant.filters.page_size')}
          value={request.pagination.limit}
          onChange={setLimit}
        />

        <ViewModeToggle
          value={viewMode}
          onChange={(next) => {
            setViewMode(next);
            persistMode(next);
          }}
        />
      </div>

      <AppliedFiltersBar
        filters={activeFilters}
        onRemove={removeFilter}
        onClearAll={clearFilters}
      />

      <Pagination pages={pages} currentPage={page} onPageChange={setPage} />

      {plants.length === 0 ? (
        <PlantListEmptyView
          favoritesTabActive={favoritesTabActive}
          hasActiveFilters={hasActiveFilters}
          page={page}
          totalItems={totalItems}
          onGoToAll={() =>
            setSearchParams((prev) =>
              withoutListParam(prev, PLANT_LIST_URL_PARAMS.tab)
            )
          }
          onClearFilters={clearFilters}
          onGoToFirstPage={goToFirstPage}
        />
      ) : (
        <div
          data-testid="plant-grid"
          className={
            viewMode === 'list' ? 'plant-grid plant-grid--list' : 'plant-grid'
          }
        >
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}

      <Pagination pages={pages} currentPage={page} onPageChange={setPage} />
    </div>
  );
}
