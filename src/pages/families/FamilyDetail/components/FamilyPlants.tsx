import type { UseQueryResult } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import PlantStatusBadge from '../../../../components/plants/PlantStatusBadge/PlantStatusBadge';
import { t } from '../../../../i18n/core/t';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import { ErrorResponse } from '../../../../shared/components/ErrorResponse/ErrorResponse';
import Icon from '../../../../shared/components/Icon/Icon';
import { Loader } from '../../../../shared/components/Loader/Loader';
import { getQueryViewState } from '../../../../shared/reactQuery/queryViewState';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { Family } from '../../../../types/Family';
import type { FamilyPlantItem } from '../../../../types/Plants/Plant';
import type { PaginatedResponse } from '../../../../types/api';

export type FamilyPlantsQuery = Pick<
  UseQueryResult<PaginatedResponse<FamilyPlantItem>>,
  'data' | 'error' | 'isError' | 'isFetching' | 'refetch'
>;

interface Props {
  readonly family: Family;
  readonly query: FamilyPlantsQuery;
}

interface ContentProps {
  readonly family: Family;
  readonly plants: FamilyPlantItem[];
  readonly total: number;
}

function getCountLabel(count: number, total: number): string {
  const safeTotal = Math.max(total, count);
  if (safeTotal > count) {
    return t('family.plants.showing_count', { count, total: safeTotal });
  }
  if (safeTotal > 1) {
    return t('family.plants.total_count', { total: safeTotal });
  }
  return t('family.plants.single_count');
}

function FamilyPlantsContent({ family, plants, total }: ContentProps) {
  const effectiveTotal = Math.max(total, plants.length);

  if (effectiveTotal === 0) {
    return (
      <p className="family-plants__empty" data-testid="family-plants-empty">
        {t('family.plants.empty')}
      </p>
    );
  }

  return (
    <>
      <p className="family-plants__count" data-testid="family-plants-count">
        {getCountLabel(plants.length, effectiveTotal)}
      </p>

      <Link
        to={`/plants?family=${family.id}`}
        className="family-detail__cta-link"
        data-testid="family-plants-view-all"
      >
        <Icon name="arrow_forward" decorative /> {t('family.plants.view_all')}
      </Link>

      <div className="family-plants__grid">
        {plants.map((plant) => (
          <Link
            key={plant.id}
            to={`/plants/${plant.id}`}
            className="family-plants__grid-item"
            data-testid="family-plants-link"
          >
            {capitalizeFirstLetter(plant.identity.name.primary)}
            <PlantStatusBadge status={plant.status} />
          </Link>
        ))}
      </div>
    </>
  );
}

function FamilyPlantsState({ family, query }: Props) {
  const viewState = getQueryViewState(query);

  if (viewState === 'loading') return <Loader />;

  if (viewState === 'error') {
    return (
      <ErrorResponse error={query.error} onRetry={() => void query.refetch()} />
    );
  }

  return (
    <FamilyPlantsContent
      family={family}
      plants={query.data?.data ?? []}
      total={query.data?.pagination.totalItems ?? 0}
    />
  );
}

export default function FamilyPlants({ family, query }: Props) {
  return (
    <BodySection title={t('family.plants.title')} icon="eco">
      <FamilyPlantsState family={family} query={query} />
    </BodySection>
  );
}
