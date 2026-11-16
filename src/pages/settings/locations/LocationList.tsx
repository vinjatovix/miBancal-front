import { useMemo } from 'react';

import { t } from '../../../i18n/core/t';
import {
  isSortDirection,
  type SortDirection
} from '../../../services/listQuery';
import {
  isLocationSortField,
  type LocationSortField
} from '../../../services/locationListQuery';
import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../shared/components/Loader/Loader';
import PageSizeSelector from '../../../shared/components/PageSizeSelector/PageSizeSelector';
import Pagination from '../../../shared/components/Pagination/Pagination';
import PlantSortSelect from '../../../shared/components/PlantSortSelect/PlantSortSelect';
import { buildPaginationPages } from '../../../shared/utils/pagination';
import type { Location } from '../../../types/Location/Location';
import LocationCard from './components/LocationCard/LocationCard';

import './locationList.css';

export interface LocationListProps {
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly locations: readonly Location[];
  readonly currentPage: number;
  readonly totalPages: number;
  readonly currentLimit: number;
  readonly currentSortField: LocationSortField;
  readonly currentSortDirection: SortDirection;
  readonly onRetry: () => void;
  readonly onPageChange: (page: number) => void;
  readonly onLimitChange: (limit: number) => void;
  readonly onSortChange: (
    field: LocationSortField,
    direction: SortDirection
  ) => void;
  readonly onCreateNew: () => void;
  readonly onEdit: (location: Location) => void;
  readonly onDelete: (location: Location) => void;
}

export default function LocationList({
  isLoading,
  error,
  locations,
  currentPage,
  totalPages,
  currentLimit,
  currentSortField,
  currentSortDirection,
  onRetry,
  onPageChange,
  onLimitChange,
  onSortChange,
  onCreateNew,
  onEdit,
  onDelete
}: LocationListProps) {
  const sortOptions = useMemo(
    () => [
      { value: 'name:asc', label: t('location.sort.name_asc') },
      { value: 'name:desc', label: t('location.sort.name_desc') },
      { value: 'createdAt:desc', label: t('location.sort.createdAt_desc') },
      { value: 'createdAt:asc', label: t('location.sort.createdAt_asc') }
    ],
    []
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorResponse error={error} onRetry={onRetry} />;
  }

  if (locations.length === 0) {
    return (
      <div className="location-list__empty">
        <p className="location-list__empty-message">{t('location.empty')}</p>
        <button
          type="button"
          className="location-list__empty-action"
          onClick={onCreateNew}
        >
          {t('location.empty_action')}
        </button>
      </div>
    );
  }

  const pages =
    totalPages > 1 ? buildPaginationPages(currentPage, totalPages) : [];

  function handleSortChange(value: string) {
    const [field, direction] = value.split(':');
    if (
      field &&
      direction &&
      isLocationSortField(field) &&
      isSortDirection(direction)
    ) {
      onSortChange(field, direction);
    }
  }

  return (
    <div className="location-list">
      <div className="location-list__controls">
        <div className="location-list__sort">
          <PlantSortSelect
            label={t('location.sort.label')}
            value={`${currentSortField}:${currentSortDirection}`}
            options={sortOptions}
            onChange={handleSortChange}
          />
        </div>
        <PageSizeSelector
          label={t('location.page_size')}
          value={currentLimit}
          onChange={onLimitChange}
        />
      </div>

      <div className="location-list__grid">
        {locations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={loc}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          pages={pages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
