import { reportMissingTranslation } from '../../shared/observability/reportMissingTranslation';
import { lookup } from './t';

export type ValueGroup =
  | 'anomaly.categoryValues'
  | 'anomaly.statusValues'
  | 'gardenInput.categoryValues'
  | 'gardenInput.actionValues'
  | 'gardenInput.dosageMethodValues'
  | 'gardenInput.statusValues'
  | 'plant.calendar.seasonValues'
  | 'plant.safety.flagValues'
  | 'plant.statusValues'
  | 'plant.filters.booleanValues'
  | 'plant.filters.lifeCycleValues'
  | 'plant.filters.sowingMethodValues'
  | 'plant.filters.lightTypeValues'
  | 'plant.filters.rootSystemValues'
  | 'plant.cultivation.propagation.methodValues'
  | 'plant.cultivation.pruning.pruningTypeValues'
  | 'plant.cultivation.pruning.pruningIntensityValues';

export function tValue(group: ValueGroup, value: string): string {
  const path = `${group}.${value}`;
  const translation = lookup(path);

  if (translation === undefined) {
    reportMissingTranslation(path);
    return value;
  }

  return translation;
}
