export type SupportResourceType = 'image' | 'article' | 'video';

export interface SupportResource {
  readonly type: SupportResourceType;
  readonly url: string;
  readonly title?: string;
  readonly source?: string;
  readonly tags?: string[];
}
