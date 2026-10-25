import type {
  AnomalyCategory,
  AnomalyTextListField
} from '../../../../types/Anomaly/Anomaly';

type AnomalyFormTextLists = {
  [Field in AnomalyTextListField]: string;
};

export interface ImageResourceFormItem {
  id: string;
  url: string;
  title: string;
  source: string;
}

export interface VideoResourceFormItem {
  id: string;
  url: string;
  title: string;
}

export interface ArticleResourceFormItem {
  id: string;
  url: string;
  title: string;
}

export interface AnomalyFormState extends AnomalyFormTextLists {
  slug: string;
  name: string;
  scientificName: string;
  category: AnomalyCategory | '';
  description: string;
  images: ImageResourceFormItem[];
  videoResources: VideoResourceFormItem[];
  articleResources: ArticleResourceFormItem[];
  confusedWithInput: string;
}

export type AnomalyFormMode = 'create' | 'edit';

export const ANOMALY_NAME_MAX_LENGTH = 200;
export const ANOMALY_TEXT_MAX_LENGTH = 2000;
export const ANOMALY_RESOURCE_URL_MAX_LENGTH = 2048;
export const ANOMALY_CONFUSED_SLUG_MAX_LENGTH = 120;
export const ANOMALY_MAX_RESOURCES = 200;
export const ANOMALY_MAX_CONFUSED_SLUGS = 200;
