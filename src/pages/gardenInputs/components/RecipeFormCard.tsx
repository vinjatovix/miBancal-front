import { useState } from 'react';

import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import {
  FormAddButton,
  FormRemoveButton
} from '../../../shared/components/FormButtons';
import {
  DOSAGE_METHODS,
  type DosageMethod
} from '../../../types/GardenInput/GardenInput';
import type {
  GardenInputFormErrors,
  RecipeFormValue
} from '../utils/gardenInputValidation';

export interface RecipeFormCardProps {
  readonly recipe: RecipeFormValue;
  readonly rIdx: number;
  readonly errors: GardenInputFormErrors;
  readonly onUpdate: <K extends keyof RecipeFormValue>(
    field: K,
    value: RecipeFormValue[K]
  ) => void;
  readonly onRemove: () => void;
  readonly onAddIngredient: () => void;
  readonly onRemoveIngredient: (ingIdx: number) => void;
  readonly onUpdateIngredient: (
    ingIdx: number,
    field: 'item' | 'quantity',
    val: string
  ) => void;
  readonly onAddInstruction: () => void;
  readonly onRemoveInstruction: (stepIdx: number) => void;
  readonly onUpdateInstruction: (stepIdx: number, val: string) => void;
}

export function RecipeFormCard({
  recipe,
  rIdx,
  errors,
  onUpdate,
  onRemove,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  onAddInstruction,
  onRemoveInstruction,
  onUpdateInstruction
}: RecipeFormCardProps) {
  const [ingKeys, setIngKeys] = useState<string[]>(() =>
    recipe.ingredients.map(() => crypto.randomUUID())
  );
  const [prevIngCount, setPrevIngCount] = useState(recipe.ingredients.length);

  if (recipe.ingredients.length !== prevIngCount) {
    setPrevIngCount(recipe.ingredients.length);
    const nextKeys = [...ingKeys];
    while (nextKeys.length < recipe.ingredients.length) {
      nextKeys.push(crypto.randomUUID());
    }
    setIngKeys(nextKeys.slice(0, recipe.ingredients.length));
  }

  const [instKeys, setInstKeys] = useState<string[]>(() =>
    recipe.instructions.map(() => crypto.randomUUID())
  );
  const [prevInstCount, setPrevInstCount] = useState(
    recipe.instructions.length
  );

  if (recipe.instructions.length !== prevInstCount) {
    setPrevInstCount(recipe.instructions.length);
    const nextKeys = [...instKeys];
    while (nextKeys.length < recipe.instructions.length) {
      nextKeys.push(crypto.randomUUID());
    }
    setInstKeys(nextKeys.slice(0, recipe.instructions.length));
  }

  const handleAddIngredient = () => {
    setIngKeys((prev) => [...prev, crypto.randomUUID()]);
    setPrevIngCount(recipe.ingredients.length + 1);
    onAddIngredient();
  };

  const handleRemoveIngredient = (ingIdx: number) => {
    setIngKeys((prev) => prev.filter((_, i) => i !== ingIdx));
    setPrevIngCount(recipe.ingredients.length - 1);
    onRemoveIngredient(ingIdx);
  };

  const handleAddInstruction = () => {
    setInstKeys((prev) => [...prev, crypto.randomUUID()]);
    setPrevInstCount(recipe.instructions.length + 1);
    onAddInstruction();
  };

  const handleRemoveInstruction = (stepIdx: number) => {
    setInstKeys((prev) => prev.filter((_, i) => i !== stepIdx));
    setPrevInstCount(recipe.instructions.length - 1);
    onRemoveInstruction(stepIdx);
  };

  const recipeNameError = errors[`recipes.${rIdx}.name`];
  const ingredientsError = errors[`recipes.${rIdx}.ingredients`];
  const instructionsError = errors[`recipes.${rIdx}.instructions`];
  const dosageMethodError = errors[`recipes.${rIdx}.dosageMethod`];
  const dosageDilutionError = errors[`recipes.${rIdx}.dosageDilution`];
  const dosageFrequencyError = errors[`recipes.${rIdx}.dosageFrequency`];
  const storageDurationError = errors[`recipes.${rIdx}.storageDuration`];
  const storageConditionsError = errors[`recipes.${rIdx}.storageConditions`];

  return (
    <div className="recipe-form-card">
      <div className="recipe-form-card__header">
        <h4>
          {recipe.name || `${t('gardenInput.form.recipe_name')} #${rIdx + 1}`}
        </h4>
        <FormRemoveButton
          onClick={onRemove}
          ariaLabel={`${t('gardenInput.form.remove_recipe')} ${rIdx + 1}`}
          label={t('gardenInput.form.remove_recipe')}
        />
      </div>

      <div className="recipe-form-field">
        <label htmlFor={`recipe-${rIdx}-name`}>
          {t('gardenInput.form.recipe_name')} *
        </label>
        <input
          id={`recipe-${rIdx}-name`}
          type="text"
          className="recipe-form-input"
          value={recipe.name}
          placeholder={t('gardenInput.form.recipe_name_placeholder')}
          onChange={(e) => onUpdate('name', e.target.value)}
        />
        {recipeNameError && (
          <span className="recipe-form-error" role="alert">
            {recipeNameError}
          </span>
        )}
      </div>

      <div className="recipe-form-field">
        <label htmlFor={`recipe-${rIdx}-description`}>
          {t('gardenInput.form.recipe_description')}
        </label>
        <textarea
          id={`recipe-${rIdx}-description`}
          className="recipe-form-textarea"
          value={recipe.description ?? ''}
          placeholder={t('gardenInput.form.recipe_description_placeholder')}
          onChange={(e) => onUpdate('description', e.target.value)}
        />
      </div>

      <div className="recipe-form-field">
        <label htmlFor={`recipe-${rIdx}-brewTime`}>
          {t('gardenInput.form.recipe_brew_time')}
        </label>
        <input
          id={`recipe-${rIdx}-brewTime`}
          type="text"
          className="recipe-form-input"
          value={recipe.brewTime ?? ''}
          placeholder={t('gardenInput.form.recipe_brew_time_placeholder')}
          onChange={(e) => onUpdate('brewTime', e.target.value)}
        />
      </div>

      <div className="recipe-form-sub-section">
        <div className="recipe-form-sub-section__header">
          <h5>{t('gardenInput.form.recipe_ingredients')} *</h5>
          <FormAddButton
            onClick={handleAddIngredient}
            label={t('gardenInput.form.add_ingredient')}
          />
        </div>
        {ingredientsError && (
          <span className="recipe-form-error" role="alert">
            {ingredientsError}
          </span>
        )}

        {ingKeys.map((key, iIdx) => {
          const ing = recipe.ingredients[iIdx];
          if (!ing) return null;
          const itemError = errors[`recipes.${rIdx}.ingredients.${iIdx}.item`];
          const qtyError =
            errors[`recipes.${rIdx}.ingredients.${iIdx}.quantity`];

          return (
            <div key={key} className="recipe-form-row">
              <div className="recipe-form-row__col">
                <input
                  type="text"
                  className="recipe-form-input"
                  placeholder={t(
                    'gardenInput.form.ingredient_item_placeholder'
                  )}
                  value={ing.item}
                  onChange={(e) =>
                    onUpdateIngredient(iIdx, 'item', e.target.value)
                  }
                  aria-label={`${t('gardenInput.form.ingredient_item')} ${iIdx + 1}`}
                />
                {itemError && (
                  <span className="recipe-form-error" role="alert">
                    {itemError}
                  </span>
                )}
              </div>

              <div className="recipe-form-row__col">
                <input
                  type="text"
                  className="recipe-form-input"
                  placeholder={t(
                    'gardenInput.form.ingredient_quantity_placeholder'
                  )}
                  value={ing.quantity}
                  onChange={(e) =>
                    onUpdateIngredient(iIdx, 'quantity', e.target.value)
                  }
                  aria-label={`${t('gardenInput.form.ingredient_quantity')} ${iIdx + 1}`}
                />
                {qtyError && (
                  <span className="recipe-form-error" role="alert">
                    {qtyError}
                  </span>
                )}
              </div>

              {recipe.ingredients.length > 1 && (
                <FormRemoveButton
                  onClick={() => handleRemoveIngredient(iIdx)}
                  ariaLabel={`${t('gardenInput.form.remove_ingredient')} ${iIdx + 1}`}
                  iconName="close"
                  iconOnly
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="recipe-form-sub-section">
        <div className="recipe-form-sub-section__header">
          <h5>{t('gardenInput.form.recipe_instructions')} *</h5>
          <FormAddButton
            onClick={handleAddInstruction}
            label={t('gardenInput.form.add_instruction')}
          />
        </div>
        {instructionsError && (
          <span className="recipe-form-error" role="alert">
            {instructionsError}
          </span>
        )}

        {instKeys.map((key, sIdx) => {
          const inst = recipe.instructions[sIdx];
          if (inst === undefined) return null;
          const stepError = errors[`recipes.${rIdx}.instructions.${sIdx}`];

          return (
            <div key={key} className="recipe-form-row">
              <div className="recipe-form-row__col">
                <input
                  type="text"
                  className="recipe-form-input"
                  placeholder={t('gardenInput.form.instruction_placeholder')}
                  value={inst}
                  onChange={(e) => onUpdateInstruction(sIdx, e.target.value)}
                  aria-label={t('gardenInput.form.instruction_step', {
                    step: sIdx + 1
                  })}
                />
                {stepError && (
                  <span className="recipe-form-error" role="alert">
                    {stepError}
                  </span>
                )}
              </div>

              {recipe.instructions.length > 1 && (
                <FormRemoveButton
                  onClick={() => handleRemoveInstruction(sIdx)}
                  ariaLabel={`${t('gardenInput.form.remove_instruction')} ${sIdx + 1}`}
                  iconName="close"
                  iconOnly
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="recipe-form-grid">
        <div className="recipe-form-field">
          <label htmlFor={`recipe-${rIdx}-dosageMethod`}>
            {t('gardenInput.form.recipe_dosage_method')} *
          </label>
          <select
            id={`recipe-${rIdx}-dosageMethod`}
            className="recipe-form-select"
            value={recipe.dosageMethod}
            onChange={(e) =>
              onUpdate('dosageMethod', e.target.value as DosageMethod)
            }
          >
            {DOSAGE_METHODS.map((method) => (
              <option key={method} value={method}>
                {tValue('gardenInput.dosageMethodValues', method)}
              </option>
            ))}
          </select>
          {dosageMethodError && (
            <span className="recipe-form-error" role="alert">
              {dosageMethodError}
            </span>
          )}
        </div>

        <div className="recipe-form-field">
          <label htmlFor={`recipe-${rIdx}-dosageDilution`}>
            {t('gardenInput.form.recipe_dosage_dilution')} *
          </label>
          <input
            id={`recipe-${rIdx}-dosageDilution`}
            type="text"
            className="recipe-form-input"
            value={recipe.dosageDilution}
            placeholder={t(
              'gardenInput.form.recipe_dosage_dilution_placeholder'
            )}
            onChange={(e) => onUpdate('dosageDilution', e.target.value)}
          />
          {dosageDilutionError && (
            <span className="recipe-form-error" role="alert">
              {dosageDilutionError}
            </span>
          )}
        </div>

        <div className="recipe-form-field">
          <label htmlFor={`recipe-${rIdx}-dosageFrequency`}>
            {t('gardenInput.form.recipe_dosage_frequency')} *
          </label>
          <input
            id={`recipe-${rIdx}-dosageFrequency`}
            type="text"
            className="recipe-form-input"
            value={recipe.dosageFrequency}
            placeholder={t(
              'gardenInput.form.recipe_dosage_frequency_placeholder'
            )}
            onChange={(e) => onUpdate('dosageFrequency', e.target.value)}
          />
          {dosageFrequencyError && (
            <span className="recipe-form-error" role="alert">
              {dosageFrequencyError}
            </span>
          )}
        </div>
      </div>

      <div className="recipe-form-grid">
        <div className="recipe-form-field">
          <label htmlFor={`recipe-${rIdx}-storageDuration`}>
            {t('gardenInput.form.recipe_storage_duration')}
          </label>
          <input
            id={`recipe-${rIdx}-storageDuration`}
            type="text"
            className="recipe-form-input"
            value={recipe.storageDuration ?? ''}
            placeholder={t(
              'gardenInput.form.recipe_storage_duration_placeholder'
            )}
            onChange={(e) => onUpdate('storageDuration', e.target.value)}
          />
          {storageDurationError && (
            <span className="recipe-form-error" role="alert">
              {storageDurationError}
            </span>
          )}
        </div>

        <div className="recipe-form-field">
          <label htmlFor={`recipe-${rIdx}-storageConditions`}>
            {t('gardenInput.form.recipe_storage_conditions')}
          </label>
          <input
            id={`recipe-${rIdx}-storageConditions`}
            type="text"
            className="recipe-form-input"
            value={recipe.storageConditions ?? ''}
            placeholder={t(
              'gardenInput.form.recipe_storage_conditions_placeholder'
            )}
            onChange={(e) => onUpdate('storageConditions', e.target.value)}
          />
          {storageConditionsError && (
            <span className="recipe-form-error" role="alert">
              {storageConditionsError}
            </span>
          )}
        </div>

        <div className="recipe-form-field">
          <label htmlFor={`recipe-${rIdx}-storageSpoilage`}>
            {t('gardenInput.form.recipe_storage_spoilage')}
          </label>
          <input
            id={`recipe-${rIdx}-storageSpoilage`}
            type="text"
            className="recipe-form-input"
            value={recipe.storageSpoilageSigns ?? ''}
            placeholder={t(
              'gardenInput.form.recipe_storage_spoilage_placeholder'
            )}
            onChange={(e) => onUpdate('storageSpoilageSigns', e.target.value)}
          />
        </div>
      </div>

      <div className="recipe-form-field">
        <label htmlFor={`recipe-${rIdx}-safetyNotes`}>
          {t('gardenInput.form.recipe_safety_notes')}
        </label>
        <textarea
          id={`recipe-${rIdx}-safetyNotes`}
          className="recipe-form-textarea"
          value={recipe.safetyNotesText ?? ''}
          placeholder={t('gardenInput.form.recipe_safety_notes_placeholder')}
          onChange={(e) => onUpdate('safetyNotesText', e.target.value)}
        />
      </div>
    </div>
  );
}
