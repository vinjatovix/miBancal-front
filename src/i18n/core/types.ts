import type { anomalyMessages } from '../messages/anomaly';
import type { bedsMessages } from '../messages/beds';
import type { coreMessages } from '../messages/core';
import type { designSystemMessages } from '../messages/designSystem';
import type { familyMessages } from '../messages/family';
import type { gardenInputMessages } from '../messages/gardenInput';
import type { glossaryMessages } from '../messages/glossary';
import type { locationsMessages } from '../messages/locations';
import type { plantMessages } from '../messages/plant';
import type { plantRelationsMessages } from '../messages/plantRelations';
import type { pwaMessages } from '../messages/pwa';
import type { themeMessages } from '../messages/theme';

export type Dictionary = typeof coreMessages &
  typeof familyMessages &
  typeof anomalyMessages &
  typeof gardenInputMessages &
  typeof plantMessages &
  typeof plantRelationsMessages &
  typeof pwaMessages &
  typeof themeMessages &
  typeof glossaryMessages &
  typeof designSystemMessages &
  typeof locationsMessages &
  typeof bedsMessages;

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type DeepKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : Join<K, DeepKeys<T[K]>>;
}[keyof T];

export type I18nKey = DeepKeys<Dictionary>;
