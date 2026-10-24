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
  }
] as const;
