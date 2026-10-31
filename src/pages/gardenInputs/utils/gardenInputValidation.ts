import { t } from '../../../i18n/core/t';
import type { SupportResource } from '../../../types/SupportResource';
import {
  GARDEN_INPUT_CATEGORIES,
  type CreateGardenInputRequest,
  type DosageMethod,
  type GardenInput,
  type GardenInputAction,
  type GardenInputCategory,
  type Recipe,
  type UpdateGardenInputRequest
} from '../../../types/GardenInput/GardenInput';

import {
  MAX_RESOURCES,
  RESOURCE_URL_MAX_LENGTH,
  type ArticleResourceFormItem,
  type ImageResourceFormItem,
  type VideoResourceFormItem
} from '../../../shared/types/ResourceFormItem';

export type {
  ArticleResourceFormItem,
  ImageResourceFormItem,
  VideoResourceFormItem
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESOURCE_URL_REGEX = /^https?:\/\//;

export interface RecipeFormValue {
  name: string;
  description?: string;
  brewTime?: string;
  ingredients: Array<{ item: string; quantity: string }>;
  instructions: string[];
  dosageMethod: DosageMethod;
  dosageDilution: string;
  dosageFrequency: string;
  storageDuration?: string;
  storageConditions?: string;
  storageSpoilageSigns?: string;
  safetyNotesText?: string;
}

export interface GardenInputFormValues {
  id?: string;
  slug: string;
  name: string;
  category: GardenInputCategory;
  description?: string;
  actions: GardenInputAction[];
  activeIngredientsText?: string;
  nutrientsText?: string;
  targetsText?: string;
  recipes: RecipeFormValue[];
  images: ImageResourceFormItem[];
  videoResources: VideoResourceFormItem[];
  articleResources: ArticleResourceFormItem[];
}

export type GardenInputFormErrors = Record<string, string>;

export function validateGardenInputForm(
  values: GardenInputFormValues,
  options: { isCreate: boolean }
): GardenInputFormErrors {
  const errors: GardenInputFormErrors = {};

  const nameTrimmed = values.name.trim();
  if (nameTrimmed === '') {
    errors.name = t('gardenInput.form.errors.name_required');
  } else if (nameTrimmed.length > 200) {
    errors.name = t('gardenInput.form.errors.name_too_long');
  }

  if (options.isCreate) {
    const slugTrimmed = values.slug.trim();
    if (slugTrimmed === '') {
      errors.slug = t('gardenInput.form.errors.slug_required');
    } else if (slugTrimmed.length > 200 || !SLUG_PATTERN.test(slugTrimmed)) {
      errors.slug = t('gardenInput.form.errors.slug_invalid');
    }
  }

  if (!values.category || !GARDEN_INPUT_CATEGORIES.includes(values.category)) {
    errors.category = t('gardenInput.form.errors.category_required');
  }

  if (values.description && values.description.length > 2000) {
    errors.description = t('gardenInput.form.errors.description_too_long');
  }

  values.recipes.forEach((recipe, rIdx) => {
    const recipeName = recipe.name.trim();
    if (recipeName === '') {
      errors[`recipes.${rIdx}.name`] = t(
        'gardenInput.form.errors.recipe_name_required'
      );
    } else if (recipeName.length > 200) {
      errors[`recipes.${rIdx}.name`] = t(
        'gardenInput.form.errors.recipe_name_too_long'
      );
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors[`recipes.${rIdx}.ingredients`] = t(
        'gardenInput.form.errors.recipe_ingredients_min'
      );
    } else {
      recipe.ingredients.forEach((ing, iIdx) => {
        if (!ing.item.trim()) {
          errors[`recipes.${rIdx}.ingredients.${iIdx}.item`] = t(
            'gardenInput.form.errors.ingredient_item_required'
          );
        }
        if (!ing.quantity.trim()) {
          errors[`recipes.${rIdx}.ingredients.${iIdx}.quantity`] = t(
            'gardenInput.form.errors.ingredient_quantity_required'
          );
        }
      });
    }

    if (!recipe.instructions || recipe.instructions.length === 0) {
      errors[`recipes.${rIdx}.instructions`] = t(
        'gardenInput.form.errors.recipe_instructions_min'
      );
    } else {
      recipe.instructions.forEach((inst, sIdx) => {
        if (!inst.trim()) {
          errors[`recipes.${rIdx}.instructions.${sIdx}`] = t(
            'gardenInput.form.errors.instruction_required'
          );
        }
      });
    }

    if (!recipe.dosageMethod) {
      errors[`recipes.${rIdx}.dosageMethod`] = t(
        'gardenInput.form.errors.dosage_method_required'
      );
    }
    if (!recipe.dosageDilution.trim()) {
      errors[`recipes.${rIdx}.dosageDilution`] = t(
        'gardenInput.form.errors.dosage_dilution_required'
      );
    }
    if (!recipe.dosageFrequency.trim()) {
      errors[`recipes.${rIdx}.dosageFrequency`] = t(
        'gardenInput.form.errors.dosage_frequency_required'
      );
    }

    const hasStorage = Boolean(
      recipe.storageDuration?.trim() ||
      recipe.storageConditions?.trim() ||
      recipe.storageSpoilageSigns?.trim()
    );
    if (hasStorage) {
      if (!recipe.storageDuration?.trim()) {
        errors[`recipes.${rIdx}.storageDuration`] = t(
          'gardenInput.form.errors.storage_duration_required'
        );
      }
      if (!recipe.storageConditions?.trim()) {
        errors[`recipes.${rIdx}.storageConditions`] = t(
          'gardenInput.form.errors.storage_conditions_required'
        );
      }
    }
  });

  validateResources(values, errors);

  return errors;
}

function isValidResourceUrl(url: string): boolean {
  return url.length <= RESOURCE_URL_MAX_LENGTH && RESOURCE_URL_REGEX.test(url);
}

function validateResources(
  values: GardenInputFormValues,
  errors: GardenInputFormErrors
) {
  const images = values.images.filter((img) => img.url.trim() !== '');
  const videos = values.videoResources.filter((v) => v.url.trim() !== '');
  const articles = values.articleResources.filter((a) => a.url.trim() !== '');

  const totalCount = images.length + videos.length + articles.length;
  if (totalCount > MAX_RESOURCES) {
    errors.resources = t('gardenInput.form.errors.resources_max');
    return;
  }

  const allUrls = [...images, ...videos, ...articles].map((r) => r.url.trim());
  const hasInvalidUrl = allUrls.some((url) => !isValidResourceUrl(url));
  if (hasInvalidUrl) {
    errors.resources = t('gardenInput.form.errors.invalid_resource_url');
  }
}

function parseTextLines(text?: string): string[] | undefined {
  if (!text) return undefined;
  const items = text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return items.length > 0 ? items : undefined;
}

export function toRecipeModels(recipes: RecipeFormValue[]): Recipe[] {
  return recipes.map((r) => ({
    name: r.name.trim(),
    description: r.description?.trim() || undefined,
    brewTime: r.brewTime?.trim() || undefined,
    ingredients: r.ingredients.map((i) => ({
      item: i.item.trim(),
      quantity: i.quantity.trim()
    })),
    instructions: r.instructions.map((s) => s.trim()),
    dosage: {
      method: r.dosageMethod,
      dilution: r.dosageDilution.trim(),
      frequency: r.dosageFrequency.trim()
    },
    storage:
      r.storageDuration || r.storageConditions || r.storageSpoilageSigns
        ? {
            duration: r.storageDuration?.trim() || '',
            conditions: r.storageConditions?.trim() || '',
            spoilageSigns: r.storageSpoilageSigns?.trim() || undefined
          }
        : undefined,
    safetyNotes: parseTextLines(r.safetyNotesText)
  }));
}

function nonEmpty(text?: string): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  return trimmed === '' ? undefined : trimmed;
}

function buildResourcesFromState(
  values: GardenInputFormValues
): SupportResource[] {
  const images: SupportResource[] = values.images
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

  const videos: SupportResource[] = values.videoResources
    .filter((v) => v.url.trim() !== '')
    .map((v) => {
      const title = nonEmpty(v.title);
      return {
        type: 'video',
        url: v.url.trim(),
        ...(title ? { title } : {})
      };
    });

  const articles: SupportResource[] = values.articleResources
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

export function toCreateRequest(
  values: GardenInputFormValues
): CreateGardenInputRequest {
  const resources = buildResourcesFromState(values);
  return {
    id: values.id || crypto.randomUUID(),
    slug: values.slug.trim(),
    name: values.name.trim(),
    category: values.category,
    description: values.description?.trim() || undefined,
    actions: values.actions.length > 0 ? values.actions : undefined,
    activeIngredients: parseTextLines(values.activeIngredientsText),
    nutrients: parseTextLines(values.nutrientsText),
    targets: parseTextLines(values.targetsText),
    recipes:
      values.recipes.length > 0 ? toRecipeModels(values.recipes) : undefined,
    ...(resources.length > 0 ? { resources } : {})
  };
}

export function toUpdateRequest(
  values: GardenInputFormValues
): UpdateGardenInputRequest {
  const resources = buildResourcesFromState(values);
  return {
    name: values.name.trim(),
    category: values.category,
    description: values.description?.trim() || null,
    actions: values.actions.length > 0 ? values.actions : null,
    activeIngredients: parseTextLines(values.activeIngredientsText) ?? null,
    nutrients: parseTextLines(values.nutrientsText) ?? null,
    targets: parseTextLines(values.targetsText) ?? null,
    recipes: values.recipes.length > 0 ? toRecipeModels(values.recipes) : null,
    resources: resources.length > 0 ? resources : null
  };
}

export function fromGardenInputEntity(
  entity: GardenInput
): GardenInputFormValues {
  const images = (entity.resources ?? [])
    .filter((r) => r.type === 'image')
    .map((r) => ({
      id: crypto.randomUUID(),
      url: r.url,
      title: r.title ?? '',
      source: r.source ?? ''
    }));

  const videoResources = (entity.resources ?? [])
    .filter((r) => r.type === 'video')
    .map((r) => ({
      id: crypto.randomUUID(),
      url: r.url,
      title: r.title ?? ''
    }));

  const articleResources = (entity.resources ?? [])
    .filter((r) => r.type === 'article')
    .map((r) => ({
      id: crypto.randomUUID(),
      url: r.url,
      title: r.title ?? ''
    }));

  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    category: entity.category,
    description: entity.description ?? '',
    actions: entity.actions ?? [],
    activeIngredientsText: entity.activeIngredients?.join(', ') ?? '',
    nutrientsText: entity.nutrients?.join(', ') ?? '',
    targetsText: entity.targets?.join(', ') ?? '',
    images,
    videoResources,
    articleResources,
    recipes: (entity.recipes ?? []).map((r) => ({
      name: r.name,
      description: r.description ?? '',
      brewTime: r.brewTime ?? '',
      ingredients: r.ingredients.map((i) => ({ ...i })),
      instructions: [...r.instructions],
      dosageMethod: r.dosage.method,
      dosageDilution: r.dosage.dilution,
      dosageFrequency: r.dosage.frequency,
      storageDuration: r.storage?.duration ?? '',
      storageConditions: r.storage?.conditions ?? '',
      storageSpoilageSigns: r.storage?.spoilageSigns ?? '',
      safetyNotesText: r.safetyNotes?.join('\n') ?? ''
    }))
  };
}
