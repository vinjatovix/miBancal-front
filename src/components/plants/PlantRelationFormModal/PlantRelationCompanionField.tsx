import { useId } from 'react';
import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import PlantRelationSearchCombobox from '../../../pages/plantRelations/components/PlantRelationSearchCombobox';
import type { RelationTargetScopeType } from '../../../types/Plants/PlantRelation';
import PlantRelationFamilySelect from './PlantRelationFamilySelect';
import { GENUS_PATTERN, type CompanionDraft } from './plantRelationForm.utils';

interface PlantRelationCompanionFieldProps {
  readonly draft: CompanionDraft;
  readonly availableScopes: readonly RelationTargetScopeType[];
  readonly basePlantId: string;
  readonly onChange: (draft: CompanionDraft) => void;
}

export default function PlantRelationCompanionField({
  draft,
  availableScopes,
  basePlantId,
  onChange
}: PlantRelationCompanionFieldProps) {
  const scopeId = useId();
  const genusId = useId();
  const familyId = useId();
  const genusInvalid =
    draft.genus.trim() !== '' && !GENUS_PATTERN.test(draft.genus.trim());

  return (
    <>
      <div className="plant-relation-form-modal__field">
        <label htmlFor={scopeId} className="plant-relation-form-modal__label">
          {t('plantRelation.curator.companionScope')}
        </label>
        <select
          id={scopeId}
          className="plant-relation-form-modal__select"
          value={draft.scope}
          onChange={(e) =>
            onChange({
              ...draft,
              scope: e.target.value as RelationTargetScopeType
            })
          }
        >
          {availableScopes.map((scope) => (
            <option key={scope} value={scope}>
              {tValue('plantRelation.scopeValues', scope)}
            </option>
          ))}
        </select>
      </div>

      <div className="plant-relation-form-modal__field">
        {draft.scope === 'plant' && (
          <>
            <label className="plant-relation-form-modal__label">
              {t('plantRelation.curator.companionPlant')}
            </label>
            <PlantRelationSearchCombobox
              selectedPlant={draft.plant}
              onSelectPlant={(plant) => onChange({ ...draft, plant })}
              excludePlantId={basePlantId}
            />
          </>
        )}

        {draft.scope === 'genus' && (
          <>
            <label
              htmlFor={genusId}
              className="plant-relation-form-modal__label"
            >
              {t('plantRelation.curator.companionGenus')}
            </label>
            <input
              id={genusId}
              type="text"
              className="plant-relation-form-modal__input"
              value={draft.genus}
              placeholder={t('plantRelation.curator.companionGenusPlaceholder')}
              aria-invalid={genusInvalid}
              onChange={(e) => onChange({ ...draft, genus: e.target.value })}
            />
            {genusInvalid && (
              <p role="alert" className="plant-relation-form-modal__error">
                {t('plantRelation.curator.companionGenusInvalid')}
              </p>
            )}
          </>
        )}

        {draft.scope === 'family' && (
          <>
            <label
              htmlFor={familyId}
              className="plant-relation-form-modal__label"
            >
              {t('plantRelation.curator.companionFamily')}
            </label>
            <PlantRelationFamilySelect
              id={familyId}
              value={draft.familyId}
              onChange={(value) => onChange({ ...draft, familyId: value })}
            />
          </>
        )}

        {draft.scope === 'all' && (
          <p className="plant-relation-form-modal__hint">
            {t('plantRelation.curator.companionAll')}
          </p>
        )}
      </div>
    </>
  );
}
