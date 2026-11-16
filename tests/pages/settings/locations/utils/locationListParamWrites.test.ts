import { describe, expect, it } from 'vitest';

import {
  withLocationListLimit,
  withLocationListPage,
  withLocationListSort,
  withoutLocationListPage
} from '../../../../../src/pages/settings/locations/utils/locationListParamWrites';
import { LOCATION_LIST_URL_PARAMS } from '../../../../../src/shared/constants/locationListUrlParams';

describe('locationListParamWrites', () => {
  it('withoutLocationListPage elimina el parámetro de página', () => {
    const params = new URLSearchParams({
      [LOCATION_LIST_URL_PARAMS.page]: '3'
    });

    const result = withoutLocationListPage(params);

    expect(result.has(LOCATION_LIST_URL_PARAMS.page)).toBe(false);
  });

  it('withLocationListPage establece el nuevo número de página', () => {
    const params = new URLSearchParams();

    const result = withLocationListPage(params, 4);

    expect(result.get(LOCATION_LIST_URL_PARAMS.page)).toBe('4');
  });

  it('withLocationListLimit establece el límite y reinicia la página', () => {
    const params = new URLSearchParams({
      [LOCATION_LIST_URL_PARAMS.page]: '5'
    });

    const result = withLocationListLimit(params, 50);

    expect(result.get(LOCATION_LIST_URL_PARAMS.limit)).toBe('50');
    expect(result.has(LOCATION_LIST_URL_PARAMS.page)).toBe(false);
  });

  it('withLocationListSort establece orden y dirección y reinicia la página', () => {
    const params = new URLSearchParams({
      [LOCATION_LIST_URL_PARAMS.page]: '5'
    });

    const result = withLocationListSort(params, 'createdAt', 'desc');

    expect(result.get(LOCATION_LIST_URL_PARAMS.sortField)).toBe('createdAt');
    expect(result.get(LOCATION_LIST_URL_PARAMS.sortDirection)).toBe('desc');
    expect(result.has(LOCATION_LIST_URL_PARAMS.page)).toBe(false);
  });
});
