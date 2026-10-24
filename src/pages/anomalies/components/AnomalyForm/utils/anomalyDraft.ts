import { ANOMALY_TEXT_LIST_FIELDS } from '../../../../../types/Anomaly/Anomaly';
import type { AnomalyFormState } from '../types';

const DRAFT_STORAGE_KEY = 'anomaly:create-draft';

const DRAFT_FIELDS: readonly (keyof AnomalyFormState)[] = [
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
  return DRAFT_FIELDS.every((field) => typeof record[field] === 'string');
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
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
