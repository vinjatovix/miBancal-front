import { monthNames } from '../../../i18n/core/monthNames';
import { t } from '../../../i18n/core/t';
import { tValue, type ValueGroup } from '../../../i18n/core/tValue';
import type { I18nKey } from '../../../i18n/core/types';
import type { PlantListRequest } from '../../../services/plantListQuery';
import { PLANT_LIST_URL_PARAMS } from '../../../shared/constants/plantListUrlParams';
import { capitalizeFirstLetter } from '../../../shared/utils/capitalizeFirstLetter';
import { mapMonth } from '../../../shared/utils/mapMonth';

export interface ActiveFilter {
  readonly id: string;
  readonly label: string;
  readonly param: string;
  readonly value?: string;
}

export interface ActiveFiltersContext {
  readonly hemisphere: 'north' | 'south';
  readonly familyName?: string;
}

function textChip(value?: string): ActiveFilter[] {
  if (!value) return [];
  return [
    {
      id: 'identity',
      param: PLANT_LIST_URL_PARAMS.identity,
      label: `${t('plant.filters.search_label')}: ${value}`
    }
  ];
}

function familyChip(value?: string, familyName?: string): ActiveFilter[] {
  if (!value) return [];
  return [
    {
      id: 'family',
      param: PLANT_LIST_URL_PARAMS.family,
      label: `${t('plant.filters.family')}: ${familyName ?? value}`
    }
  ];
}

function selectChip(
  id: string,
  param: string,
  group: ValueGroup,
  value?: string
): ActiveFilter[] {
  if (!value) return [];
  return [{ id, param, label: tValue(group, value) }];
}

function booleanChip(
  id: string,
  param: string,
  labelKey: I18nKey,
  value?: string
): ActiveFilter[] {
  if (!value) return [];
  return [
    {
      id,
      param,
      label: `${t(labelKey)}: ${tValue('plant.filters.booleanValues', value)}`
    }
  ];
}

function rangeChip(
  id: string,
  param: string,
  labelKey: I18nKey,
  value?: string
): ActiveFilter[] {
  if (!value) return [];
  return [{ id, param, label: `${t(labelKey)}: ${value.replace('.', ',')}` }];
}

function monthNameFor(
  backendMonth: number,
  hemisphere: 'north' | 'south'
): string {
  const match = monthNames().find(
    (month) => mapMonth(month.displayMonth, hemisphere) === backendMonth
  );
  return match ? match.long : String(backendMonth);
}

function monthChips(
  months: number[] | undefined,
  hemisphere: 'north' | 'south'
): ActiveFilter[] {
  if (!months) return [];
  return months.map((month) => ({
    id: `sowingMonths:${month}`,
    param: PLANT_LIST_URL_PARAMS.sowingMonth,
    value: String(month),
    label: capitalizeFirstLetter(monthNameFor(month, hemisphere))
  }));
}

function hemisphereChip(hemisphere: 'north' | 'south'): ActiveFilter[] {
  if (hemisphere !== 'south') return [];
  return [
    {
      id: 'hemisphere',
      param: PLANT_LIST_URL_PARAMS.hemisphere,
      label: `${t('plant.hemisphere.title')}: ${t('plant.hemisphere.south')}`
    }
  ];
}

export function buildActiveFilters(
  request: PlantListRequest,
  context: ActiveFiltersContext
): ActiveFilter[] {
  const { filters } = request;
  const { hemisphere, familyName } = context;

  return [
    ...textChip(filters.identity),
    ...familyChip(filters.family, familyName),
    ...selectChip(
      'lifeCycle',
      PLANT_LIST_URL_PARAMS.lifeCycle,
      'plant.filters.lifeCycleValues',
      filters.lifeCycle
    ),
    ...selectChip(
      'sowingMethod',
      PLANT_LIST_URL_PARAMS.sowingMethod,
      'plant.filters.sowingMethodValues',
      filters.sowingMethod
    ),
    ...selectChip(
      'lightType',
      PLANT_LIST_URL_PARAMS.lightType,
      'plant.filters.lightTypeValues',
      filters.lightType
    ),
    ...selectChip(
      'rootSystem',
      PLANT_LIST_URL_PARAMS.rootSystem,
      'plant.filters.rootSystemValues',
      filters.rootSystem
    ),
    ...booleanChip(
      'edible',
      PLANT_LIST_URL_PARAMS.edible,
      'plant.filters.edible',
      filters.edible
    ),
    ...booleanChip(
      'toxic',
      PLANT_LIST_URL_PARAMS.toxic,
      'plant.filters.toxic',
      filters.toxic
    ),
    ...monthChips(filters.sowingMonths, hemisphere),
    ...rangeChip(
      'soilPh',
      PLANT_LIST_URL_PARAMS.soilPh,
      'plant.filters.soilPh',
      filters.soilPh
    ),
    ...rangeChip(
      'lightHoursMin',
      PLANT_LIST_URL_PARAMS.lightHoursMin,
      'plant.filters.lightHoursMin',
      filters.lightHoursMin
    ),
    ...rangeChip(
      'spacingCm',
      PLANT_LIST_URL_PARAMS.spacingCm,
      'plant.filters.spacingCm',
      filters.spacingCm
    ),
    ...rangeChip(
      'soilAvailableDepthCm',
      PLANT_LIST_URL_PARAMS.soilAvailableDepthCm,
      'plant.filters.soilAvailableDepthCm',
      filters.soilAvailableDepthCm
    ),
    ...hemisphereChip(hemisphere)
  ];
}
