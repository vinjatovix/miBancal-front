import type { Metadata } from '../Metadata';
import type { SupportResource } from '../SupportResource';

export const ANOMALY_CATEGORIES = [
  'pest',
  'disease',
  'disorder',
  'weed'
] as const;

export type AnomalyCategory = (typeof ANOMALY_CATEGORIES)[number];

export type AnomalyStatus = 'ACTIVE' | 'DELETED';

export const ANOMALY_TEXT_LIST_FIELDS = [
  'symptoms',
  'damage',
  'causes',
  'affectedCrops',
  'prevention',
  'treatment',
  'naturalEnemies'
] as const;

export type AnomalyTextListField = (typeof ANOMALY_TEXT_LIST_FIELDS)[number];

type AnomalyTextLists = {
  [Field in AnomalyTextListField]?: string[];
};

export interface Anomaly extends AnomalyTextLists {
  id: string;
  version?: number;
  slug: string;
  name: string;
  scientificName?: string;
  category: AnomalyCategory;
  description?: string;
  resources?: SupportResource[];
  confusedWith?: string[];
  status: AnomalyStatus;
  deletedAt?: string;
  metadata?: Metadata;
}

export type AnomalyListItem = Pick<
  Anomaly,
  | 'id'
  | 'slug'
  | 'name'
  | 'scientificName'
  | 'category'
  | 'status'
  | 'deletedAt'
  | 'resources'
>;

export interface CreateAnomalyRequest extends AnomalyTextLists {
  id: string;
  slug: string;
  name: string;
  category: AnomalyCategory;
  scientificName?: string;
  description?: string;
  resources?: SupportResource[];
  confusedWith?: string[];
}

type NullableAnomalyTextLists = {
  [Field in AnomalyTextListField]?: string[] | null;
};

export interface UpdateAnomalyRequest extends NullableAnomalyTextLists {
  name?: string;
  category?: AnomalyCategory;
  scientificName?: string | null;
  description?: string | null;
  resources?: SupportResource[] | null;
  confusedWith?: string[] | null;
}
