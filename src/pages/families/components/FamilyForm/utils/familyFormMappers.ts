import type {
  CreateFamilyRequest,
  Family,
  UpdateFamilyRequest
} from '../../../../../types/Family';
import type { FamilyFormState } from '../types';
import { slugify } from './slugify';

export function initialFamilyFormState(): FamilyFormState {
  return {
    name: '',
    scientificName: '',
    slug: '',
    shortDescription: '',
    highlights: [],
    aliases: [],
    order: '',
    distribution: '',
    speciesCount: ''
  };
}

export function canonicalFamilyToFormState(family: Family): FamilyFormState {
  return {
    name: family.name,
    scientificName: family.scientificName,
    slug: family.slug || slugify(family.scientificName),
    shortDescription: family.shortDescription,
    highlights: family.highlights ?? [],
    aliases: family.aliases ?? [],
    order: family.extra?.order ?? '',
    distribution: family.extra?.distribution ?? '',
    speciesCount: family.extra?.speciesCount
      ? String(family.extra.speciesCount)
      : ''
  };
}

function buildExtra(state: FamilyFormState) {
  const extra: NonNullable<CreateFamilyRequest['extra']> = {};
  if (state.order.trim()) extra.order = state.order.trim();
  if (state.distribution.trim()) extra.distribution = state.distribution.trim();
  if (state.speciesCount.trim()) {
    extra.speciesCount = Number(state.speciesCount);
  }
  return Object.keys(extra).length > 0 ? extra : undefined;
}

export function formStateToCreateFamilyRequest(
  state: FamilyFormState,
  id?: string
): CreateFamilyRequest {
  const extra = buildExtra(state);

  return {
    id: id || crypto.randomUUID(),
    name: state.name.trim(),
    scientificName: state.scientificName.trim(),
    slug: state.slug.trim(),
    shortDescription: state.shortDescription.trim(),
    highlights: state.highlights,
    aliases: state.aliases.length > 0 ? state.aliases : undefined,
    extra
  };
}

export function formStateToUpdateFamilyRequest(
  state: FamilyFormState
): UpdateFamilyRequest {
  const extra = buildExtra(state);

  return {
    name: state.name.trim(),
    scientificName: state.scientificName.trim(),
    slug: state.slug.trim(),
    shortDescription: state.shortDescription.trim(),
    highlights: state.highlights,
    aliases: state.aliases,
    extra: {
      order: extra?.order ?? null,
      distribution: extra?.distribution ?? null,
      speciesCount: extra?.speciesCount ?? null
    }
  };
}

export interface NormalizedFamilyErrors {
  fieldErrors: Record<string, string>;
  unmappedErrors: string[];
}

const KNOWN_FAMILY_FORM_FIELDS = new Set([
  'name',
  'scientificName',
  'slug',
  'shortDescription',
  'highlights',
  'aliases',
  'order',
  'distribution',
  'speciesCount'
]);

export function normalizeFamilyApiErrors(
  errors: Record<string, string>
): NormalizedFamilyErrors {
  const fieldErrors: Record<string, string> = {};
  const unmappedErrors: string[] = [];

  for (const [key, msg] of Object.entries(errors)) {
    const fieldKey = key.startsWith('extra.') ? key.replace('extra.', '') : key;
    if (KNOWN_FAMILY_FORM_FIELDS.has(fieldKey)) {
      fieldErrors[fieldKey] = msg;
    } else {
      unmappedErrors.push(msg);
    }
  }

  return { fieldErrors, unmappedErrors };
}
