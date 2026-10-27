import { t } from '../../../i18n/core/t';
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

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

  return errors;
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

export function toCreateRequest(
  values: GardenInputFormValues
): CreateGardenInputRequest {
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
      values.recipes.length > 0 ? toRecipeModels(values.recipes) : undefined
  };
}

export function toUpdateRequest(
  values: GardenInputFormValues
): UpdateGardenInputRequest {
  return {
    name: values.name.trim(),
    category: values.category,
    description: values.description?.trim() || null,
    actions: values.actions.length > 0 ? values.actions : null,
    activeIngredients: parseTextLines(values.activeIngredientsText) ?? null,
    nutrients: parseTextLines(values.nutrientsText) ?? null,
    targets: parseTextLines(values.targetsText) ?? null,
    recipes: values.recipes.length > 0 ? toRecipeModels(values.recipes) : null
  };
}

export function fromGardenInputEntity(
  entity: GardenInput
): GardenInputFormValues {
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
