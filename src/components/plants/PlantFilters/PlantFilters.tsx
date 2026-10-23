import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Icon from '../../../shared/components/Icon/Icon';

import SliderFilter from '../SliderFilter';
import ToggleGroup from '../ToggleGroup';

import BooleanFilterGroups from './components/BooleanFilterGroups';
import FamilySelect from './components/FamilySelect/FamilySelect';
import MonthSelector from './components/MonthSelector';
import TextFilter from './components/TextFilter';
import {
  SLIDER_FILTERS,
  TEXT_FILTERS,
  TOGGLE_FILTERS
} from './config/filters.config';
import { usePlantFilters } from './hooks/usePlantFilters';

import './PlantFilters.css';

interface Props {
  readonly activeCount?: number;
}

export default function PlantFilters({ activeCount = 0 }: Props) {
  const {
    setParam,
    setParamNow,

    family,
    setFamily,

    textState,
    handleTextChange,

    lifeCycle,
    sowingMethod,
    lightType,
    rootSystem,
    edible,
    toxic,

    hemisphere,
    sowingMonth,

    soilPh,
    lightHours,
    spacing,
    soilDepth,

    clearFilters,
    setHemisphere
  } = usePlantFilters();

  const toggleValues = {
    lifeCycle,
    sowingMethod,
    lightType,
    rootSystem
  };

  const sliderValues = {
    soilPh,
    lightHoursMin: lightHours,
    spacingCm: spacing,
    soilAvailableDepthCm: soilDepth
  };

  return (
    <div className="plant-filters">
      <div className="plant-filters__header">
        {activeCount > 0 && (
          <span className="plant-filters__active-count">
            {t('plant.filters.active_count', { n: activeCount })}
          </span>
        )}

        <button
          data-testid="clear-filters"
          type="button"
          className="plant-filters__clear"
          onClick={clearFilters}
        >
          <Icon name="clear_all" decorative /> {t('plant.applied.clear_all')}
        </button>
      </div>

      <div className="plant-filters__quick-search" data-testid="quick-search">
        {TEXT_FILTERS.map((filter) => (
          <TextFilter
            testId={`text-filter-${filter.key}`}
            key={filter.key}
            icon={filter.icon}
            label={`${t(filter.labelKey)}`}
            value={textState[filter.key] ?? ''}
            placeholder={t(filter.placeholder)}
            maxLength={filter.maxLength}
            onChange={(value) => handleTextChange(filter.key, value)}
          />
        ))}
      </div>

      <FamilySelect value={family} onChange={setFamily} />

      <ToggleGroup
        icon="public"
        label={t('plant.hemisphere.title')}
        options={['north', 'south']}
        value={hemisphere}
        onChange={(value) => setHemisphere(value as 'north' | 'south')}
        renderLabel={(value) =>
          value === 'north'
            ? t('plant.hemisphere.north')
            : t('plant.hemisphere.south')
        }
      />

      <MonthSelector
        hemisphere={hemisphere}
        value={sowingMonth}
        onChange={(value) => setParamNow('sowingMonth', value)}
      />

      {TOGGLE_FILTERS.map((filter) => (
        <ToggleGroup
          key={filter.key}
          icon={filter.icon}
          label={t(filter.labelKey)}
          options={[...filter.options]}
          value={toggleValues[filter.key]}
          onChange={(value) =>
            setParamNow(
              filter.key,
              toggleValues[filter.key] === value ? '' : value
            )
          }
          renderLabel={(value) => tValue(filter.valuesGroup, value)}
        />
      ))}

      <BooleanFilterGroups values={{ edible, toxic }} onChange={setParamNow} />

      {SLIDER_FILTERS.map((filter) => (
        <SliderFilter
          testId={`slider-filter-${filter.key}`}
          key={filter.key}
          icon={filter.icon}
          label={t(filter.labelKey)}
          value={sliderValues[filter.key].value}
          min={filter.min}
          max={filter.max}
          step={filter.step}
          onChange={sliderValues[filter.key].setValue}
          onCommit={(value) =>
            setParam(filter.key, value !== null ? String(value) : undefined)
          }
        />
      ))}
    </div>
  );
}
