import { describe, expect, it } from 'vitest';

import { buildActiveFilters } from '../../../../src/pages/plants/utils/buildActiveFilters';
import { countActiveFilters } from '../../../../src/pages/plants/utils/countActiveFilters';
import {
  DEFAULT_PLANT_SORT,
  type PlantFilterParams,
  type PlantListRequest
} from '../../../../src/services/plantListQuery';

function buildRequest(filters: PlantFilterParams): PlantListRequest {
  return {
    filters,
    pagination: { page: 1, limit: 25 },
    sort: DEFAULT_PLANT_SORT
  };
}

describe('countActiveFilters', () => {
  it('sin filtros devuelve 0', () => {
    expect(countActiveFilters(buildRequest({}), 'north')).toBe(0);
  });

  it('coincide con el número de descriptores de buildActiveFilters', () => {
    const request = buildRequest({
      identity: 'tomate',
      family: 'fam-id',
      lifeCycle: 'perennial',
      edible: 'true',
      toxic: 'false',
      sowingMonths: [3, 5],
      soilPh: '6.5'
    });

    expect(countActiveFilters(request, 'south')).toBe(
      buildActiveFilters(request, { hemisphere: 'south' }).length
    );
  });

  it('el hemisferio sur suma 1 y el norte 0', () => {
    expect(countActiveFilters(buildRequest({}), 'south')).toBe(1);
    expect(countActiveFilters(buildRequest({}), 'north')).toBe(0);
  });

  it('cada estado booleano cuenta por separado', () => {
    expect(
      countActiveFilters(
        buildRequest({ edible: 'true', toxic: 'false' }),
        'north'
      )
    ).toBe(2);
  });

  it('cada mes de siembra cuenta por separado', () => {
    expect(
      countActiveFilters(buildRequest({ sowingMonths: [3, 5, 7] }), 'north')
    ).toBe(3);
  });
});
