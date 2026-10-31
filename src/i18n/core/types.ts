import type { anomalyMessages } from '../messages/anomaly';
import type { coreMessages } from '../messages/core';
import type { familyMessages } from '../messages/family';
import type { gardenInputMessages } from '../messages/gardenInput';
import type { plantMessages } from '../messages/plant';
import type { plantRelationsMessages } from '../messages/plantRelations';

export type Dictionary = typeof coreMessages &
  typeof familyMessages &
  typeof anomalyMessages &
  typeof gardenInputMessages &
  typeof plantMessages &
  typeof plantRelationsMessages;

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type DeepKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : Join<K, DeepKeys<T[K]>>;
}[keyof T];

export type I18nKey = DeepKeys<Dictionary>;
