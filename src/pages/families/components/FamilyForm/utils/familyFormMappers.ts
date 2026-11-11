import { t } from '../../../../../i18n/core/t';
import { ApiError } from '../../../../../shared/errors/ApiError';
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

export function focusFirstFamilyError(): void {
  setTimeout(() => {
    const firstErrorElement = document.querySelector<HTMLElement>(
      '.family-form [aria-invalid="true"], .family-form [role="alert"]'
    );
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center'
      });
      firstErrorElement.focus?.();
    }
  }, 0);
}

export function handleFamilySubmitError(
  err: unknown,
  actions: {
    setErrors: (errors: Record<string, string>) => void;
    showErrorToast: (msg: unknown) => void;
  }
): void {
  if (err instanceof ApiError) {
    if (err.errors) {
      const { fieldErrors, unmappedErrors } = normalizeFamilyApiErrors(
        err.errors
      );
      actions.setErrors(fieldErrors);
      if (unmappedErrors.length > 0) {
        actions.showErrorToast(unmappedErrors.join('; '));
      } else if (Object.keys(fieldErrors).length === 0) {
        actions.showErrorToast({
          title: t('admin.toast_error_title'),
          message:
            err.status === 409 ? t('family.form.duplicate_error') : err.message
        });
      } else {
        actions.showErrorToast({
          title: t('admin.toast_error_title'),
          message: t('toast.form_validation_check')
        });
      }
      return;
    }
    if (err.status === 409) {
      actions.showErrorToast({
        title: t('admin.toast_error_title'),
        message: t('family.form.duplicate_error')
      });
      return;
    }
  }
  actions.showErrorToast(err);
}
