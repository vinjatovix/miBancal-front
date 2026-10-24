import type { ValueGroup } from '../../../../i18n/core/tValue';
import type { IconName } from '../../../../shared/components/Icon/iconPaths';
import { FILTER_TEXT_MAX_LENGTH } from '../../../../shared/constants/filterText';
import {
  LIFE_CYCLES,
  LIGHT_TYPES,
  ROOT_SYSTEMS,
  SOWING_METHODS
} from '../constants';

export const TOGGLE_FILTERS = [
  {
    icon: 'recycling' as IconName,
    key: 'lifeCycle',
    labelKey: 'plant.filters.lifeCycle',
    valuesGroup: 'plant.filters.lifeCycleValues' satisfies ValueGroup,
    options: LIFE_CYCLES
  },
  {
    icon: 'potted_plant' as IconName,
    key: 'sowingMethod',
    labelKey: 'plant.filters.sowingMethod',
    valuesGroup: 'plant.filters.sowingMethodValues' satisfies ValueGroup,
    options: SOWING_METHODS
  },
  {
    icon: 'sunny' as IconName,
    key: 'lightType',
    labelKey: 'plant.filters.lightType',
    valuesGroup: 'plant.filters.lightTypeValues' satisfies ValueGroup,
    options: LIGHT_TYPES
  },
  {
    icon: 'psychiatry' as IconName,
    key: 'rootSystem',
    labelKey: 'plant.filters.rootSystem',
    valuesGroup: 'plant.filters.rootSystemValues' satisfies ValueGroup,
    options: ROOT_SYSTEMS
  }
] as const;

export const BOOLEAN_FILTER_ANY = 'any';

export const BOOLEAN_FILTERS = [
  {
    icon: 'restaurant' as IconName,
    key: 'edible',
    labelKey: 'plant.filters.edible',
    valuesGroup: 'plant.filters.booleanValues' satisfies ValueGroup,
    options: [BOOLEAN_FILTER_ANY, 'true', 'false']
  },
  {
    icon: 'dangerous' as IconName,
    key: 'toxic',
    labelKey: 'plant.filters.toxic',
    valuesGroup: 'plant.filters.booleanValues' satisfies ValueGroup,
    options: [BOOLEAN_FILTER_ANY, 'true', 'false']
  }
] as const;

export const TEXT_FILTERS = [
  {
    icon: 'search' as IconName,
    key: 'identity',
    labelKey: 'plant.filters.search_label',
    placeholder: 'plant.filters.search_placeholder',
    maxLength: FILTER_TEXT_MAX_LENGTH
  }
] as const;

export const SLIDER_FILTERS = [
  {
    icon: 'science' as IconName,
    key: 'soilPh',
    labelKey: 'plant.filters.soilPh',
    min: 4,
    max: 9,
    step: 0.1
  },
  {
    icon: 'schedule' as IconName,
    key: 'lightHoursMin',
    labelKey: 'plant.filters.lightHoursMin',
    min: 0,
    max: 16,
    step: 1
  },
  {
    icon: 'straighten' as IconName,
    key: 'spacingCm',
    labelKey: 'plant.filters.spacingCm',
    min: 5,
    max: 200,
    step: 5
  },
  {
    icon: 'straighten' as IconName,
    key: 'soilAvailableDepthCm',
    labelKey: 'plant.filters.soilAvailableDepthCm',
    min: 10,
    max: 200,
    step: 5
  }
] as const;
