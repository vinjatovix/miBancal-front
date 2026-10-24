import { useSearchParams } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import useMediaQuery from '../../shared/hooks/useMediaQuery';
import useDrawer from '../../shared/hooks/useDrawer';
import { PLANT_LIST_URL_PARAMS } from '../../shared/constants/plantListUrlParams';
import Drawer from '../../shared/components/Drawer/Drawer';
import PlantFilters from '../../components/plants/PlantFilters/PlantFilters';
import PlantList from './PlantList';
import { countActiveFilters } from './utils/countActiveFilters';
import { parsePlantListSearchParams } from './utils/parsePlantListSearchParams';

import './plantsPage.css';

export default function PlantsPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const drawer = useDrawer(false);
  const [params] = useSearchParams();
  const hemisphere =
    params.get(PLANT_LIST_URL_PARAMS.hemisphere) === 'south'
      ? 'south'
      : 'north';
  const activeCount = countActiveFilters(
    parsePlantListSearchParams(params),
    hemisphere
  );

  return (
    <div className="plants-layout">
      {!isMobile && (
        <aside className="plants-sidebar" aria-label={t('common.filters')}>
          <PlantFilters activeCount={activeCount} />
        </aside>
      )}

      {isMobile && !drawer.isOpen && (
        <button type="button" onClick={drawer.open} className="plants-fab">
          {t('common.filters')}
        </button>
      )}

      {isMobile && (
        <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
          <PlantFilters activeCount={activeCount} />
        </Drawer>
      )}

      <section className="plants-main">
        <PlantList />
      </section>
    </div>
  );
}
