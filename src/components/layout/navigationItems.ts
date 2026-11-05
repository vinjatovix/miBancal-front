import type { I18nKey } from '../../i18n/core/types';
import type { IconName } from '../../shared/components/Icon/iconPaths';

export interface NavigationItem {
  readonly id: string;
  readonly labelKey: I18nKey;
  readonly path: string;
  readonly icon: IconName;
  readonly isMatch: (pathname: string) => boolean;
}

const isPlantsMatch = (pathname: string): boolean =>
  pathname === '/plants' || pathname.startsWith('/plants/');

const isFamiliesMatch = (pathname: string): boolean =>
  pathname === '/families' || pathname.startsWith('/families/');

const isAnomaliesMatch = (pathname: string): boolean =>
  pathname === '/anomalies' || pathname.startsWith('/anomalies/');

const isGardenInputsMatch = (pathname: string): boolean =>
  pathname === '/garden-inputs' || pathname.startsWith('/garden-inputs/');

const isPlantRelationsMatch = (pathname: string): boolean =>
  pathname === '/plant-relations' || pathname.startsWith('/plant-relations/');

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'plants',
    labelKey: 'app.nav.plants',
    path: '/plants',
    icon: 'eco',
    isMatch: isPlantsMatch
  },
  {
    id: 'families',
    labelKey: 'app.nav.families',
    path: '/families',
    icon: 'biotech',
    isMatch: isFamiliesMatch
  },
  {
    id: 'anomalies',
    labelKey: 'app.nav.anomalies',
    path: '/anomalies',
    icon: 'crisis_alert',
    isMatch: isAnomaliesMatch
  },
  {
    id: 'gardenInputs',
    labelKey: 'app.nav.gardenInputs',
    path: '/garden-inputs',
    icon: 'local_pharmacy',
    isMatch: isGardenInputsMatch
  },
  {
    id: 'plantRelations',
    labelKey: 'app.nav.plantRelations',
    path: '/plant-relations',
    icon: 'plant_relations',
    isMatch: isPlantRelationsMatch
  }
] as const;
