import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import Icon from '../../../../shared/components/Icon/Icon';
import type { Recipe } from '../../../../types/GardenInput/GardenInput';

import './recipeCard.css';

export interface RecipeCardProps {
  readonly recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <details className="recipe-card" open>
      <summary className="recipe-card__summary">
        <span className="recipe-card__summary-title">
          <Icon name="local_pharmacy" decorative />
          <h3>{recipe.name}</h3>
        </span>
      </summary>

      <div className="recipe-card__content">
        {recipe.description && (
          <p className="recipe-card__description">{recipe.description}</p>
        )}

        {recipe.brewTime && (
          <div className="recipe-card__meta-item">
            <span className="recipe-card__meta-label">
              <Icon name="hourglass_top" decorative />
              {t('gardenInput.recipe.brew_time')}:
            </span>
            <span className="recipe-card__meta-value">{recipe.brewTime}</span>
          </div>
        )}

        <div className="recipe-card__section">
          <h4>{t('gardenInput.recipe.ingredients')}</h4>
          <ul className="recipe-card__ingredients">
            {recipe.ingredients.map((ing, idx) => (
              <li key={`${ing.item}-${idx}`}>
                <span className="recipe-card__ingredient-item">{ing.item}</span>
                <span className="recipe-card__ingredient-qty">
                  {ing.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-card__section">
          <h4>{t('gardenInput.recipe.instructions')}</h4>
          <ol className="recipe-card__instructions">
            {recipe.instructions.map((inst, idx) => (
              <li key={idx}>{inst}</li>
            ))}
          </ol>
        </div>

        <div className="recipe-card__section">
          <h4>{t('gardenInput.recipe.dosage')}</h4>
          <div className="recipe-card__meta-grid">
            <div className="recipe-card__meta-item">
              <span className="recipe-card__meta-label">
                {t('gardenInput.recipe.dosage_method')}:
              </span>
              <span className="recipe-card__meta-value">
                {tValue('gardenInput.dosageMethodValues', recipe.dosage.method)}
              </span>
            </div>
            <div className="recipe-card__meta-item">
              <span className="recipe-card__meta-label">
                {t('gardenInput.recipe.dosage_dilution')}:
              </span>
              <span className="recipe-card__meta-value">
                {recipe.dosage.dilution}
              </span>
            </div>
            <div className="recipe-card__meta-item">
              <span className="recipe-card__meta-label">
                {t('gardenInput.recipe.dosage_frequency')}:
              </span>
              <span className="recipe-card__meta-value">
                {recipe.dosage.frequency}
              </span>
            </div>
          </div>
        </div>

        {recipe.storage && (
          <div className="recipe-card__section">
            <h4>{t('gardenInput.recipe.storage')}</h4>
            <div className="recipe-card__meta-grid">
              <div className="recipe-card__meta-item">
                <span className="recipe-card__meta-label">
                  {t('gardenInput.recipe.storage_duration')}:
                </span>
                <span className="recipe-card__meta-value">
                  {recipe.storage.duration}
                </span>
              </div>
              <div className="recipe-card__meta-item">
                <span className="recipe-card__meta-label">
                  {t('gardenInput.recipe.storage_conditions')}:
                </span>
                <span className="recipe-card__meta-value">
                  {recipe.storage.conditions}
                </span>
              </div>
              {recipe.storage.spoilageSigns && (
                <div className="recipe-card__meta-item">
                  <span className="recipe-card__meta-label">
                    {t('gardenInput.recipe.storage_spoilage')}:
                  </span>
                  <span className="recipe-card__meta-value">
                    {recipe.storage.spoilageSigns}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {recipe.safetyNotes && recipe.safetyNotes.length > 0 && (
          <div className="recipe-card__section">
            <h4>{t('gardenInput.recipe.safety_notes')}</h4>
            <ul className="recipe-card__safety-notes">
              {recipe.safetyNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
