import { useState, type ReactElement } from 'react';
import { useReportedNavigate } from '../../shared/observability/useReportedNavigate';
import { useQuery } from '@tanstack/react-query';

import BedCard from '../../components/beds/BedCard/BedCard';
import BedCreateDrawer from '../../components/beds/BedCreateDrawer/BedCreateDrawer';
import { t } from '../../i18n/core/t';
import { getLocationList } from '../../services/locations.service';
import type { LocationListRequest } from '../../services/locationListQuery';
import { useAuth } from '../../shared/auth/useAuth';
import Button from '../../shared/components/Button/Button';
import Icon from '../../shared/components/Icon/Icon';
import { locationKeys } from '../../shared/reactQuery/locationKeys';
import { useBeds } from './hooks/useBeds';

import './bedsPage.css';

const LOCATIONS_REQUEST: LocationListRequest = {
  pagination: { page: 1, limit: 100 },
  sort: { field: 'name', direction: 'asc' }
};

export default function BedsPage(): ReactElement {
  const navigate = useReportedNavigate('beds');
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { query, locationIdFilter, setLocationFilter } = useBeds();
  const { data: beds, isLoading, isError } = query;

  const { data: locationsResponse } = useQuery({
    queryKey: locationKeys.list(userId, LOCATIONS_REQUEST),
    queryFn: () => getLocationList(LOCATIONS_REQUEST),
    enabled: Boolean(userId)
  });

  const locations = locationsResponse?.data ?? [];

  const handleCreated = (newBedId: string) => {
    navigate(`/beds/${newBedId}`);
  };

  return (
    <main className="beds-page">
      <header className="beds-page__header">
        <div className="beds-page__title-group">
          <h1 className="beds-page__title">{t('bed.list.title')}</h1>
          <p className="beds-page__subtitle">{t('bed.list.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
          {t('bed.list.create_action')}
        </Button>
      </header>

      <section
        className="beds-page__toolbar"
        aria-label={t('bed.list.filter_location')}
      >
        <label
          htmlFor="bed-location-filter"
          className="beds-page__filter-label"
        >
          {t('bed.list.filter_location')}
        </label>
        <select
          id="bed-location-filter"
          className="beds-page__filter-select"
          value={locationIdFilter ?? ''}
          onChange={(e) => setLocationFilter(e.target.value || undefined)}
        >
          <option value="">{t('bed.list.all_locations')}</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </section>

      {isLoading && (
        <div className="beds-page__loading">
          <p>{t('bed.list.loading')}</p>
        </div>
      )}

      {isError && (
        <div className="beds-page__error">
          <p>{t('bed.list.error')}</p>
        </div>
      )}

      {!isLoading && !isError && beds && beds.length === 0 && (
        <section className="beds-page__empty">
          <Icon name="yard" decorative />
          <h2 className="beds-page__empty-title">
            {t('bed.list.empty_title')}
          </h2>
          <p className="beds-page__empty-desc">
            {t('bed.list.empty_description')}
          </p>
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            {t('bed.list.empty_action')}
          </Button>
        </section>
      )}

      {!isLoading && !isError && beds && beds.length > 0 && (
        <div className="beds-page__grid">
          {beds.map((bed) => (
            <BedCard key={bed.id} bed={bed} />
          ))}
        </div>
      )}

      <BedCreateDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreated={handleCreated}
        initialLocationId={locationIdFilter}
      />
    </main>
  );
}
