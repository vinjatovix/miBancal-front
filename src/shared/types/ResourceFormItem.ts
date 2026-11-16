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

export const MAX_RESOURCES = 200;
export const RESOURCE_URL_MAX_LENGTH = 2048;
