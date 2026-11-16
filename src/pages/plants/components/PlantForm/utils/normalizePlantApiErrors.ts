import { t } from '../../../../../i18n/core/t';
import { ApiError } from '../../../../../shared/errors/ApiError';

export interface NormalizedPlantErrors {
  fieldErrors: Record<string, string>;
  unmappedErrors: string[];
}

const DIRECT_FORM_ERROR_KEYS = new Set<string>([
  'primaryName',
  'scientificName',
  'familyId',
  'height',
  'spread',
  'spacing',
  'sowingMonths',
  'seedsPerHole',
  'germinationDays',
  'directDepth',
  'starterDepth',
  'soilPh',
  'soilDepth',
  'rootDepth',
  'rootSpread',
  'imageUrl'
]);

function mapIdentityField(key: string): string | null {
  if (key === 'identity.name.primary' || key === 'identity.name') {
    return 'primaryName';
  }
  if (key === 'identity.scientificName') return 'scientificName';
  if (key === 'identity.family') return 'familyId';
  return null;
}

function mapTraitsField(key: string): string | null {
  if (key.startsWith('traits.size.height')) return 'height';
  if (key.startsWith('traits.size.spread')) return 'spread';
  if (key.startsWith('traits.spacingCm')) return 'spacing';
  return null;
}

function mapPhenologyField(key: string): string | null {
  if (key.startsWith('phenology.sowing.months')) return 'sowingMonths';
  if (key.startsWith('phenology.sowing.seedsPerHole')) return 'seedsPerHole';
  if (key.startsWith('phenology.sowing.germinationDays')) {
    return 'germinationDays';
  }
  if (key.startsWith('phenology.sowing.methods.direct')) return 'directDepth';
  if (key.startsWith('phenology.sowing.methods.starter')) return 'starterDepth';
  return null;
}

function mapKnowledgeField(key: string): string | null {
  if (
    key === 'knowledge.resources' ||
    key.startsWith('knowledge.resources.0.')
  ) {
    return 'imageUrl';
  }
  if (key.startsWith('knowledge.soil.ph')) return 'soilPh';
  if (key.startsWith('knowledge.soil.availableDepthCm')) return 'soilDepth';
  if (key.startsWith('knowledge.rootSystem.depthCm')) return 'rootDepth';
  if (key.startsWith('knowledge.rootSystem.spreadCm')) return 'rootSpread';
  return null;
}

function mapApiKeyToFormField(key: string): string | null {
  if (DIRECT_FORM_ERROR_KEYS.has(key)) return key;
  if (/^videoUrl_\d+$/.test(key) || /^articleUrl_\d+$/.test(key)) return key;

  if (key.startsWith('identity.')) return mapIdentityField(key);
  if (key.startsWith('traits.')) return mapTraitsField(key);
  if (key.startsWith('phenology.')) return mapPhenologyField(key);
  if (key.startsWith('knowledge.')) return mapKnowledgeField(key);

  return null;
}

export function normalizePlantApiErrors(
  errors: Record<string, string>
): NormalizedPlantErrors {
  const fieldErrors: Record<string, string> = {};
  const unmappedErrors: string[] = [];

  for (const [key, msg] of Object.entries(errors)) {
    const fieldKey = mapApiKeyToFormField(key);
    if (fieldKey) {
      fieldErrors[fieldKey] = msg;
    } else {
      unmappedErrors.push(msg);
    }
  }

  return { fieldErrors, unmappedErrors };
}

export function focusFirstPlantError(): void {
  setTimeout(() => {
    const firstErrorElement = document.querySelector<HTMLElement>(
      '.plant-form [aria-invalid="true"], .plant-form [role="alert"]'
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

export function handlePlantSubmitError(
  err: unknown,
  actions: {
    setErrors: (errors: Record<string, string>) => void;
    showErrorToast: (msg: unknown) => void;
  }
): void {
  if (err instanceof ApiError) {
    if (err.errors) {
      const { fieldErrors, unmappedErrors } = normalizePlantApiErrors(
        err.errors
      );
      actions.setErrors(fieldErrors);
      if (unmappedErrors.length > 0) {
        actions.showErrorToast(unmappedErrors.join('; '));
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
        message: t('plant.form.duplicate_error')
      });
      return;
    }
  }
  actions.showErrorToast(err);
}
