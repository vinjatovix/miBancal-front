import type { SupportResource } from '../../../../../types/SupportResource';
import {
  ANOMALY_TEXT_LIST_FIELDS,
  type Anomaly,
  type AnomalyTextListField,
  type CreateAnomalyRequest,
  type UpdateAnomalyRequest
} from '../../../../../types/Anomaly/Anomaly';
import type { AnomalyFormState } from '../types';
import { uniqueLines } from './anomalyFormLines';

export function initialAnomalyFormState(): AnomalyFormState {
  return {
    slug: '',
    name: '',
    scientificName: '',
    category: '',
    description: '',
    images: [],
    videoResources: [],
    articleResources: [],
    confusedWithInput: '',
    symptoms: '',
    damage: '',
    causes: '',
    affectedCrops: '',
    prevention: '',
    treatment: '',
    naturalEnemies: ''
  };
}

export function anomalyToFormState(anomaly: Anomaly): AnomalyFormState {
  const listTexts = Object.fromEntries(
    ANOMALY_TEXT_LIST_FIELDS.map((field) => [
      field,
      (anomaly[field] ?? []).join('\n')
    ])
  ) as Record<AnomalyTextListField, string>;

  const images = (anomaly.resources ?? [])
    .filter((r) => r.type === 'image')
    .map((r) => ({
      id: crypto.randomUUID(),
      url: r.url,
      title: r.title ?? '',
      source: r.source ?? ''
    }));

  const videoResources = (anomaly.resources ?? [])
    .filter((r) => r.type === 'video')
    .map((r) => ({
      id: crypto.randomUUID(),
      url: r.url,
      title: r.title ?? ''
    }));

  const articleResources = (anomaly.resources ?? [])
    .filter((r) => r.type === 'article')
    .map((r) => ({
      id: crypto.randomUUID(),
      url: r.url,
      title: r.title ?? ''
    }));

  return {
    slug: anomaly.slug,
    name: anomaly.name,
    scientificName: anomaly.scientificName ?? '',
    category: anomaly.category,
    description: anomaly.description ?? '',
    images,
    videoResources,
    articleResources,
    confusedWithInput: (anomaly.confusedWith ?? []).join('\n'),
    ...listTexts
  };
}

function nonEmpty(text?: string): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  return trimmed === '' ? undefined : trimmed;
}

function nonEmptyList(text: string): string[] | undefined {
  const lines = uniqueLines(text);
  return lines.length === 0 ? undefined : lines;
}

function createdLists(state: AnomalyFormState) {
  return Object.fromEntries(
    ANOMALY_TEXT_LIST_FIELDS.flatMap((field) => {
      const lines = nonEmptyList(state[field]);
      return lines ? [[field, lines]] : [];
    })
  ) as Partial<Record<AnomalyTextListField, string[]>>;
}

function buildResourcesFromState(state: AnomalyFormState): SupportResource[] {
  const images: SupportResource[] = state.images
    .filter((img) => img.url.trim() !== '')
    .map((img) => {
      const title = nonEmpty(img.title);
      const source = nonEmpty(img.source);
      return {
        type: 'image',
        url: img.url.trim(),
        ...(title ? { title } : {}),
        ...(source ? { source } : {})
      };
    });

  const videos: SupportResource[] = state.videoResources
    .filter((v) => v.url.trim() !== '')
    .map((v) => {
      const title = nonEmpty(v.title);
      return {
        type: 'video',
        url: v.url.trim(),
        ...(title ? { title } : {})
      };
    });

  const articles: SupportResource[] = state.articleResources
    .filter((a) => a.url.trim() !== '')
    .map((a) => {
      const title = nonEmpty(a.title);
      return {
        type: 'article',
        url: a.url.trim(),
        ...(title ? { title } : {})
      };
    });

  return [...images, ...videos, ...articles];
}

export function formStateToCreateAnomalyRequest(
  state: AnomalyFormState,
  id?: string
): CreateAnomalyRequest {
  const resources = buildResourcesFromState(state);
  const confusedWith = uniqueLines(state.confusedWithInput);

  return {
    id: id || crypto.randomUUID(),
    slug: state.slug.trim(),
    name: state.name.trim(),
    category: state.category as CreateAnomalyRequest['category'],
    scientificName: nonEmpty(state.scientificName),
    description: nonEmpty(state.description),
    ...(resources.length > 0 ? { resources } : {}),
    ...(confusedWith.length > 0 ? { confusedWith } : {}),
    ...createdLists(state)
  };
}

function sameLines(current: string, initial: string): boolean {
  return uniqueLines(current).join('\n') === uniqueLines(initial).join('\n');
}

function changedLists(
  state: AnomalyFormState,
  initial: AnomalyFormState
): UpdateAnomalyRequest {
  return Object.fromEntries(
    ANOMALY_TEXT_LIST_FIELDS.flatMap((field) =>
      sameLines(state[field], initial[field])
        ? []
        : [[field, nonEmptyList(state[field]) ?? null]]
    )
  );
}

function changedScalars(
  state: AnomalyFormState,
  initial: AnomalyFormState
): UpdateAnomalyRequest {
  const patch: UpdateAnomalyRequest = {};
  if (state.name.trim() !== initial.name.trim()) {
    patch.name = state.name.trim();
  }
  if (state.category !== initial.category && state.category !== '') {
    patch.category = state.category;
  }
  if (state.scientificName.trim() !== initial.scientificName.trim()) {
    patch.scientificName = nonEmpty(state.scientificName) ?? null;
  }
  if (state.description.trim() !== initial.description.trim()) {
    patch.description = nonEmpty(state.description) ?? null;
  }
  return patch;
}

function changedResources(
  state: AnomalyFormState,
  initial: AnomalyFormState
): Pick<UpdateAnomalyRequest, 'resources'> {
  const current = buildResourcesFromState(state);
  const initialList = buildResourcesFromState(initial);

  if (JSON.stringify(current) === JSON.stringify(initialList)) {
    return {};
  }

  if (current.length === 0) {
    return initialList.length > 0 ? { resources: null } : {};
  }

  return { resources: current };
}

function changedConfusedWith(
  state: AnomalyFormState,
  initial: AnomalyFormState
): Pick<UpdateAnomalyRequest, 'confusedWith'> {
  const current = uniqueLines(state.confusedWithInput);
  const initialList = uniqueLines(initial.confusedWithInput);

  if (JSON.stringify(current) === JSON.stringify(initialList)) {
    return {};
  }

  if (current.length === 0) {
    return initialList.length > 0 ? { confusedWith: null } : {};
  }

  return { confusedWith: current };
}

export function formStateToUpdateAnomalyRequest(
  state: AnomalyFormState,
  initial: AnomalyFormState
): UpdateAnomalyRequest {
  return {
    ...changedScalars(state, initial),
    ...changedLists(state, initial),
    ...changedResources(state, initial),
    ...changedConfusedWith(state, initial)
  };
}

export interface NormalizedAnomalyErrors {
  fieldErrors: Record<string, string>;
  unmappedErrors: string[];
}

const KNOWN_ANOMALY_FORM_FIELDS: ReadonlySet<string> = new Set([
  'slug',
  'name',
  'scientificName',
  'category',
  'description',
  'resources',
  'confusedWith',
  'images',
  'videoResources',
  'articleResources',
  'confusedWithInput',
  ...ANOMALY_TEXT_LIST_FIELDS
]);

function errorFieldKey(key: string): string {
  return key.split(/[.[]/)[0];
}

export function normalizeAnomalyApiErrors(
  errors: Record<string, string>
): NormalizedAnomalyErrors {
  const fieldErrors: Record<string, string> = {};
  const unmappedErrors: string[] = [];

  for (const [key, message] of Object.entries(errors)) {
    const field = errorFieldKey(key);
    if (KNOWN_ANOMALY_FORM_FIELDS.has(field)) {
      fieldErrors[field] = message;
    } else {
      unmappedErrors.push(message);
    }
  }

  return { fieldErrors, unmappedErrors };
}
