import { ANOMALY_TEXT_LIST_FIELDS } from '../../../../../types/Anomaly/Anomaly';
import type { AnomalyFormState } from '../types';

const DRAFT_STORAGE_KEY = 'anomaly:create-draft';

const DRAFT_STRING_FIELDS: readonly (keyof AnomalyFormState)[] = [
  'slug',
  'name',
  'scientificName',
  'category',
  'description',
  ...ANOMALY_TEXT_LIST_FIELDS
];

function isDraft(value: unknown): value is AnomalyFormState {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  const stringsValid = DRAFT_STRING_FIELDS.every(
    (field) => typeof record[field] === 'string'
  );
  if (!stringsValid) return false;

  const imagesValid =
    record.images === undefined || Array.isArray(record.images);
  const videosValid =
    record.videoResources === undefined || Array.isArray(record.videoResources);
  const articlesValid =
    record.articleResources === undefined ||
    Array.isArray(record.articleResources);
  const confusedValid =
    record.confusedWithInput === undefined ||
    typeof record.confusedWithInput === 'string';

  return imagesValid && videosValid && articlesValid && confusedValid;
}

export function saveAnomalyDraft(state: AnomalyFormState): void {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

export function clearAnomalyDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    return;
  }
}

export function loadAnomalyDraft(): AnomalyFormState | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!isDraft(parsed)) return null;

    return {
      ...parsed,
      images: Array.isArray(parsed.images) ? parsed.images : [],
      videoResources: Array.isArray(parsed.videoResources)
        ? parsed.videoResources
        : [],
      articleResources: Array.isArray(parsed.articleResources)
        ? parsed.articleResources
        : [],
      confusedWithInput:
        typeof parsed.confusedWithInput === 'string'
          ? parsed.confusedWithInput
          : ''
    };
  } catch {
    return null;
  }
}
