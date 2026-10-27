import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import GardenInputFilters from '../../components/gardenInputs/GardenInputFilters/GardenInputFilters';
import CatalogLayout from '../../components/layout/CatalogLayout/CatalogLayout';
import { AuthContext } from '../../shared/auth/authContextDef';
import {
  GARDEN_INPUT_LIST_URL_PARAMS,
  withoutGardenInputListFilters
} from '../../shared/constants/gardenInputListUrlParams';
import type {
  GardenInputAction,
  GardenInputCategory,
  GardenInputStatus
} from '../../types/GardenInput/GardenInput';
import GardenInputList from './GardenInputList';
import {
  countActiveFilters,
  parseGardenInputListSearchParams,
  withMultiFilterToggle,
  withoutListPage
} from './utils/gardenInputListParams';

export default function GardenInputsPage() {
  const [params, setParams] = useSearchParams();
  const request = parseGardenInputListSearchParams(params);
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const activeCount = countActiveFilters(request);

  function toggleCategory(category: GardenInputCategory) {
    setParams((prev) =>
      withMultiFilterToggle(
        prev,
        GARDEN_INPUT_LIST_URL_PARAMS.category,
        category
      )
    );
  }

  function toggleAction(action: GardenInputAction) {
    setParams((prev) =>
      withMultiFilterToggle(prev, GARDEN_INPUT_LIST_URL_PARAMS.action, action)
    );
  }

  function clearFilters() {
    setParams((prev) => withoutGardenInputListFilters(prev));
  }

  function handleStatusChange(status?: GardenInputStatus) {
    setParams((prev) => {
      const next = withoutListPage(prev);
      if (!status) {
        next.delete(GARDEN_INPUT_LIST_URL_PARAMS.status);
      } else {
        next.set(GARDEN_INPUT_LIST_URL_PARAMS.status, status);
      }
      return next;
    });
  }

  function asArray<T>(value: unknown): readonly T[] {
    if (Array.isArray(value)) {
      return value as T[];
    }
    if (value) {
      return [value as T];
    }
    return [];
  }

  const selectedCategories = asArray<GardenInputCategory>(
    request.filters.category
  );
  const selectedActions = asArray<GardenInputAction>(request.filters.action);

  const filtersView = (
    <GardenInputFilters
      selectedCategories={selectedCategories}
      selectedActions={selectedActions}
      selectedStatus={
        typeof request.filters.status === 'string'
          ? (request.filters.status as GardenInputStatus)
          : undefined
      }
      isEditor={isEditor}
      hasActiveFilters={activeCount > 0}
      onToggleCategory={toggleCategory}
      onToggleAction={toggleAction}
      onStatusChange={handleStatusChange}
      onClear={clearFilters}
    />
  );

  return (
    <CatalogLayout filters={filtersView} activeCount={activeCount}>
      <GardenInputList />
    </CatalogLayout>
  );
}
