import { describe, expect, it } from 'vitest';

import { parseLocationListSearchParams } from '../../../../../src/pages/settings/locations/utils/parseLocationListSearchParams';
import {
  DEFAULT_LOCATION_SORT,
  LOCATION_SORT_FIELDS
} from '../../../../../src/services/locationListQuery';
import { SORT_DIRECTIONS } from '../../../../../src/services/listQuery';
import { SUPPORTED_LIMITS } from '../../../../../src/shared/components/constants';
import { LOCATION_LIST_URL_PARAMS } from '../../../../../src/shared/constants/locationListUrlParams';

describe('parseLocationListSearchParams', () => {
  it('aplica los valores por defecto cuando los parámetros están vacíos', () => {
    const params = new URLSearchParams();

    const result = parseLocationListSearchParams(params);

    expect(result).toEqual({
      pagination: {
        page: 1,
        limit: SUPPORTED_LIMITS[0]
      },
      sort: DEFAULT_LOCATION_SORT
    });
  });

  it('parsea valores válidos de paginación y orden', () => {
    const params = new URLSearchParams({
      [LOCATION_LIST_URL_PARAMS.page]: '3',
      [LOCATION_LIST_URL_PARAMS.limit]: '50',
      [LOCATION_LIST_URL_PARAMS.sortField]: 'createdAt',
      [LOCATION_LIST_URL_PARAMS.sortDirection]: 'desc'
    });

    const result = parseLocationListSearchParams(params);

    expect(result).toEqual({
      pagination: {
        page: 3,
        limit: 50
      },
      sort: {
        field: 'createdAt',
        direction: 'desc'
      }
    });
  });

  it.each([
    ['0', 1],
    ['-5', 1],
    ['abc', 1],
    ['', 1]
  ])(
    'degrada página inválida "%s" al valor por defecto %i',
    (rawPage, expectedPage) => {
      const params = new URLSearchParams({
        [LOCATION_LIST_URL_PARAMS.page]: rawPage
      });

      const result = parseLocationListSearchParams(params);

      expect(result.pagination.page).toBe(expectedPage);
    }
  );

  it.each([
    ['10', SUPPORTED_LIMITS[0]],
    ['999', SUPPORTED_LIMITS[0]],
    ['invalid', SUPPORTED_LIMITS[0]]
  ])(
    'degrada límite no soportado "%s" al valor por defecto',
    (rawLimit, expectedLimit) => {
      const params = new URLSearchParams({
        [LOCATION_LIST_URL_PARAMS.limit]: rawLimit
      });

      const result = parseLocationListSearchParams(params);

      expect(result.pagination.limit).toBe(expectedLimit);
    }
  );

  it.each(LOCATION_SORT_FIELDS)(
    'acepta campo de orden válido "%s"',
    (field) => {
      const params = new URLSearchParams({
        [LOCATION_LIST_URL_PARAMS.sortField]: field
      });

      const result = parseLocationListSearchParams(params);

      expect(result.sort.field).toBe(field);
    }
  );

  it('degrada campo de orden desconocido al valor por defecto', () => {
    const params = new URLSearchParams({
      [LOCATION_LIST_URL_PARAMS.sortField]: 'unsupportedField'
    });

    const result = parseLocationListSearchParams(params);

    expect(result.sort.field).toBe(DEFAULT_LOCATION_SORT.field);
  });

  it.each(SORT_DIRECTIONS)(
    'acepta dirección de orden válida "%s"',
    (direction) => {
      const params = new URLSearchParams({
        [LOCATION_LIST_URL_PARAMS.sortDirection]: direction
      });

      const result = parseLocationListSearchParams(params);

      expect(result.sort.direction).toBe(direction);
    }
  );

  it('degrada dirección de orden desconocida al valor por defecto', () => {
    const params = new URLSearchParams({
      [LOCATION_LIST_URL_PARAMS.sortDirection]: 'diagonal'
    });

    const result = parseLocationListSearchParams(params);

    expect(result.sort.direction).toBe(DEFAULT_LOCATION_SORT.direction);
  });
});
