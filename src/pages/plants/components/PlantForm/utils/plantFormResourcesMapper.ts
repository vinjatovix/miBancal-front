import type {
  Plant,
  PlantResourceInput
} from '../../../../../types/Plants/Plant';
import type { PlantFormState } from '../types';

export function buildResources(state: PlantFormState): PlantResourceInput[] {
  const resources: PlantResourceInput[] = [];

  const imageResource: PlantResourceInput = {
    type: 'image',
    url: state.imageUrl.trim()
  };
  if (state.imageTitle.trim()) imageResource.title = state.imageTitle.trim();
  if (state.imageSource.trim()) imageResource.source = state.imageSource.trim();
  resources.push(imageResource);

  for (const video of state.videoResources) {
    const trimmedUrl = video.url.trim();
    if (trimmedUrl) {
      resources.push({
        type: 'video',
        url: trimmedUrl,
        title: video.title.trim() || undefined
      });
    }
  }

  for (const article of state.articleResources) {
    const trimmedUrl = article.url.trim();
    if (trimmedUrl) {
      resources.push({
        type: 'article',
        url: trimmedUrl,
        title: article.title.trim() || undefined
      });
    }
  }

  return resources;
}

type OriginalResource = NonNullable<
  NonNullable<Plant['knowledge']>['resources']
>[number];

function buildPrimaryImageResource(
  primaryImageUrl: string,
  imageTitle: string,
  imageSource: string,
  originalResources: readonly OriginalResource[]
): PlantResourceInput | null {
  if (!primaryImageUrl) return null;

  const matched = originalResources.find(
    (r) => r.type === 'image' && r.url === primaryImageUrl
  );

  const resource: PlantResourceInput = {
    type: 'image',
    url: primaryImageUrl
  };

  const title = imageTitle || matched?.title;
  if (title) resource.title = title;

  const source = imageSource || matched?.source;
  if (source) resource.source = source;

  if (matched?.tags && matched.tags.length > 0) {
    resource.tags = matched.tags;
  }

  return resource;
}

function buildAdditionalImageResources(
  originalResources: readonly OriginalResource[],
  primaryImageUrl: string
): PlantResourceInput[] {
  const firstOriginalImage = originalResources.find((r) => r.type === 'image');
  const additional = originalResources.filter(
    (r) =>
      r.type === 'image' &&
      r !== firstOriginalImage &&
      r.url !== primaryImageUrl
  );

  return additional.map((extraImg) => ({
    type: 'image',
    url: extraImg.url,
    title: extraImg.title,
    source: extraImg.source,
    tags: extraImg.tags
  }));
}

function buildMediaResources(
  items: readonly { readonly url: string; readonly title: string }[],
  type: 'video' | 'article',
  originalResources: readonly OriginalResource[]
): PlantResourceInput[] {
  const result: PlantResourceInput[] = [];

  for (const item of items) {
    const trimmedUrl = item.url.trim();
    if (!trimmedUrl) continue;

    const matched = originalResources.find(
      (r) => r.type === type && r.url === trimmedUrl
    );

    const resource: PlantResourceInput = {
      type,
      url: trimmedUrl,
      title: item.title.trim() || undefined
    };

    if (matched?.source) resource.source = matched.source;
    if (matched?.tags && matched.tags.length > 0) resource.tags = matched.tags;

    result.push(resource);
  }

  return result;
}

export function buildUpdateResources(
  state: PlantFormState,
  originalPlant?: Plant
): PlantResourceInput[] {
  const originalResources = originalPlant?.knowledge?.resources ?? [];
  const primaryImageUrl = state.imageUrl.trim();

  const primaryImage = buildPrimaryImageResource(
    primaryImageUrl,
    state.imageTitle.trim(),
    state.imageSource.trim(),
    originalResources
  );

  const additionalImages = buildAdditionalImageResources(
    originalResources,
    primaryImageUrl
  );

  const videos = buildMediaResources(
    state.videoResources,
    'video',
    originalResources
  );

  const articles = buildMediaResources(
    state.articleResources,
    'article',
    originalResources
  );

  return [
    ...(primaryImage ? [primaryImage] : []),
    ...additionalImages,
    ...videos,
    ...articles
  ];
}
