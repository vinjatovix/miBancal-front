import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Icon from '../../../shared/components/Icon/Icon';
import {
  DOSAGE_METHODS,
  type DosageMethod
} from '../../../types/GardenInput/GardenInput';
import type {
  GardenInputFormErrors,
  RecipeFormValue
} from '../utils/gardenInputValidation';

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
  function handleAddRecipe() {
    onChange([...recipes, createEmptyRecipe()]);
  }

  function handleRemoveRecipe(index: number) {
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
        <button
          type="button"
          className="recipe-form-section__add-btn"
          onClick={handleAddRecipe}
        >
          <span>+ {t('gardenInput.form.add_recipe')}</span>
        </button>
      </div>

      {recipes.map((recipe, rIdx) => {
        const recipeNameError = errors[`recipes.${rIdx}.name`];
        const ingredientsError = errors[`recipes.${rIdx}.ingredients`];
        const instructionsError = errors[`recipes.${rIdx}.instructions`];
        const dosageMethodError = errors[`recipes.${rIdx}.dosageMethod`];
        const dosageDilutionError = errors[`recipes.${rIdx}.dosageDilution`];
        const dosageFrequencyError = errors[`recipes.${rIdx}.dosageFrequency`];
        const storageDurationError = errors[`recipes.${rIdx}.storageDuration`];
        const storageConditionsError =
          errors[`recipes.${rIdx}.storageConditions`];

        return (
          <div key={rIdx} className="recipe-form-card">
            <div className="recipe-form-card__header">
              <h4>
                {recipe.name ||
                  `${t('gardenInput.form.recipe_name')} #${rIdx + 1}`}
              </h4>
              <button
                type="button"
                className="recipe-form-card__remove-btn"
                onClick={() => handleRemoveRecipe(rIdx)}
                aria-label={`${t('gardenInput.form.remove_recipe')} ${rIdx + 1}`}
              >
                <Icon name="close" decorative />
                <span>{t('gardenInput.form.remove_recipe')}</span>
              </button>
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
                onChange={(e) =>
                  handleUpdateRecipe(rIdx, 'name', e.target.value)
                }
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
                placeholder={t(
                  'gardenInput.form.recipe_description_placeholder'
                )}
                onChange={(e) =>
                  handleUpdateRecipe(rIdx, 'description', e.target.value)
                }
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
                onChange={(e) =>
                  handleUpdateRecipe(rIdx, 'brewTime', e.target.value)
                }
              />
            </div>

            <div className="recipe-form-sub-section">
              <div className="recipe-form-sub-section__header">
                <h5>{t('gardenInput.form.recipe_ingredients')} *</h5>
                <button
                  type="button"
                  className="recipe-form-sub-section__add-btn"
                  onClick={() => handleAddIngredient(rIdx)}
                >
                  <span>+ {t('gardenInput.form.add_ingredient')}</span>
                </button>
              </div>
              {ingredientsError && (
                <span className="recipe-form-error" role="alert">
                  {ingredientsError}
                </span>
              )}

              {recipe.ingredients.map((ing, iIdx) => {
                const itemError =
                  errors[`recipes.${rIdx}.ingredients.${iIdx}.item`];
                const qtyError =
                  errors[`recipes.${rIdx}.ingredients.${iIdx}.quantity`];

                return (
                  <div key={iIdx} className="recipe-form-row">
                    <div className="recipe-form-row__col">
                      <input
                        type="text"
                        className="recipe-form-input"
                        placeholder={t(
                          'gardenInput.form.ingredient_item_placeholder'
                        )}
                        value={ing.item}
                        onChange={(e) =>
                          handleUpdateIngredient(
                            rIdx,
                            iIdx,
                            'item',
                            e.target.value
                          )
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
                          handleUpdateIngredient(
                            rIdx,
                            iIdx,
                            'quantity',
                            e.target.value
                          )
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
                      <button
                        type="button"
                        className="recipe-form-row__remove-btn"
                        onClick={() => handleRemoveIngredient(rIdx, iIdx)}
                        aria-label={`${t('gardenInput.form.remove_ingredient')} ${iIdx + 1}`}
                      >
                        <Icon name="close" decorative />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="recipe-form-sub-section">
              <div className="recipe-form-sub-section__header">
                <h5>{t('gardenInput.form.recipe_instructions')} *</h5>
                <button
                  type="button"
                  className="recipe-form-sub-section__add-btn"
                  onClick={() => handleAddInstruction(rIdx)}
                >
                  <span>+ {t('gardenInput.form.add_instruction')}</span>
                </button>
              </div>
              {instructionsError && (
                <span className="recipe-form-error" role="alert">
                  {instructionsError}
                </span>
              )}

              {recipe.instructions.map((inst, sIdx) => {
                const stepError =
                  errors[`recipes.${rIdx}.instructions.${sIdx}`];

                return (
                  <div key={sIdx} className="recipe-form-row">
                    <div className="recipe-form-row__col">
                      <input
                        type="text"
                        className="recipe-form-input"
                        placeholder={t(
                          'gardenInput.form.instruction_placeholder'
                        )}
                        value={inst}
                        onChange={(e) =>
                          handleUpdateInstruction(rIdx, sIdx, e.target.value)
                        }
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
                      <button
                        type="button"
                        className="recipe-form-row__remove-btn"
                        onClick={() => handleRemoveInstruction(rIdx, sIdx)}
                        aria-label={`${t('gardenInput.form.remove_instruction')} ${sIdx + 1}`}
                      >
                        <Icon name="close" decorative />
                      </button>
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
                    handleUpdateRecipe(
                      rIdx,
                      'dosageMethod',
                      e.target.value as DosageMethod
                    )
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
                  onChange={(e) =>
                    handleUpdateRecipe(rIdx, 'dosageDilution', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleUpdateRecipe(rIdx, 'dosageFrequency', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleUpdateRecipe(rIdx, 'storageDuration', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleUpdateRecipe(
                      rIdx,
                      'storageConditions',
                      e.target.value
                    )
                  }
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
                  onChange={(e) =>
                    handleUpdateRecipe(
                      rIdx,
                      'storageSpoilageSigns',
                      e.target.value
                    )
                  }
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
                placeholder={t(
                  'gardenInput.form.recipe_safety_notes_placeholder'
                )}
                onChange={(e) =>
                  handleUpdateRecipe(rIdx, 'safetyNotesText', e.target.value)
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
