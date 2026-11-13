import { useState } from 'react';

import { t } from '../../../i18n/core/t';
import { FormAddButton } from '../../../shared/components/FormButtons';
import type {
  GardenInputFormErrors,
  RecipeFormValue
} from '../utils/gardenInputValidation';
import { RecipeFormCard } from './RecipeFormCard';

import './recipeFormSection.css';

export interface RecipeFormSectionProps {
  readonly recipes: RecipeFormValue[];
  readonly errors: GardenInputFormErrors;
  readonly onChange: (recipes: RecipeFormValue[]) => void;
}

function createEmptyRecipe(): RecipeFormValue {
  return {
    name: '',
    description: '',
    brewTime: '',
    ingredients: [{ item: '', quantity: '' }],
    instructions: [''],
    dosageMethod: 'foliar',
    dosageDilution: '',
    dosageFrequency: '',
    storageDuration: '',
    storageConditions: '',
    storageSpoilageSigns: '',
    safetyNotesText: ''
  };
}

export default function RecipeFormSection({
  recipes,
  errors,
  onChange
}: RecipeFormSectionProps) {
  const [recipeKeys, setRecipeKeys] = useState<string[]>(() =>
    recipes.map(() => crypto.randomUUID())
  );
  const [prevRecipeCount, setPrevRecipeCount] = useState(recipes.length);

  if (recipes.length !== prevRecipeCount) {
    setPrevRecipeCount(recipes.length);
    const nextKeys = [...recipeKeys];
    while (nextKeys.length < recipes.length) {
      nextKeys.push(crypto.randomUUID());
    }
    setRecipeKeys(nextKeys.slice(0, recipes.length));
  }

  function handleAddRecipe() {
    setRecipeKeys((prev) => [...prev, crypto.randomUUID()]);
    setPrevRecipeCount(recipes.length + 1);
    onChange([...recipes, createEmptyRecipe()]);
  }

  function handleRemoveRecipe(index: number) {
    setRecipeKeys((prev) => prev.filter((_, i) => i !== index));
    setPrevRecipeCount(recipes.length - 1);
    onChange(recipes.filter((_, i) => i !== index));
  }

  function handleUpdateRecipe<K extends keyof RecipeFormValue>(
    index: number,
    field: K,
    value: RecipeFormValue[K]
  ) {
    const updated = recipes.map((recipe, i) =>
      i === index ? { ...recipe, [field]: value } : recipe
    );
    onChange(updated);
  }

  function handleAddIngredient(recipeIndex: number) {
    const recipe = recipes[recipeIndex];
    const updated = {
      ...recipe,
      ingredients: [...recipe.ingredients, { item: '', quantity: '' }]
    };
    onChange(recipes.map((r, i) => (i === recipeIndex ? updated : r)));
  }

  function handleRemoveIngredient(recipeIndex: number, ingIndex: number) {
    const recipe = recipes[recipeIndex];
    const updated = {
      ...recipe,
      ingredients: recipe.ingredients.filter((_, i) => i !== ingIndex)
    };
    onChange(recipes.map((r, i) => (i === recipeIndex ? updated : r)));
  }

  function handleUpdateIngredient(
    recipeIndex: number,
    ingIndex: number,
    field: 'item' | 'quantity',
    val: string
  ) {
    const recipe = recipes[recipeIndex];
    const updated = {
      ...recipe,
      ingredients: recipe.ingredients.map((ing, i) =>
        i === ingIndex ? { ...ing, [field]: val } : ing
      )
    };
    onChange(recipes.map((r, i) => (i === recipeIndex ? updated : r)));
  }

  function handleAddInstruction(recipeIndex: number) {
    const recipe = recipes[recipeIndex];
    const updated = {
      ...recipe,
      instructions: [...recipe.instructions, '']
    };
    onChange(recipes.map((r, i) => (i === recipeIndex ? updated : r)));
  }

  function handleRemoveInstruction(recipeIndex: number, stepIndex: number) {
    const recipe = recipes[recipeIndex];
    const updated = {
      ...recipe,
      instructions: recipe.instructions.filter((_, i) => i !== stepIndex)
    };
    onChange(recipes.map((r, i) => (i === recipeIndex ? updated : r)));
  }

  function handleUpdateInstruction(
    recipeIndex: number,
    stepIndex: number,
    val: string
  ) {
    const recipe = recipes[recipeIndex];
    const updated = {
      ...recipe,
      instructions: recipe.instructions.map((step, i) =>
        i === stepIndex ? val : step
      )
    };
    onChange(recipes.map((r, i) => (i === recipeIndex ? updated : r)));
  }

  return (
    <div className="recipe-form-section">
      <div className="recipe-form-section__header">
        <h3 className="recipe-form-section__title">
          {t('gardenInput.form.recipes_section')}
        </h3>
        <FormAddButton
          onClick={handleAddRecipe}
          label={t('gardenInput.form.add_recipe')}
        />
      </div>

      {recipeKeys.map((key, rIdx) => {
        const recipe = recipes[rIdx];
        if (!recipe) return null;
        return (
          <RecipeFormCard
            key={key}
            recipe={recipe}
            rIdx={rIdx}
            errors={errors}
            onUpdate={(field, value) => handleUpdateRecipe(rIdx, field, value)}
            onRemove={() => handleRemoveRecipe(rIdx)}
            onAddIngredient={() => handleAddIngredient(rIdx)}
            onRemoveIngredient={(ingIdx) =>
              handleRemoveIngredient(rIdx, ingIdx)
            }
            onUpdateIngredient={(ingIdx, field, val) =>
              handleUpdateIngredient(rIdx, ingIdx, field, val)
            }
            onAddInstruction={() => handleAddInstruction(rIdx)}
            onRemoveInstruction={(stepIdx) =>
              handleRemoveInstruction(rIdx, stepIdx)
            }
            onUpdateInstruction={(stepIdx, val) =>
              handleUpdateInstruction(rIdx, stepIdx, val)
            }
          />
        );
      })}
    </div>
  );
}
