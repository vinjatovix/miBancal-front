import { useSearchParams } from 'react-router-dom';

import AnomalyFilters from '../../components/anomalies/AnomalyFilters/AnomalyFilters';
import { t } from '../../i18n/core/t';
import Drawer from '../../shared/components/Drawer/Drawer';
import {
  ANOMALY_LIST_URL_PARAMS,
  withoutAnomalyListFilters
} from '../../shared/constants/anomalyListUrlParams';
import useDrawer from '../../shared/hooks/useDrawer';
import useMediaQuery from '../../shared/hooks/useMediaQuery';

import AnomalyList from './AnomalyList';
import {
  parseAnomalyListSearchParams,
  withListParam
} from './utils/anomalyListParams';

import './anomaliesPage.css';

export default function AnomaliesPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const drawer = useDrawer(false);
  const [params, setParams] = useSearchParams();
  const { filters } = parseAnomalyListSearchParams(params);

  const filtersView = (
    <AnomalyFilters
      category={filters.category ?? ''}
      onCategoryChange={(value) =>
        setParams((prev) =>
          withListParam(prev, ANOMALY_LIST_URL_PARAMS.category, value)
        )
      }
      onClear={() => setParams((prev) => withoutAnomalyListFilters(prev))}
    />
  );

  return (
    <div className="anomalies-layout">
      {!isMobile && (
        <aside className="anomalies-sidebar" aria-label={t('common.filters')}>
          {filtersView}
        </aside>
      )}

      {isMobile && !drawer.isOpen && (
        <button type="button" onClick={drawer.open} className="anomalies-fab">
          {t('common.filters')}
        </button>
      )}

      {isMobile && (
        <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
          {filtersView}
        </Drawer>
      )}

      <section className="anomalies-main">
        <AnomalyList />
      </section>
    </div>
  );
}
