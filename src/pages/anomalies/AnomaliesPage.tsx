import { useSearchParams } from 'react-router-dom';

import AnomalyFilters from '../../components/anomalies/AnomalyFilters/AnomalyFilters';
import CatalogLayout from '../../components/layout/CatalogLayout/CatalogLayout';
import {
  ANOMALY_LIST_URL_PARAMS,
  withoutAnomalyListFilters
} from '../../shared/constants/anomalyListUrlParams';
import AnomalyList from './AnomalyList';
import {
  countActiveFilters,
  parseAnomalyListSearchParams,
  withListParam
} from './utils/anomalyListParams';

export default function AnomaliesPage() {
  const [params, setParams] = useSearchParams();
  const parsedParams = parseAnomalyListSearchParams(params);
  const { filters } = parsedParams;
  const activeCount = countActiveFilters(parsedParams);

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
    <CatalogLayout filters={filtersView} activeCount={activeCount}>
      <AnomalyList />
    </CatalogLayout>
  );
}
