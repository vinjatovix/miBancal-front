import { dictionary } from './dictionary';

export type Dictionary = typeof dictionary;

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type DeepKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : Join<K, DeepKeys<T[K]>>;
}[keyof T];

export type I18nKey = DeepKeys<Dictionary>;
