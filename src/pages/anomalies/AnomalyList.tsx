import { useContext } from 'react';
import { Link } from 'react-router-dom';

import AnomalyStatusBadge from '../../components/anomalies/AnomalyStatusBadge/AnomalyStatusBadge';
import { t } from '../../i18n/core/t';
import { tValue } from '../../i18n/core/tValue';
import { AuthContext } from '../../shared/auth/authContextDef';
import Badge from '../../shared/components/Badge/Badge';
import { ErrorResponse } from '../../shared/components/ErrorResponse/ErrorResponse';
import Icon from '../../shared/components/Icon/Icon';
import { Loader } from '../../shared/components/Loader/Loader';
import PageSizeSelector from '../../shared/components/PageSizeSelector/PageSizeSelector';
import Pagination from '../../shared/components/Pagination/Pagination';
import PlantSortSelect from '../../shared/components/PlantSortSelect/PlantSortSelect';
import ScientificName from '../../shared/components/ScientificName/ScientificName';
import { getQueryViewState } from '../../shared/reactQuery/queryViewState';
import { buildPaginationPages } from '../../shared/utils/pagination';
import { capitalizeFirstLetter } from '../../shared/utils/capitalizeFirstLetter';
import type { AnomalyListItem } from '../../types/Anomaly/Anomaly';

import { useAnomalies } from './hooks/useAnomalies';
import {
  buildAnomalySortOptions,
  splitAnomalySortValue
} from './utils/buildAnomalySortOptions';

import './anomalyList.css';

const SORT_OPTIONS = buildAnomalySortOptions();

function AnomalyCard({ anomaly }: { readonly anomaly: AnomalyListItem }) {
  return (
    <Link
      to={`/anomalies/${anomaly.slug}`}
      className="anomaly-card"
      aria-label={t('anomaly.open_detail', { name: anomaly.name })}
    >
      <h2 className="anomaly-card__name">
        {capitalizeFirstLetter(anomaly.name)}
      </h2>
      <p className="anomaly-card__scientific">
        {anomaly.scientificName ? (
          <ScientificName>{anomaly.scientificName}</ScientificName>
        ) : (
          t('anomaly.scientific_name_missing')
        )}
      </p>
      <div className="anomaly-card__badges">
        <Badge variant="family">
          {tValue('anomaly.categoryValues', anomaly.category)}
        </Badge>
        <AnomalyStatusBadge status={anomaly.status} />
      </div>
    </Link>
  );
}

interface EmptyProps {
  readonly hasActiveFilters: boolean;
  readonly isBeyondFirstPage: boolean;
  readonly onClearFilters: () => void;
  readonly onGoToFirstPage: () => void;
}

function AnomalyListEmpty({
  hasActiveFilters,
  isBeyondFirstPage,
  onClearFilters,
  onGoToFirstPage
}: EmptyProps) {
  const action = isBeyondFirstPage
    ? { label: t('anomaly.go_to_first_page'), onClick: onGoToFirstPage }
    : hasActiveFilters
      ? { label: t('errors.actions.clearFilters'), onClick: onClearFilters }
      : null;

  return (
    <div className="anomaly-list__empty">
      <p role="status" className="anomaly-list__empty-message">
        {t(
          hasActiveFilters || isBeyondFirstPage
            ? 'anomaly.empty'
            : 'anomaly.empty_catalog'
        )}
      </p>
      {action && (
        <button
          type="button"
          className="anomaly-list__empty-action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function AnomalyList() {
  const {
    query,
    request,
    hasActiveFilters,
    setPage,
    goToFirstPage,
    setLimit,
    setSort,
    clearFilters
  } = useAnomalies();
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
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
  const anomalies = query.data?.data ?? [];
  const totalPages = query.data?.pagination.totalPages ?? 0;
  const pages = totalPages > 0 ? buildPaginationPages(page, totalPages) : [];

  return (
    <div className="anomaly-list">
      <div className="anomaly-list__header">
        <h1>{t('anomaly.title')}</h1>
        {isEditor && (
          <Link
            to="/anomalies/new"
            className="anomaly-list__create-btn"
            aria-label={t('anomaly.catalog.new_anomaly')}
          >
            <Icon name="crisis_alert" decorative />
            <span>{t('anomaly.catalog.new_anomaly')}</span>
          </Link>
        )}
      </div>

      <div className="anomaly-list__controls">
        <PlantSortSelect
          label={t('anomaly.sort.label')}
          value={`${request.sort.field}:${request.sort.direction}`}
          options={SORT_OPTIONS}
          onChange={(value) => {
            const { field, direction } = splitAnomalySortValue(value);
            setSort(field, direction);
          }}
        />
        <PageSizeSelector
          label={t('anomaly.page_size')}
          value={request.pagination.limit}
          onChange={setLimit}
        />
      </div>

      <Pagination pages={pages} currentPage={page} onPageChange={setPage} />

      {anomalies.length === 0 ? (
        <AnomalyListEmpty
          hasActiveFilters={hasActiveFilters}
          isBeyondFirstPage={page > 1}
          onClearFilters={clearFilters}
          onGoToFirstPage={goToFirstPage}
        />
      ) : (
        <div className="anomaly-grid" data-testid="anomaly-grid">
          {anomalies.map((anomaly) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))}
        </div>
      )}

      <Pagination pages={pages} currentPage={page} onPageChange={setPage} />
    </div>
  );
}
