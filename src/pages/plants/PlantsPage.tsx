import { useSearchParams } from 'react-router-dom';

import CatalogLayout from '../../components/layout/CatalogLayout/CatalogLayout';
import PlantFilters from '../../components/plants/PlantFilters/PlantFilters';
import { PLANT_LIST_URL_PARAMS } from '../../shared/constants/plantListUrlParams';
import PlantList from './PlantList';
import { countActiveFilters } from './utils/countActiveFilters';
import { parsePlantListSearchParams } from './utils/parsePlantListSearchParams';

export default function PlantsPage() {
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
    <CatalogLayout
      filters={<PlantFilters activeCount={activeCount} />}
      activeCount={activeCount}
    >
      <PlantList />
    </CatalogLayout>
  );
}
